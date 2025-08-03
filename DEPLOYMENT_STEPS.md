# 🚀 MyWineMemory PWA デプロイ手順

## ✅ 現在の状況
- ✅ Firebase CLI インストール済み
- ✅ Cloud Functions 依存関係インストール済み
- ✅ Firebase設定ファイル作成済み

## 🔧 残りの手順

### 1. VAPIDキー設定
1. https://console.firebase.google.com/ でプロジェクト `mywinememory` を開く
2. ⚙️ **Project Settings** → **Cloud Messaging** タブ
3. **Web configuration** → **Generate key pair**
4. 生成されたキー（BK...）をコピー
5. `firebase-messaging.js` の17行目を更新：
   ```javascript
   const vapidKey = 'BK8fG2h4Xyz...'; // ←ここに貼り付け
   ```

### 2. アイコン生成
1. ブラウザで `create-icons.html` を開く
2. 「すべてダウンロード」をクリック
3. ダウンロードしたアイコンを `/wine/icons/` フォルダに配置

### 3. Firebase認証・初期設定
```bash
# プロジェクトディレクトリに移動
cd /mnt/c/Product/claude_portfolio/wine

# Firebase にログイン
firebase login

# プロジェクトを選択
firebase use mywinememory
```

### 4. Cloud Functions デプロイ
```bash
# Functions のデプロイ
firebase deploy --only functions

# 成功後、以下のような出力が表示される：
# ✔ Deploy complete!
# Project Console: https://console.firebase.google.com/project/mywinememory/overview
# Function URL (sendDailyQuizNotification): https://...
```

### 5. Hosting デプロイ（PWA配信）
```bash
# Hosting にデプロイ
firebase deploy --only hosting

# アプリURL: https://mywinememory.web.app
```

### 6. Firestore ルール設定
1. Firebase Console → **Firestore Database** → **Rules**
2. 以下のルールを設定：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /wine_records/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /daily_quiz/{quizId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /notification_history/{historyId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if false;
    }
  }
}
```

## 🧪 テスト手順

### 1. 通知テスト
1. アプリにアクセス
2. ログイン
3. 通知許可をクリック
4. ブラウザコンソールで実行：
   ```javascript
   requestNotificationPermission().then(token => console.log('Token:', token));
   ```

### 2. PWAテスト
1. HTTPS でアプリにアクセス
2. ブラウザメニューで「ホーム画面に追加」を確認
3. インストール後、アプリアイコンから起動テスト

### 3. 自動通知テスト
```bash
# Firebase Functions エミュレータ起動
firebase emulators:start --only functions

# 手動で通知関数を実行
firebase functions:shell
> sendDailyQuizNotification()
```

## 📱 通知スケジュール
- **19:00** - 日次クイズ通知
- **21:00** - ストリーク維持通知  
- **日曜20:00** - 週次振り返り
- **新記録+24時間** - フォローアップ

## 🚨 トラブルシューティング

### 通知が来ない場合
1. VAPIDキーが正しく設定されているか確認
2. ブラウザの通知設定を確認
3. Cloud Functions のログを確認：
   ```bash
   firebase functions:log
   ```

### PWAインストールできない場合
1. HTTPS でアクセスしているか確認
2. Service Worker が登録されているか確認（開発者ツール > Application > Service Workers）
3. manifest.json が正しく読み込まれているか確認

## 🎯 成功の確認方法
1. ✅ アプリがPWAとしてインストール可能
2. ✅ 通知許可後、毎日19時に自動通知
3. ✅ 通知をタップしてクイズページに移動
4. ✅ オフラインでも基本機能が動作

---
🍷 **これで完全な自動通知付きワインクイズPWAの完成です！**