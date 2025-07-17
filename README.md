# 超詳細ワイン記録帳

プロレベルのワインテイスティング記録を可能にする、超詳細なワイン記録アプリケーション

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# プレビュー
npm run preview
```

## 📁 プロジェクト構成

```
wine/
├── ultra-advanced-index.html    # メインHTMLファイル
├── ultra-advanced-style.css     # スタイルシート
├── ultra-advanced-script.js     # JavaScript機能
├── index.html                   # リダイレクトページ
├── package.json                 # プロジェクト設定
├── vite.config.js               # Vite設定
├── .gitignore                   # Git除外設定
├── README.md                    # このファイル
├── deployment-guide.md          # デプロイガイド
├── cloudflare-deploy.md         # Cloudflareデプロイ手順
├── aws-deploy.md                # AWSデプロイ手順
└── firebase-setup.md            # Firebase設定ガイド
```

## ✨ 主な機能

### 1. 基本情報記録
- ワイン名、生産者、生産国、生産地域
- ヴィンテージ、価格、ブドウ品種
- アルコール度数、土壌情報、気候
- ワインの歴史・背景、ワインメーカー

### 2. 外観の詳細分析
- **色調**: 紫がかった、ルビー色、ガーネット色、レンガ色、黄色がかった、金色
- **濃淡**: 淡い、中程度、濃い、不透明
- **透明度**: 澄み切った、透明、やや濁った、濁った
- **粘性**: 軽い、中程度、重い、グリセリン様

### 3. 香りの段階別分析
- **第一印象** (スワリング前): 強度評価（1-5）+ 詳細メモ
- **スワリング後**: 強度評価（1-5）+ 詳細メモ
- **香りカテゴリ強度**: 7カテゴリをスライダーで評価
  - 果実系、花系、スパイス系、ハーブ系、土系、木系、その他
- **詳細香り分類**: 42種類の香りをチェックボックスで選択

### 4. 味わいの段階別分析
- **アタック** (第一印象): 強度評価（1-5）+ 詳細メモ
- **中盤** (発展): 複雑さ評価（1-5）+ 詳細メモ
- **フィニッシュ** (余韻): 長さ評価（1-5）+ 秒数計測 + 詳細メモ

### 5. 構成要素の詳細分析
- **酸味**: 強度評価（1-5）+ 種類選択（酒石酸、リンゴ酸、乳酸、クエン酸）
- **タンニン**: 強度評価（1-5）+ 質感選択（シルキー、ベルベット、ざらつき、収斂性）
- **甘味**: 5段階評価（辛口～極甘口）
- **ボディ**: 5段階評価（ライト～フル）

### 6. 時間経過による変化記録
- **記録時間**: 開栓直後、30分後、1時間後、2時間後、1日後、2日後、3日後、カスタム
- **温度**: 具体的な温度記録
- **デキャンタージュ**: 有無の記録
- **変化のメモ**: 時間経過による変化の詳細記録

### 7. 環境・状況情報
- **環境**: 室温、湿度、照明（自然光、暖色系、寒色系、キャンドル、薄暗い）
- **状況**: 気分（リラックス、興奮、集中、疲れ、幸せ、ストレス）
- **社会的要素**: 同席者、特別な機会、場所
- **道具**: グラスの種類（ブルゴーニュ、ボルドー、シャルドネ、シャンパーニュ、ユニバーサル、その他）

### 8. 画像記録
- **ワインの画像**: ボトル写真
- **ペアリング画像**: 料理写真
- **色の画像**: 色調記録用
- **ラベル画像**: ラベル詳細記録

### 9. 参考情報
- 販売元サイトURL
- Dラボ動画URL
- その他参考URL

### 10. データ管理・分析機能
- **レーダーチャート**: 香り特性の7軸視覚化
- **検索・フィルタリング**: 名前、評価、日付での絞り込み
- **並び替え**: 日付順、評価順、名前順
- **データエクスポート**: JSON形式でのバックアップ
- **スマート入力**: 直近4本のワインから基本情報を自動入力

## 🎨 UI/UXの特徴

### レスポンシブデザイン
- モバイル、タブレット、デスクトップ対応
- 画面サイズに応じた最適なレイアウト

### 使いやすさの改善
- プルダウンメニュー → ラジオボタン・チェックボックス
- 十分な縦間隔とスペース
- グリッドレイアウトによる整然とした配置
- ホバーエフェクトによる視覚的フィードバック

### 視覚的な美しさ
- 美しいグラデーション背景
- 色分けされたセクション
- アニメーション効果
- 直感的なアイコンと配色

## 🔧 技術仕様

### フロントエンド
- **HTML5**: セマンティックなマークアップ
- **CSS3**: Flexbox・Grid・カスタムプロパティ
- **JavaScript (ES6+)**: モダンなJavaScript構文
- **Chart.js**: レーダーチャート表示
- **Vite**: 高速な開発サーバー・ビルドツール

### データ保存
- **ローカルストレージ**: ブラウザ内データ保存
- **Firebase対応**: クラウドストレージオプション
- **JSON形式**: データエクスポート・インポート

### 画像処理
- **Base64変換**: 画像のローカル保存
- **プレビュー機能**: アップロード時の即座プレビュー
- **複数画像対応**: 4種類の画像を同時管理

## 📊 データ構造

```javascript
{
  id: "unique-id",
  
  // 基本情報
  wineName: "ワイン名",
  producer: "生産者",
  country: "生産国",
  region: "生産地域",
  vintage: 2020,
  price: 3000,
  wineType: "red|white|rose|sparkling|dessert|fortified",
  grapes: "ブドウ品種",
  alcohol: 14.5,
  soil: "土壌情報",
  climate: "気候",
  history: "ワインの歴史",
  winemaker: "ワインメーカー",
  
  // 外観分析
  colorTone: "purple|ruby|garnet|brick|yellow|golden",
  colorIntensity: "pale|medium|deep|opaque",
  clarity: "brilliant|clear|hazy|cloudy",
  viscosity: "light|medium|heavy|glyceric",
  
  // 香り分析
  firstImpressionIntensity: "1-5",
  firstImpressionNotes: "メモ",
  swirlingIntensity: "1-5",
  swirlingNotes: "メモ",
  
  // 香りスコア
  aromaScores: {
    fruit: 0-5,
    floral: 0-5,
    spice: 0-5,
    herb: 0-5,
    earth: 0-5,
    wood: 0-5,
    other: 0-5
  },
  
  // 詳細香り
  detailedAromas: {
    fruit: ["赤い果実", "黒い果実", ...],
    floral: ["バラ", "スミレ", ...],
    spice: ["コショウ", "シナモン", ...],
    herb: ["ローズマリー", "タイム", ...],
    earth: ["土", "鉱物", ...],
    wood: ["オーク", "樽", ...],
    other: ["バター", "ナッツ", ...]
  },
  
  // 味わい分析
  attackIntensity: "1-5",
  attackNotes: "メモ",
  middleComplexity: "1-5",
  middleNotes: "メモ",
  finishLength: "1-5",
  finishSeconds: 30,
  finishNotes: "メモ",
  
  // 構成要素
  acidityLevel: "1-5",
  acidityTypes: ["酒石酸", "リンゴ酸", ...],
  tanninLevel: "1-5",
  tanninTypes: ["シルキー", "ベルベット", ...],
  sweetnessLevel: "1-5",
  bodyWeight: "1-5",
  
  // 時間経過・環境
  recordTime: "0|30|60|120|1440|2880|4320|custom",
  temperature: 18.5,
  decanted: "no|yes",
  timeChangeNotes: "メモ",
  ambientTemp: 22.0,
  humidity: 60,
  lighting: "natural|warm|cool|candle|dim",
  mood: "relaxed|excited|focused|tired|happy|stress",
  companions: "同席者",
  occasion: "特別な機会",
  location: "場所",
  glassType: "burgundy|bordeaux|chardonnay|champagne|universal|other",
  
  // 参考情報
  saleUrl: "販売元URL",
  dlaboUrl: "DラボURL",
  referenceUrl: "参考URL",
  
  // 記録情報
  recordDate: "2024-01-01",
  daysFromOpening: 0,
  pairing: "ペアリング料理",
  notes: "総合メモ",
  rating: "1-5",
  
  // 画像URL
  wineImageUrl: "base64...",
  pairingImageUrl: "base64...",
  colorImageUrl: "base64...",
  labelImageUrl: "base64...",
  
  // システム情報
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

## 🚀 デプロイメント

### 開発環境
```bash
npm run dev
# http://localhost:3000
```

### 本番環境
複数のデプロイオプションから選択可能：

1. **Cloudflare Pages** (推奨)
   - 完全無料
   - 自動HTTPS
   - 世界最速のCDN
   - Git連携で自動デプロイ

2. **AWS S3 + CloudFront**
   - 企業レベルの可用性
   - 詳細な設定オプション
   - 月額$1-20程度

3. **Firebase Hosting**
   - Google製の高品質CDN
   - 無料枠あり
   - 簡単な設定

4. **Netlify**
   - 無料で高機能
   - 豊富なプラグイン
   - フォーム処理機能

詳細は各デプロイガイドを参照してください。

## 🔒 セキュリティ

### 実装済み対策
- HTTPSの強制
- 入力データのサニタイゼーション
- XSS対策
- 安全なローカルストレージ利用

### 推奨セキュリティ設定
```html
<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline';">
```

## 📈 パフォーマンス

### 最適化機能
- 自動的なコード分割
- 画像の遅延読み込み
- CSS・JSの最小化
- Gzip/Brotli圧縮

### パフォーマンス指標
- **First Contentful Paint**: < 1.5秒
- **Largest Contentful Paint**: < 2.5秒
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5秒

## 🔧 カスタマイズ

### 色テーマの変更
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #ffc107;
  --text-color: #333;
  --background-color: #f8f9fa;
}
```

### 香りカテゴリの追加
```javascript
// ultra-advanced-script.js
const aromaCategories = {
  // 既存カテゴリ...
  newCategory: { name: '新カテゴリ', color: '#ff6b6b' }
};
```

### 言語の変更
HTMLファイル内のテキストを変更することで多言語対応が可能です。

## 🐛 トラブルシューティング

### よくある問題

#### 1. Chart.jsが読み込まれない
```html
<!-- CDNリンクを確認 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### 2. 画像が表示されない
- ローカルストレージの容量制限（通常5-10MB）
- 画像ファイルサイズを確認
- ブラウザのDevToolsでエラーを確認

