// Firebase Messaging Service Worker
// このファイルは public/ ディレクトリのルートに配置してください

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase設定（firebase-config.jsと同じ設定）
const firebaseConfig = {
  apiKey: "AIzaSyB6jnGUsdR9JDTZoDUq_QhM4Gr_gLVp3qA",
  authDomain: "mywinememory.firebaseapp.com",
  projectId: "mywinememory",
  storageBucket: "mywinememory.firebasestorage.app",
  messagingSenderId: "179280253269",
  appId: "1:179280253269:web:58330b5938412fafc21fdc",
  measurementId: "G-PP1B5425FD"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// Messaging インスタンス
const messaging = firebase.messaging();

// バックグラウンド通知処理
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || '🍷 MyWineMemory';
  const notificationOptions = {
    body: payload.notification?.body || 'ワインクイズで知識をチェックしよう！',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: 'wine-quiz-notification',
    data: {
      url: payload.data?.url || '/quiz.html',
      quizId: payload.data?.quizId || '',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open-quiz',
        title: 'クイズに挑戦',
        icon: '/icons/action-quiz.png'
      },
      {
        action: 'dismiss',
        title: '後で',
        icon: '/icons/action-dismiss.png'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: true, // ユーザーが操作するまで表示
    silent: false
  };

  // 通知を表示
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  let urlToOpen = '/';
  
  if (event.action === 'open-quiz') {
    const quizId = event.notification.data?.quizId;
    urlToOpen = quizId ? `/quiz.html?id=${quizId}` : '/quiz.html';
  } else if (event.action === 'dismiss') {
    // 何もしない（通知を閉じるだけ）
    return;
  } else {
    // 通知本体がクリックされた場合
    urlToOpen = event.notification.data?.url || '/quiz.html';
  }
  
  // アプリを開く
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // 既に開いているタブがあるかチェック
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const clientUrl = new URL(client.url);
        
        if (clientUrl.origin === self.location.origin) {
          // 既に開いているタブをフォーカスして、ページを変更
          client.focus();
          client.postMessage({
            type: 'NAVIGATE_TO',
            url: urlToOpen
          });
          return;
        }
      }
      
      // 開いているタブがない場合は新しいタブを開く
      return clients.openWindow(urlToOpen);
    })
  );
});

// プッシュ受信時の処理（より詳細な制御が必要な場合）
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('Push data received:', data);
    
    // カスタム通知ロジック
    if (data.type === 'wine-quiz') {
      const options = {
        body: `${data.wineName}について覚えていますか？`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        data: {
          quizId: data.quizId,
          wineName: data.wineName
        },
        actions: [
          {
            action: 'quick-quiz',
            title: '今すぐクイズ',
            icon: '/icons/action-quiz.png'
          }
        ]
      };
      
      event.waitUntil(
        self.registration.showNotification(
          `🍷 ${data.wineName}クイズ`,
          options
        )
      );
    }
  }
});

// 通知が閉じられた時の処理
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
  
  // 分析用のデータ送信（オプション）
  const data = {
    action: 'notification_closed',
    tag: event.notification.tag,
    timestamp: Date.now()
  };
  
  // 分析エンドポイントに送信（実装は任意）
  // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) });
});

console.log('Firebase Messaging Service Worker loaded successfully');