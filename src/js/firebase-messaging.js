// Firebase Cloud Messaging 設定ファイル

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase設定（firebase-config.jsから読み込み）
import { app, db } from './firebase-config.js';

// Messaging インスタンス
const messaging = getMessaging(app);
const auth = getAuth(app);

// VAPID キー（Firebase Console > Project Settings > Cloud Messaging で取得）
// 🔧 TODO: 以下のVAPIDキーを実際の値に置き換えてください
const vapidKey = 'BEk3MdJ-rzzxIYJGUtdh6IUsZmP9ZvkP53mOFfbVXuya_udNlI4U7TzYf_llT8EJGWphs8Z2GrcjGiyXMUBY01A'; // Firebase Console で生成したVAPIDキーをここに貼り付け

// 通知許可とトークン取得
export async function requestNotificationPermission() {
    try {
        console.log('通知許可をリクエスト中...');
        
        // ブラウザの通知許可を確認
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('通知が許可されました');
            
            // FCMトークンを取得
            const currentToken = await getToken(messaging, {
                vapidKey: vapidKey
            });
            
            if (currentToken) {
                console.log('FCMトークン取得成功:', currentToken);
                
                // Firestoreにトークンを保存
                await saveTokenToFirestore(currentToken);
                
                // 通知設定をUIに反映
                updateNotificationUI(true);
                
                return currentToken;
            } else {
                console.log('FCMトークンの取得に失敗しました');
                return null;
            }
        } else {
            console.log('通知が拒否されました');
            updateNotificationUI(false);
            return null;
        }
    } catch (error) {
        console.error('通知許可エラー:', error);
        updateNotificationUI(false);
        return null;
    }
}

// Firestoreにトークンを保存
async function saveTokenToFirestore(token) {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('ユーザーがログインしていません');
            return;
        }
        
        const userRef = doc(db, 'users', user.uid);
        
        await updateDoc(userRef, {
            fcmToken: token,
            notificationsEnabled: true,
            lastTokenUpdate: new Date()
        });
        
        console.log('FCMトークンがFirestoreに保存されました');
    } catch (error) {
        console.error('Firestoreへのトークン保存エラー:', error);
        
        // ドキュメントが存在しない場合は作成
        if (error.code === 'not-found') {
            try {
                await setDoc(userRef, {
                    fcmToken: token,
                    notificationsEnabled: true,
                    lastTokenUpdate: new Date()
                }, { merge: true });
                console.log('ユーザードキュメントを作成してトークンを保存しました');
            } catch (createError) {
                console.error('ユーザードキュメント作成エラー:', createError);
            }
        }
    }
}

// 通知設定の無効化
export async function disableNotifications() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userRef = doc(db, 'users', user.uid);
        
        await updateDoc(userRef, {
            notificationsEnabled: false,
            fcmToken: null
        });
        
        updateNotificationUI(false);
        console.log('通知が無効化されました');
    } catch (error) {
        console.error('通知無効化エラー:', error);
    }
}

// フォアグラウンドでの通知受信処理
onMessage(messaging, (payload) => {
    console.log('フォアグラウンドで通知を受信:', payload);
    
    // カスタム通知を表示
    showCustomNotification(payload);
});

