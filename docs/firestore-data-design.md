# Firebase Firestore データ構造設計

## 概要
現在のlocalStorageベースのデータ構造をFirestoreに移行するための設計ドキュメント。
データの正規化、パフォーマンス最適化、セキュリティを考慮した構造を定義。

## 現在のlocalStorageデータ構造の分析

### 問題点
1. **データ重複**: 同一ワインの基本情報が各記録に重複保存
2. **非正規化**: ワイン情報と記録情報が混在
3. **スケーラビリティ**: 大量データでの検索・フィルタリング性能低下
4. **同期なし**: デバイス間でのデータ共有不可

## Firestore新データ構造

### 1. ユーザー管理
```
users/{userId}
├── displayName: string
├── email: string
├── photoURL: string
├── createdAt: timestamp
├── updatedAt: timestamp
└── preferences: {
    theme: "light" | "dark",
    defaultGlassType: string,
    units: "metric" | "imperial"
}
```

### 2. ワイン基本情報（正規化）
```
users/{userId}/wines/{wineId}
├── wineName: string
├── producer: string
├── country: string
├── region: string
├── vintage: number
├── price: number
├── wineType: "red" | "white" | "rose" | "sparkling" | "dessert" | "fortified"
├── grapes: string
├── alcohol: number
├── soil: string
├── climate: string
├── history: string
├── winemaker: string
├── saleUrl: string
├── dlaboUrl: string
├── referenceUrl: string
├── imageUrls: string[] // Firebase Storage URLs
├── createdAt: timestamp
├── updatedAt: timestamp
├── recordCount: number // 記録数（集計用）
├── lastRecordDate: timestamp // 最新記録日
└── avgRating: number // 平均評価（集計用）
```

### 3. テイスティング記録
```
users/{userId}/wines/{wineId}/records/{recordId}
├── recordDate: timestamp
├── daysFromOpening: number
├── pairing: string
├── notes: string
├── wineRating: number (1-5)
├── pairingRating: number (1-5)
├── 
├── // 外観分析
├── appearance: {
│   colorTone: "purple" | "ruby" | "garnet" | "brick" | "yellow" | "golden" | "pale_yellow",
│   colorIntensity: "pale" | "medium" | "deep" | "opaque" | "light" | "intense",
│   clarity: "brilliant" | "clear" | "hazy" | "cloudy",
│   viscosity: "light" | "medium" | "heavy" | "glyceric"
│ }
├── 
├── // 香り分析
├── aroma: {
│   firstImpression: {
│     intensity: "delicate" | "elegant" | "medium" | "intense" | "very_intense",
│     notes: string
│   },
│   afterSwirling: {
│     intensity: "delicate" | "elegant" | "medium" | "intense" | "very_intense", 
│     notes: string
│   },
│   scores: {
│     fruit: number (0-10),
│     floral: number (0-10),
│     spice: number (0-10),
│     herb: number (0-10),
│     earth: number (0-10),
│     wood: number (0-10),
│     other: number (0-10)
│   },
│   detailed: {
│     fruit: string[],
│     floral: string[],
│     spice: string[],
│     herb: string[],
│     earth: string[],
│     wood: string[],
│     other: string[]
│   },
│   customNotes: string
│ }
├── 
├── // 味わい分析  
├── taste: {
│   attack: {
│     intensity: "delicate" | "elegant" | "sharp" | "strong",
│     notes: string
│   },
│   middle: {
│     complexity: "simple" | "complex" | "very_complex",
│     notes: string
│   },
│   finish: {
│     length: "short" | "medium" | "long" | "very_long",
│     seconds: number,
│     notes: string
│   }
│ }
├── 
├── // 構成要素
├── components: {
│   acidity: {
│     level: "low" | "medium_low" | "medium" | "medium_high" | "high",
│     types: string[] // ["citric", "malic", "lactic", "tartaric"]
│   },
│   tannin: {
│     level: "none" | "low" | "medium_low" | "medium" | "medium_high" | "high",
│     types: string[] // ["silky", "velvety", "fine", "firm", "rough", "astringent"]
│   },
│   sweetness: "dry" | "off_dry" | "medium_dry" | "medium_sweet" | "sweet",
│   body: "light" | "light_plus" | "medium" | "medium_plus" | "full"
│ }
├── 
├── // 時間・環境
├── conditions: {
│   recordTime: "right_after_opening" | "30_minutes_after" | "1_hour_after" | "2_hours_after" | "1_day_after" | "2_days_after" | "3_days_after" | "custom",
│   customTimeMinutes: number,
│   temperature: number,
│   decanted: string,
│   timeChangeNotes: string,
│   environment: {
│     ambientTemp: number,
│     humidity: number,
│     lighting: string,
│     mood: string,
│     companions: string,
│     occasion: string,
│     location: string,
│     glassType: string
│   }
│ }
├── 
├── // 画像・メディア
├── media: {
│   wineImages: string[],    // Firebase Storage URLs
│   pairingImages: string[], // Firebase Storage URLs  
│   friendImages: string[],  // Firebase Storage URLs
│   otherImages: string[],   // Firebase Storage URLs
│   drawings: string[]       // Firebase Storage URLs
│ }
├── 
├── createdAt: timestamp
├── updatedAt: timestamp
└── timestamp: timestamp // 下位互換性用
```

