# デプロイ手順とトラブルシューティング

## Firebase Authentication設定

### 1. 認証ドメインの追加が必要
Firebase Console → Authentication → Settings → Authorized domains で以下を追加：

```
localhost (開発用)
yourdomain.vercel.app (本番用)
```

### 2. 認証方法の有効化
Firebase Console → Authentication → Sign-in method で以下を有効化：
- Email/Password
- Google（オプション）

### 3. Firestore Database設定
Firebase Console → Firestore Database で：
- データベースを作成（テストモードまたは本番モード）
- セキュリティルールを設定

### 4. セキュリティルール例（テスト用）
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /wines/{wineId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        match /records/{recordId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}
```

## Vercel環境変数設定

Vercel Dashboard → Project Settings → Environment Variables：

```
VITE_FIREBASE_API_KEY=AIzaSyB6jnGUsdR9JDTZoDUq_QhM4Gr_gLVp3qA
VITE_FIREBASE_AUTH_DOMAIN=mywinememory.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mywinememory
VITE_FIREBASE_STORAGE_BUCKET=mywinememory.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=179280253269
VITE_FIREBASE_APP_ID=1:179280253269:web:58330b5938412fafc21fdc
VITE_FIREBASE_MEASUREMENT_ID=G-PP1B5425FD
```

## トラブルシューティング

### Authentication Error
- Firebase Consoleで認証ドメインが追加されているか確認
- プロジェクトIDが正しいか確認
- 認証方法が有効化されているか確認

### 404 Error
- index.htmlファイルが存在するか確認
- vercel.jsonのルーティング設定を確認

### Build Error
- 依存関係がpackage.jsonに記載されているか確認
- 環境変数が正しく設定されているか確認