#### 3. データが保存されない
- ブラウザのローカルストレージ設定を確認
- プライベートモードでの制限
- ストレージ容量の確認

#### 4. レスポンシブレイアウトの問題
- ブラウザキャッシュのクリア
- CSS Grid/Flexboxの対応確認
- 異なるデバイスでのテスト

### デバッグ方法

#### コンソールでのデータ確認
```javascript
// 保存されたデータの確認
console.log(JSON.parse(localStorage.getItem('ultraAdvancedWineRecords')));

// ローカルストレージの使用量確認
const usage = JSON.stringify(localStorage).length;
console.log('LocalStorage usage:', usage, 'bytes');
```

#### ネットワーク確認
- ブラウザのDevTools > Network タブ
- CDNリソースの読み込み状況
- 画像ファイルの読み込み状況

## 🚀 今後の拡張予定

### v3.0 予定機能
- **認証システム**: ユーザー管理機能
- **クラウド同期**: 複数デバイス間での同期
- **ソーシャル機能**: 記録の共有・コメント
- **AI分析**: 味わい予測・推奨機能
- **エクスポート拡張**: PDF、CSV、Excel形式

### v4.0 予定機能
- **ワイナリー情報**: 地図連携・詳細情報
- **価格追跡**: 価格変動のトラッキング
- **在庫管理**: セラー管理機能
- **コミュニティ**: ユーザー間交流
- **モバイルアプリ**: PWA対応

## 🤝 貢献

### 開発に参加する方法
1. リポジトリをフォーク
2. 新機能ブランチを作成
3. 変更をコミット
4. プルリクエストを送信

### 報告・提案
- バグ報告: GitHub Issues
- 機能提案: GitHub Discussions
- セキュリティ問題: メールで報告

## 📄 ライセンス

MIT License

## 📞 サポート

- **GitHub**: Issues・Discussions
- **ドキュメント**: このREADME
- **デプロイガイド**: deployment-guide.md

---

**超詳細ワイン記録帳で、プロレベルのワインテイスティングを記録しましょう！** 🍷✨