### 4. 集計・統計データ（オプション）
```
users/{userId}/stats/summary
├── totalWines: number
├── totalRecords: number  
├── favoriteRegions: object
├── favoriteProducers: object
├── averageRating: number
├── recordsThisMonth: number
├── recordsThisYear: number
├── topAromas: object
└── updatedAt: timestamp
```

## インデックス設計

### 必要なインデックス
```javascript
// ワイン検索用
wines: [
  { fields: ["wineName", "updatedAt"], order: "desc" },
  { fields: ["producer", "updatedAt"], order: "desc" },
  { fields: ["country", "region", "updatedAt"], order: "desc" },
  { fields: ["wineType", "avgRating"], order: "desc" },
  { fields: ["avgRating"], order: "desc" }
]

// 記録検索用  
records: [
  { fields: ["recordDate"], order: "desc" },
  { fields: ["wineRating"], order: "desc" },
  { fields: ["createdAt"], order: "desc" }
]
```

## セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // ワイン情報
      match /wines/{wineId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        // テイスティング記録
        match /records/{recordId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
      
      // 統計データ
      match /stats/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 移行戦略

### Phase 1: 基本移行
1. **データ変換**: localStorage → Firestore形式
2. **基本CRUD**: 作成・読取・更新・削除
3. **認証**: Firebase Auth統合

### Phase 2: 最適化
1. **画像移行**: Base64 → Firebase Storage
2. **インデックス最適化**: 検索性能向上
3. **リアルタイム同期**: 複数デバイス対応

### Phase 3: 高度機能
1. **統計機能**: 集計データ生成
2. **オフライン対応**: Firestore offline persistence
3. **バックアップ**: 定期的なデータエクスポート

## パフォーマンス考慮事項

### 読み取り最適化
- **ページネーション**: 大量データの分割読み込み
- **複合インデックス**: 効率的な検索クエリ
- **キャッシュ**: よく使うデータのローカルキャッシュ

### 書き込み最適化
- **バッチ処理**: 複数操作の一括実行
- **楽観的更新**: UIの即座更新
- **トランザクション**: データ整合性保証

### ストレージコスト最適化
- **画像圧縮**: Firebase Storageでの自動最適化
- **不要データ削除**: 定期的なクリーンアップ
- **データ階層化**: ホット/コールドデータの分離

## 料金見積もり

### Firestore
- **読み取り**: 50,000回/日 = $0.60/月
- **書き込み**: 10,000回/日 = $1.80/月  
- **削除**: 1,000回/日 = $0.02/月
- **ストレージ**: 1GB = $0.18/月

### Firebase Storage
- **ストレージ**: 5GB = $1.25/月
- **ダウンロード**: 10GB/月 = $1.56/月

### Firebase Auth
- **MAU**: 10,000ユーザー = 無料

**合計見積もり**: 約$5-10/月（中規模利用時）

## 移行チェックリスト

### 準備
- [ ] Firebaseプロジェクト作成
- [ ] セキュリティルール設定
- [ ] インデックス作成
- [ ] テスト環境構築

### 実装
- [ ] Firebase SDK統合
- [ ] 認証システム実装
- [ ] データアクセス層作成
- [ ] CRUD操作実装

### 移行
- [ ] データ変換ツール作成
- [ ] 既存データバックアップ
- [ ] 段階的移行実行
- [ ] 動作確認・テスト

### リリース
- [ ] 本番環境デプロイ
- [ ] ユーザー通知
- [ ] モニタリング設定
- [ ] サポート体制構築