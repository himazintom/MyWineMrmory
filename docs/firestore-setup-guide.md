# Firestore Database セットアップガイド

## 🏗️ 1. データベース作成手順

### Step 1: Firebase Console にアクセス
1. [Firebase Console](https://console.firebase.google.com) を開く
2. `MyWineMemory` プロジェクトを選択

### Step 2: Firestore Database を作成
1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」ボタンをクリック

### Step 3: セキュリティルールを選択
**開発用（推奨）:**
```
🔓 テストモードで開始
```
- 30日間有効
- 認証されたユーザーなら誰でもアクセス可能
- 開発・テスト用

**本番用:**
```
🔒 本番モードで開始
```
- 厳格なルール
- 最初からセキュリティを設定

### Step 4: ロケーションを選択
**推奨:** `asia-northeast1 (Tokyo)`
- 日本からのアクセスが高速
- データ保管場所が日本

## 📋 2. セキュリティルール設定

### 開発用ルール（簡単）
Firebase Console → Firestore Database → ルール：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 本番用ルール（安全）
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

## 🗂️ 3. データ構造の確認

### ユーザードキュメント
```
users/{userId}
├── displayName: "田中太郎"
├── email: "tanaka@example.com"
├── createdAt: 2024-01-15T10:00:00.000Z
└── preferences: {
    theme: "light",
    language: "ja"
}
```

### ワイン情報
```
users/{userId}/wines/{wineId}
├── wineName: "シャトー・マルゴー"
├── producer: "シャトー・マルゴー"
├── country: "フランス"
├── region: "ボルドー"
├── wineType: "red"
├── recordCount: 3
├── avgRating: 4.5
└── createdAt: 2024-01-15T10:00:00.000Z
```

### テイスティング記録
```
users/{userId}/wines/{wineId}/records/{recordId}
├── recordDate: "2024-01-15"
├── wineRating: 5
├── pairingRating: 4
├── notes: "素晴らしいワイン"
├── aroma: {
│   scores: { fruit: 9, floral: 3, ... },
│   detailed: { fruit: ["カシス", "プラム"], ... }
│ }
├── taste: {
│   attack: { intensity: "strong", notes: "..." },
│   finish: { length: "very_long", seconds: 45 }
│ }
└── createdAt: 2024-01-15T19:00:00.000Z
```

## 🔧 4. インデックスの作成

### 自動作成されるインデックス
アプリを使用すると、Firebaseが自動的に必要なインデックスを提案します。

### 手動作成が必要なインデックス
Firebase Console → Firestore Database → インデックス：

```
コレクション: users/{userId}/wines
フィールド: updatedAt (降順), wineName (昇順)

コレクション: users/{userId}/wines/{wineId}/records  
フィールド: recordDate (降順)

コレクション: users/{userId}/wines/{wineId}/records
フィールド: wineRating (降順), recordDate (降順)
```

## 🧪 5. テストデータの作成

### 方法1: アプリから作成
1. アプリにログイン
2. 「新しいワインを記録」でテストデータを追加

### 方法2: Firebase Consoleから手動作成
1. Firestore Database → データ
2. 「コレクションを開始」
3. コレクションID: `users`
4. ドキュメントID: あなたのUID
5. フィールドを追加

## ⚠️ 6. 注意事項

### セキュリティ
- **本番環境では必ず本番用ルール**を使用
- APIキーは環境変数で管理
- 定期的にセキュリティルールを見直し

### パフォーマンス
- 大量データの場合はページネーション必須
- 複合クエリにはインデックスが必要
- リアルタイムリスナーは必要最小限に

### コスト
- 読み取り・書き込み・削除ごとに課金
- ストレージ容量でも課金
- [Firebase料金計算ツール](https://firebase.google.com/pricing)で見積もり

## 🚀 7. 次のステップ

1. **データベース作成** ✅
2. **セキュリティルール設定** ✅  
3. **Authentication設定** (認証ドメイン追加)
4. **アプリでテスト** (ログイン・データ作成)
5. **本番用セキュリティルール**に変更