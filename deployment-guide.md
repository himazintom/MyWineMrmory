# ワイン記録サイト デプロイメントガイド

## 概要

このガイドでは、作成したワイン記録サイトをCloudflare PagesとAWS S3 + CloudFrontの両方にデプロイする方法を説明します。

## 📁 プロジェクト構成

```
wine/
├── advanced-index.html          # メインHTMLファイル
├── advanced-style.css           # スタイルシート
├── advanced-script.js           # JavaScript機能
├── package.json                 # プロジェクト設定
├── vite.config.js              # Vite設定
├── .gitignore                  # Git除外設定
├── cloudflare-deploy.md        # Cloudflare手順書
├── aws-deploy.md               # AWS手順書
└── deployment-guide.md         # このファイル
```

## 🚀 デプロイ方法比較

| 項目 | Cloudflare Pages | AWS S3 + CloudFront |
|------|------------------|----------------------|
| **コスト** | 完全無料 | 月$1-20程度 |
| **設定難易度** | 簡単 | 中程度 |
| **パフォーマンス** | 最高 | 高い |
| **自動デプロイ** | Git連携 | 手動/GitHub Actions |
| **カスタムドメイン** | 無料 | Route 53費用 |
| **SSL証明書** | 自動 | 自動 |

## 🌟 推奨デプロイフロー

### 1. 開発環境でのテスト
```bash
cd /mnt/c/Product/claude_portfolio/wine
npm install
npm run dev
```
→ http://localhost:3000 でアクセス

### 2. 本番ビルドのテスト
```bash
npm run build
npm run preview
```
→ 本番環境と同じ設定でテスト

### 3. Cloudflare Pagesでのデプロイ（推奨）
1. `cloudflare-deploy.md` の手順に従う
2. GitHubにプッシュして自動デプロイ
3. 無料で高速なCDN配信

### 4. AWS S3 + CloudFrontでのデプロイ（学習目的）
1. `aws-deploy.md` の手順に従う
2. AWSの各種サービスを学習
3. 企業レベルのインフラ構築

## 🔧 ローカル開発環境セットアップ

### 必要なツール
```bash
# Node.js確認
node --version  # v18以上推奨

# npm確認
npm --version

# Git確認
git --version
```

### 依存関係のインストール
```bash
cd /mnt/c/Product/claude_portfolio/wine
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```

## 📊 パフォーマンス最適化

### 自動的に適用される最適化
- **Vite**: 自動的なコード分割、Tree Shaking
- **Cloudflare**: Brotli圧縮、HTTP/2、グローバルCDN
- **AWS**: CloudFrontによるキャッシュ最適化

### 手動最適化（必要に応じて）
```javascript
// vite.config.js で追加設定
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['chart.js']
        }
      }
    }
  }
})
```

## 🔒 セキュリティ考慮事項

### 実装済みのセキュリティ
- HTTPSの強制
- XSS対策（入力サニタイゼーション）
- CSRFトークンは不要（静的サイト）

### 追加のセキュリティ設定
```javascript
// Content Security Policy (必要に応じて)
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

## 📈 モニタリング

### Cloudflare Analytics
- 無料でアクセス解析
- パフォーマンス監視
- セキュリティ統計

### AWS CloudWatch
- 詳細なメトリクス
- カスタムダッシュボード
- アラート設定

## 🐛 トラブルシューティング

### よくある問題と解決策

#### Chart.jsが読み込まれない
```html
<!-- CDNリンクを確認 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### 画像が表示されない
```javascript
// ローカルストレージの容量制限を確認
const usage = JSON.stringify(localStorage).length;
console.log('LocalStorage usage:', usage, 'bytes');
```

#### モバイルでレイアウトが崩れる
```css
/* CSSのレスポンシブ設定を確認 */
@media (max-width: 768px) {
  .wine-form { padding: 20px; }
}
```

## 🔄 継続的デプロイメント

### Cloudflare Pages
```bash
# 変更をプッシュすると自動デプロイ
git add .
git commit -m "Update wine records feature"
git push origin main
```

### AWS（GitHub Actions）
```yaml
# .github/workflows/deploy.yml が自動実行
# プッシュ時にS3アップロード + CloudFront無効化
```

## 💡 今後の拡張

### 可能な改善点
1. **認証機能**: Firebase Auth
2. **データベース**: Firebase Firestore
3. **画像最適化**: Cloudinary
4. **PWA化**: Service Worker
5. **多言語対応**: i18n

### 実装例
```javascript
// PWA対応
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## 📝 チェックリスト

### デプロイ前
- [ ] ローカルでビルドテスト済み
- [ ] 全機能の動作確認済み
- [ ] レスポンシブデザイン確認済み
- [ ] ブラウザ互換性確認済み

### デプロイ後
- [ ] HTTPSアクセス確認
- [ ] 全ページの動作確認
- [ ] モバイルでの動作確認
- [ ] パフォーマンステスト実施

## 🎯 まとめ

- **学習目的**: 両方のプラットフォームで試す
- **本番利用**: Cloudflare Pagesが最適
- **企業環境**: AWS S3 + CloudFrontが適している
- **コスト重視**: Cloudflare Pages一択

どちらの方法でも、高品質なワイン記録サイトを公開できます！