// カスタム通知表示
function showCustomNotification(payload) {
    const { notification, data } = payload;
    
    // 通知バナーを作成
    const notificationBanner = document.createElement('div');
    notificationBanner.className = 'notification-banner';
    notificationBanner.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">🍷</div>
            <div class="notification-text">
                <h4>${notification?.title || 'ワインクイズ'}</h4>
                <p>${notification?.body || 'クイズに挑戦しましょう！'}</p>
            </div>
            <div class="notification-actions">
                <button onclick="handleNotificationClick('${data?.quizId || ''}')">挑戦</button>
                <button onclick="dismissNotification(this)">×</button>
            </div>
        </div>
    `;
    
    // 通知スタイル
    notificationBanner.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 350px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notificationBanner);
    
    // 5秒後に自動で削除
    setTimeout(() => {
        if (notificationBanner.parentNode) {
            notificationBanner.remove();
        }
    }, 5000);
}

// 通知クリック処理
window.handleNotificationClick = function(quizId) {
    if (quizId) {
        // クイズページに移動
        window.location.href = `/quiz.html?id=${quizId}`;
    } else {
        // デフォルトクイズページ
        window.location.href = '/quiz.html';
    }
};

// 通知を閉じる
window.dismissNotification = function(button) {
    const notification = button.closest('.notification-banner');
    if (notification) {
        notification.remove();
    }
};

// 通知UIの更新
function updateNotificationUI(enabled) {
    const notificationStatus = document.getElementById('notificationStatus');
    const notificationToggle = document.getElementById('notificationToggle');
    
    if (notificationStatus) {
        notificationStatus.textContent = enabled ? '通知: ON' : '通知: OFF';
        notificationStatus.className = enabled ? 'notification-enabled' : 'notification-disabled';
    }
    
    if (notificationToggle) {
        notificationToggle.textContent = enabled ? '通知を無効にする' : '通知を有効にする';
        notificationToggle.onclick = enabled ? disableNotifications : requestNotificationPermission;
    }
}

// 通知設定UI作成
export function createNotificationSettingsUI() {
    const settingsHTML = `
        <div class="notification-settings">
            <h3>🔔 プッシュ通知設定</h3>
            <div class="notification-info">
                <p>ワインクイズの通知を受け取って、知識を定着させましょう！</p>
                <div class="notification-controls">
                    <span id="notificationStatus" class="notification-status">通知: OFF</span>
                    <button id="notificationToggle" class="notification-toggle">通知を有効にする</button>
                </div>
            </div>
            
            <div class="notification-schedule" id="notificationSchedule" style="display: none;">
                <h4>通知スケジュール</h4>
                <div class="schedule-options">
                    <label>
                        <input type="time" id="notificationTime" value="19:00">
                        <span>通知時間</span>
                    </label>
                    <label>
                        <select id="notificationFrequency">
                            <option value="daily">毎日</option>
                            <option value="weekdays">平日のみ</option>
                            <option value="weekends">週末のみ</option>
                            <option value="three_times_week">週3回</option>
                        </select>
                        <span>通知頻度</span>
                    </label>
                </div>
                <button id="saveNotificationSettings">設定を保存</button>
            </div>
        </div>
    `;
    
    return settingsHTML;
}

// 通知スケジュール設定保存
export async function saveNotificationSchedule() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const time = document.getElementById('notificationTime')?.value || '19:00';
        const frequency = document.getElementById('notificationFrequency')?.value || 'daily';
        
        const userRef = doc(db, 'users', user.uid);
        
        await updateDoc(userRef, {
            notificationTime: time,
            notificationFrequency: frequency,
            lastSettingsUpdate: new Date()
        });
        
        console.log('通知スケジュールが保存されました');
        
        // 成功メッセージ表示
        showMessage('通知設定が保存されました！', 'success');
        
    } catch (error) {
        console.error('通知設定保存エラー:', error);
        showMessage('設定の保存に失敗しました', 'error');
    }
}

// メッセージ表示ユーティリティ
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 5px;
        color: white;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// CSS アニメーション
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-settings {
        background: white;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .notification-controls {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-top: 10px;
    }
    
    .notification-status {
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 14px;
    }
    
    .notification-enabled {
        background: #4CAF50;
        color: white;
    }
    
    .notification-disabled {
        background: #ccc;
        color: #666;
    }
    
    .notification-toggle {
        background: #667eea;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
    }
    
    .schedule-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin: 15px 0;
    }
    
    .schedule-options label {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
`;

document.head.appendChild(style);

console.log('Firebase Messaging 設定完了');