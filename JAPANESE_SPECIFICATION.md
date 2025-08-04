# MyWineMemory PWA - システム仕様書

## 📋 概要

**MyWineMemory** は、ワイン愛好家向けの包括的な学習・記録PWA（Progressive Web App）です。詳細なテイスティング記録、AI分析、ゲーミフィケーション要素を組み合わせた革新的なワイン体験プラットフォームです。

## 🎯 プロジェクト目標

- ワインの知識向上とテイスティングスキル習得支援
- 個人のワイン記録の体系的管理
- AI技術による客観的品質評価の提供
- ゲーミフィケーションによる継続的学習の促進
- ソーシャル機能による知識共有コミュニティの構築

## 🛠 技術仕様

### フロントエンド技術
- **言語**: HTML5, CSS3, JavaScript (ES6+)
- **UI/UX**: Responsive Design, Mobile-First
- **PWA**: Service Worker, Web App Manifest
- **チャートライブラリ**: Chart.js
- **アイコン**: Unicode Emoji + SVG Icons

### バックエンド・インフラ
- **Firebase Services**:
  - Authentication (Google OAuth)
  - Firestore Database
  - Cloud Storage
  - Cloud Functions
  - Hosting
  - Cloud Messaging (Push通知)

### セキュリティ
- HTTPS通信
- Firebase Security Rules
- Content Security Policy
- 暗号化された共有URL (UUID)

## 📱 機能仕様

### 1. ユーザー認証システム
- **Google OAuth**: 簡単ログイン・アカウント管理
- **ユーザープロフィール**: 個人設定・学習統計
- **プライバシー制御**: 記録の公開/非公開切り替え

### 2. ワイン記録システム

#### 基本情報記録
- ワイン名、生産者、ヴィンテージ
- 産地（国、地域、アペラシオン）
- ワインタイプ（赤・白・ロゼ・スパークリング）
- 価格・購入場所・購入日

#### 詳細テイスティング記録
**外観分析 (7項目)**
- 色調: 10段階スライダー
- 濃淡: 5段階評価
- 透明度: 5段階評価
- 粘性: 5段階評価
- エッジの色: テキスト記述
- 泡立ち（スパークリング用）
- 沈殿物の有無

**香りプロファイル (42種類の香り分類)**
- **果実系**: 柑橘類、ベリー類、トロピカルフルーツ等
- **花・植物系**: バラ、スミレ、ハーブ等
- **スパイス系**: 胡椒、シナモン、バニラ等
- **木・土系**: オーク、杉、土壌香等
- **その他**: ミネラル、動物性香等

**味わい分析 (7段階詳細評価)**
- 甘味: 1-5スケール + 糖度タイプ
- 酸味: 1-5スケール + 酸の種類
- タンニン: 1-5スケール + タンニンの質
- ボディ: 1-5スケール
- アルコール感: 1-5スケール
- ミネラル感: 1-5スケール
- バランス: 総合評価

**フィニッシュ・総合評価**
- 余韻の長さ: 短い〜非常に長い (5段階)
- 余韻の質: 自由記述
- 総合評価: ⭐1-5 + 詳細コメント
- ペアリング提案: 推奨料理
- 飲み頃予測: 現在〜将来の飲み頃

### 3. AI分析機能

#### テイスティングノート分析
- **レベル判定**: 初級・中級・上級の自動判定
- **専門用語使用率**: テクニカルタームの分析
- **記述要素チェック**: 外観・香り・味わい・フィニッシュの記述完成度
- **改善提案**: レベル別のアドバイス生成

#### 品質予測システム
- 記述内容による品質スコア算出
- ワインスタイルの自動分類
- 類似ワインの推奨
- テイスティング傾向分析

### 4. クイズ・学習システム

#### 4種類のクイズカテゴリ
1. **基礎知識**: ワイン産地、品種、製法
2. **テイスティング**: 香り、味わいの識別
3. **ペアリング**: 料理とワインの組み合わせ
4. **上級知識**: ヴィンテージ、格付け、専門用語

