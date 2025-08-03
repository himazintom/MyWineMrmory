# MyWineMemory PWA + 自動通知 セットアップガイド

## 🚀 実装完了済み機能

### ✅ PWA化
- `manifest.json` - アプリマニフェスト
- `service-worker.js` - オフライン対応とプッシュ通知
- PWAインストールプロンプト

### ✅ Firebase Cloud Messaging
- `firebase-messaging.js` - FCM設定とトークン管理
- `firebase-messaging-sw.js` - バックグラウンド通知処理
- 通知許可UI

### ✅ Cloud Functions
- `functions/index.js` - 自動通知システム
- 日次クイズ通知 (毎日19時)
- 週次振り返り通知 (日曜20時)
- ストリーク維持通知 (毎日21時)
- 新ワイン記録後のフォローアップ

## 📋 セットアップ手順

### 1. Firebase プロジェクト設定

#### Firebaseコンソールでの設定
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択
3. **Project Settings > Cloud Messaging** へ移動
4. **Web Push certificates** で **Generate key pair**
5. **VAPID key** をコピー

#### 設定ファイルの更新
```javascript
// firebase-messaging.js の vapidKey を更新
const vapidKey = 'あなたのVAPIDキー';

// firebase-messaging-sw.js の firebaseConfig を更新
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ...その他の設定
};
```

### 2. Cloud Functions デプロイ

```bash
# Firebase CLI インストール (未インストールの場合)
npm install -g firebase-tools

# Firebase プロジェクトにログイン
firebase login

# プロジェクト初期化 (既存プロジェクトの場合はスキップ)
firebase init

# Functions の依存関係インストール
cd functions
npm install
cd ..

# Functions デプロイ
firebase deploy --only functions
```

### 3. Firestore ルール設定

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーデータ
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ワイン記録
    match /wine_records/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // 日次クイズ
    match /daily_quiz/{quizId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // 通知履歴
    match /notification_history/{historyId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if false; // Cloud Functions のみ
    }
  }
}
```

### 4. アプリへの統合

#### メインJSファイルに追加
```javascript
// ultra-advanced-script-v3-firebase.js に追加

import { 
    requestNotificationPermission, 
    createNotificationSettingsUI 
} from './firebase-messaging.js';

// ログイン後に通知設定UIを表示
function showNotificationSettings() {
    const settingsContainer = document.getElementById('userSettings');
    if (settingsContainer) {
        settingsContainer.innerHTML += createNotificationSettingsUI();
        
        // 自動で通知許可をリクエスト（初回のみ）
        const hasRequestedBefore = localStorage.getItem('notificationRequested');
        if (!hasRequestedBefore) {
            setTimeout(() => {
                requestNotificationPermission();
                localStorage.setItem('notificationRequested', 'true');
            }, 3000);
        }
    }
}
```

## 🔧 必要なアイコンファイル

以下のアイコンファイルを `/icons/` ディレクトリに配置してください：

- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)

## 📱 テスト方法

### 1. PWA テスト
1. HTTPSでアプリにアクセス
2. ブラウザの「ホーム画面に追加」を確認
3. オフライン動作をテスト

### 2. 通知テスト
```javascript
// ブラウザコンソールで実行
requestNotificationPermission().then(token => {
    console.log('FCM Token:', token);
});
```

### 3. Cloud Functions テスト
```bash
# エミュレータで実行
firebase emulators:start

# 手動で関数を実行
firebase functions:shell
> sendDailyQuizNotification()
```

## 🎯 通知スケジュール

| 通知タイプ | 時間 | 頻度 | 条件 |
|----------|------|------|------|
| 日次クイズ | 19:00 | 毎日 | 通知有効 & FCMトークンあり |
| ストリーク維持 | 21:00 | 毎日 | 今日未実施 & ストリーク継続中 |
| 週次振り返り | 20:00 | 日曜日 | 今週ワイン記録あり |
| フォローアップ | - | 新記録の24時間後 | 新しいワイン記録作成時 |

## 🚨 トラブルシューティング

### 通知が届かない場合
1. ブラウザの通知設定を確認
2. FCMトークンが正しく保存されているか確認
3. Cloud Functions のログを確認

### PWAがインストールできない場合
1. HTTPSでアクセスしているか確認
2. Service Worker が正しく登録されているか確認
3. manifest.json が有効か確認

## 📈 今後の拡張

- AI評価システム (OpenRouter/Groq)
- Duolingo風学習システム
- 詳細なクイズUI
- スコア・進捗管理
- データ分析・レポート

これで自動通知機能付きPWAの基盤が完成です！🍷