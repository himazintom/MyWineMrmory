# Firebase設定ガイド

このワイン記録サイトでFirebaseを使用してクラウドストレージを利用する方法を説明します。

## 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：wine-records）
4. Google Analytics を設定（任意）
5. プロジェクトを作成

## 2. Firebase Web アプリの設定

1. Firebase Console でプロジェクトを選択
2. 「Web」アイコンをクリック
3. アプリのニックネームを入力
4. 「Firebase Hosting も設定する」をチェック（任意）
5. 「アプリを登録」をクリック
6. 設定オブジェクトをコピー

## 3. Firestore データベースの設定

1. Firebase Console で「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「テストモードで開始」を選択（開発用）
4. ロケーションを選択（asia-northeast1 推奨）

## 4. Firebase Storage の設定

1. Firebase Console で「Storage」を選択
2. 「使ってみる」をクリック
3. セキュリティルールを設定（開発用）

## 5. HTML に Firebase SDK を追加

`index.html` の `</body>` タグの前に以下を追加：

```html
<!-- Firebase App (the core Firebase SDK) -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>

<!-- Firebase products -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js"></script>
```

## 6. JavaScript で Firebase を設定

`script.js` の `firebaseConfig` を更新：

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// ローカルストレージからFirebaseに切り替え
const useLocalStorage = false;
```

## 7. セキュリティルールの設定

### Firestore ルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wineRecords/{document} {
      allow read, write: if true; // 開発用：本番では認証を追加
    }
  }
}
```

### Storage ルール
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /wine-images/{allPaths=**} {
      allow read, write: if true; // 開発用：本番では認証を追加
    }
  }
}
```

## 8. Firebase Hosting でデプロイ（任意）

1. Firebase CLI をインストール：
```bash
npm install -g firebase-tools
```

2. ログイン：
```bash
firebase login
```

3. プロジェクトを初期化：
```bash
firebase init hosting
```

4. デプロイ：
```bash
firebase deploy
```

## 9. 本番環境での注意事項

- 認証機能を追加（Firebase Auth）
- セキュリティルールを適切に設定
- 画像サイズの制限を設定
- 料金プランを確認

## 10. 代替クラウドストレージ

Firebaseの代わりに以下のサービスも使用可能：

- **Supabase**（PostgreSQL + Storage）
- **AWS S3 + DynamoDB**
- **Cloudinary**（画像特化）
- **Airtable**（簡単な設定）

## 費用について

- Firebase：月間使用量に応じた従量課金
- Firestore：読み取り/書き込み操作数による課金
- Storage：ストレージ容量とダウンロード数による課金
- 無料枠：Firestore（1日50,000回読み取り）、Storage（1GB）

## トラブルシューティング

1. **CORS エラー**：Firebase Hosting を使用するか、開発サーバーを使用
2. **画像アップロード失敗**：ファイルサイズと形式を確認
3. **データが保存されない**：ブラウザの開発者ツールでエラーを確認