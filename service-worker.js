const CACHE_NAME = 'wine-memory-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/ultra-advanced-style.css',
  '/ultra-advanced-script-v3-firebase.js',
  '/manifest.json',
  '/quiz.html',
  // Firebase SDKのキャッシュは動的に追加
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// キャッシュからリソースを取得
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにある場合はキャッシュから、ない場合はネットワークから
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// プッシュ通知受信
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const defaultOptions = {
    body: 'ワインクイズで知識をチェックしよう！',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'quiz',
        title: 'クイズに挑戦',
        icon: '/icons/action-quiz.png'
      },
      {
        action: 'close',
        title: '後で',
        icon: '/icons/action-close.png'
      }
    ]
  };

  let notificationData = defaultOptions;

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...defaultOptions,
        body: pushData.body || defaultOptions.body,
        data: {
          ...defaultOptions.data,
          ...pushData.data
        }
      };
    } catch (e) {
      console.error('Failed to parse push data:', e);
    }
  }

  const promiseChain = self.registration.showNotification(
    '🍷 MyWineMemory',
    notificationData
  );

  event.waitUntil(promiseChain);
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  let clickAction = '/';
  
  if (event.action === 'quiz') {
    clickAction = '/quiz.html';
  } else if (event.action === 'close') {
    return; // 何もしない
  } else {
    // 通知本体がクリックされた場合
    clickAction = event.notification.data?.url || '/quiz.html';
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // すでにアプリが開いている場合は、そのタブをフォーカス
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            action: event.action,
            url: clickAction
          });
          return;
        }
      }
      
      // アプリが開いていない場合は新しいタブを開く
      return clients.openWindow(clickAction);
    })
  );
});

// バックグラウンド同期（オフライン時のデータ同期用）
self.addEventListener('sync', (event) => {
  if (event.tag === 'wine-data-sync') {
    event.waitUntil(
      // ワインデータの同期処理
      syncWineData()
    );
  }
});

// データ同期関数
async function syncWineData() {
  try {
    // IndexedDBから未同期のデータを取得
    const unsyncedData = await getUnsyncedWineData();
    
    if (unsyncedData.length > 0) {
      // Firestoreに同期
      await syncToFirestore(unsyncedData);
      console.log('Wine data synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync wine data:', error);
  }
}

// プッシュ通知購読状態の変更
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed');
  
  event.waitUntil(
    // 新しい購読情報でサーバーを更新
    updateSubscription()
  );
});

// 購読情報更新
async function updateSubscription() {
  try {
    const subscription = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'YOUR_VAPID_PUBLIC_KEY' // 実際のVAPIDキーに置き換え
      )
    });
    
    // Firestoreに新しい購読情報を保存
    await saveSubscriptionToFirestore(subscription);
  } catch (error) {
    console.error('Failed to update subscription:', error);
  }
}

// ヘルパー関数
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// メッセージ受信（メインスレッドからの通信用）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker loaded successfully');