#### ゲーミフィケーション要素
- **経験値システム**: 活動に応じたXP獲得
- **レベルアップ**: 達成度による段階的進歩
- **アチーブメント**: 特定条件達成での称号獲得
- **連続記録**: ストリーク機能

### 5. Duolingo風スキルツリー

#### 段階的学習システム
- **6つの学習ユニット**: 基礎から上級まで
- **各ユニット15問**: プログレッシブな難易度設定
- **アンロック機能**: 前段階クリアによる次レベル解放
- **復習システム**: 間違えた問題の再出題

#### 学習トラッキング
- ユニット別進捗率
- 正答率統計
- 学習時間記録
- 弱点分野の特定

### 6. 分析ダッシュボード

#### Chart.js による高度な可視化
1. **評価分布**: ⭐別の記録数分布
2. **ワインタイプ別**: 円グラフによる種類比率
3. **月別記録数**: 時系列での活動状況
4. **価格帯分析**: 購入価格の分布状況
5. **産地別記録**: 地域別の記録統計
6. **テイスティング傾向**: レーダーチャートによる嗜好分析

#### 統計サマリー
- 総記録数
- 平均評価
- 平均価格
- 高評価ワイン数

### 7. 管理機能

#### 管理者パネル
- **問題管理**: CRUD機能によるクイズ問題編集
- **ユーザー管理**: アクティブユーザーの監視
- **統計ダッシュボード**: システム全体の利用状況
- **コンテンツ管理**: カテゴリ・レベル別問題分類

### 8. PWA機能

#### オフライン対応
- **Smart Caching**: 重要コンテンツの戦略的キャッシュ
- **データ同期**: オンライン復帰時の自動同期
- **オフライン通知**: 接続状況の明確な表示

#### プッシュ通知
- 学習リマインダー
- 新機能のお知らせ
- 定期的なクイズ挑戦の促進

#### インストール機能
- **Add to Home Screen**: ネイティブアプリライクな起動
- **アプリアイコン**: カスタマイズされたアイコンセット
- **スプラッシュスクリーン**: ブランド一貫性のある起動画面

### 9. ソーシャル機能

#### 記録共有システム
- **プライバシー制御**: 個別記録の公開/非公開設定
- **共有URL生成**: 暗号化されたセキュアなリンク
- **クリップボード連携**: ワンクリックでURL共有

## 🗄 データベース設計

### Firestore Collections

#### users
```javascript
{
  uid: string,
  displayName: string,
  email: string,
  photoURL: string,
  isPublic: boolean,
  createdAt: timestamp,
  lastLoginAt: timestamp,
  
  // 学習統計
  totalXP: number,
  level: number,
  achievements: array,
  learningStats: {
    quizzesTaken: number,
    correctAnswers: number,
    currentStreak: number,
    maxStreak: number
  }
}
```

#### wine_records
```javascript
{
  id: string,
  userId: string,
  
  // 基本情報
  wineName: string,
  producer: string,
  vintage: number,
  region: string,
  wineType: string, // red, white, rose, sparkling
  price: number,
  
  // テイスティング詳細
  appearance: {
    color: number,
    intensity: number,
    clarity: number,
    viscosity: number
  },
  aromas: array, // 選択された香りのID配列
  taste: {
    sweetness: number,
    acidity: number,
    tannin: number,
    body: number,
    alcohol: number
  },
  
  // 評価
  wineRating: number,
  tastingNotes: string,
  
  // メタデータ
  isPublic: boolean,
  shareToken: string, // UUID
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### quiz_questions
```javascript
{
  id: string,
  category: string, // basic, tasting, pairing, advanced
  difficulty: string, // beginner, intermediate, advanced
  question: string,
  options: array,
  correctAnswer: string,
  explanation: string,
  createdAt: timestamp
}
```

#### quiz_results
```javascript
{
  id: string,
  userId: string,
  category: string,
  score: number,
  totalQuestions: number,
  answers: array,
  completedAt: timestamp,
  timeSpent: number
}
```

#### ai_analysis_history
```javascript
{
  id: string,
  userId: string,
  tastingNote: string,
  analysisResult: {
    level: string,
    confidence: number,
    suggestions: array,
    improvements: array
  },
  createdAt: timestamp
}
```

## 🎨 UI/UX設計仕様

### デザインシステム

#### カラーパレット
- **Primary**: #667eea (藍色)
- **Secondary**: #764ba2 (紫色)
- **Accent**: #f093fb (ピンク)
- **Success**: #10b981 (緑色)
- **Warning**: #f59e0b (オレンジ)
- **Error**: #ef4444 (赤色)

#### ダークモード対応
- 自動システム設定検出
- 手動切り替え機能
- localStorage による設定保持

#### レスポンシブブレークポイント
- Mobile: ~768px
- Tablet: 768px~1024px  
- Desktop: 1024px~

### ナビゲーション設計

#### メインナビゲーション
1. **ホーム** (🏠): メイン記録ページ
2. **クイズ** (🧠): 学習クイズページ
3. **分析** (📊): データ分析ダッシュボード
4. **AI分析** (🤖): テイスティング分析
5. **学習進捗** (📈): 個人進捗確認
6. **スキルツリー** (🌳): Duolingo風学習

#### モバイル対応
- ハンバーガーメニュー
- タッチフレンドリーなボタンサイズ
- スワイプジェスチャー対応

## 📊 パフォーマンス仕様

### 目標指標
- **Lighthouse Score**: 95点以上
- **First Contentful Paint**: 1.5秒以内
- **Time to Interactive**: 3秒以内
- **Cumulative Layout Shift**: 0.1以下

### 最適化手法
- **画像最適化**: WebP形式、遅延読み込み
- **コード分割**: 動的インポート
- **キャッシュ戦略**: Service Worker による積極的キャッシュ
- **CDN活用**: Firebase Hosting

## 🔒 セキュリティ仕様

### 認証・認可
- Firebase Authentication
- Google OAuth 2.0
- JWT トークンベース認証

### データ保護
- Firestore Security Rules
- クライアントサイド入力検証
- XSS・CSRF攻撃対策

### プライバシー
- GDPR準拠のデータ処理
- ユーザー主導のデータ削除機能
- 透明性のあるデータ利用方針

## 🧪 テスト仕様

### 単体テスト
- JavaScript関数のテスト
- Firebase エミュレータでのデータベーステスト
- フォーム検証ロジックのテスト

### 統合テスト
- ユーザーフロー全体のテスト
- PWA機能のテスト
- Cross-browser compatibility

### パフォーマンステスト
- Lighthouse による自動測定
- WebPageTest での詳細分析
- モバイルデバイスでの実機テスト

## 🚀 デプロイメント

### 本番環境
- **ホスティング**: Firebase Hosting
- **ドメイン**: カスタムドメイン設定
- **SSL証明書**: 自動管理
- **CDN**: グローバル配信

### CI/CD パイプライン
- Git ベースの自動デプロイ
- プリビュー環境での検証
- 本番前の自動テスト実行

## 📈 監視・分析

### 利用統計
- Google Analytics 4
- Firebase Analytics
- パフォーマンス監視

### エラートラッキング
- JavaScript エラーの自動収集
- サービスワーカーエラーの監視
- ユーザーフィードバック収集

## 🔮 今後の機能拡張予定

### 短期計画 (3ヶ月)
- OpenAI/Groq API を使った実AI分析
- より詳細な統計ダッシュボード
- バックアップ・エクスポート機能

### 中期計画 (6ヶ月)
- ソムリエ向け上級機能
- ワインセラー管理機能
- レコメンドエンジン

### 長期計画 (1年)
- マルチ言語対応
- AR技術によるラベル認識
- コミュニティ機能の拡充

## 📋 運用・保守

### 日常運用
- システム稼働監視
- ユーザーサポート対応
- セキュリティアップデート

### 定期メンテナンス
- データベース最適化
- キャッシュクリア
- バックアップ確認

### 障害対応
- 障害検知・通知システム
- 復旧手順書
- ユーザーコミュニケーション計画

---

**文書バージョン**: 1.0  
**最終更新**: 2025年1月  
**作成者**: Claude Code Assistant  
**承認者**: プロジェクト管理者