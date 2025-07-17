# Cloudflare Pagesデプロイ手順

## 1. 前準備

### GitHubリポジトリの準備
```bash
cd /mnt/c/Product/claude_portfolio/wine
git init
git add .
git commit -m "Initial commit: Wine records site"
git branch -M main
git remote add origin https://github.com/yourusername/wine-records.git
git push -u origin main
```

## 2. Cloudflare Pagesでのデプロイ

### ステップ1: Cloudflareアカウント作成
1. https://dash.cloudflare.com/ にアクセス
2. 「Sign up」でアカウント作成
3. メール認証を完了

### ステップ2: Pages作成
1. ダッシュボードで「Pages」を選択
2. 「Create a project」をクリック
3. 「Connect to Git」を選択
4. GitHubアカウントを連携
5. リポジトリを選択

### ステップ3: ビルド設定
```
Build command: npm run build
Build output directory: dist
Root directory: /
```

### ステップ4: 環境変数設定（必要に応じて）
```
NODE_VERSION: 18
```

## 3. 自動デプロイの確認

### プッシュでのデプロイ
```bash
# 変更を加える
git add .
git commit -m "Update wine records"
git push origin main
```

### デプロイステータス確認
- Cloudflare Pagesダッシュボードで確認
- ビルドログを確認
- エラーがあれば修正

## 4. カスタムドメイン設定（オプション）

### 独自ドメインの設定
1. 「Custom domains」タブを選択
2. 「Set up a custom domain」をクリック
3. ドメイン名を入力
4. DNSレコードを設定

### SSL証明書
- 自動でLet's Encryptが設定される
- HTTPSが強制される

## 5. パフォーマンス最適化

### 設定されている最適化
- 自動圧縮（Gzip/Brotli）
- HTTP/2対応
- グローバルCDN配信
- 画像最適化

## 6. トラブルシューティング

### よくある問題
1. **ビルドエラー**: package.jsonの依存関係を確認
2. **404エラー**: ルートディレクトリとビルド出力先を確認
3. **JSエラー**: ブラウザのデベロッパーツールで確認

### デバッグ方法
```bash
# ローカルで本番ビルドをテスト
npm run build
npm run preview
```

## 7. 費用
- **完全無料**
- 帯域幅無制限
- ビルド時間無制限
- カスタムドメイン無料

## 8. URL例
- デフォルトURL: `https://wine-records.pages.dev`
- カスタムドメイン: `https://yourdomain.com`

## 9. 管理機能
- アクセス解析
- ビルド履歴
- ロールバック機能
- プレビューURL（PRごと）

---

## 完了確認
✅ GitHubリポジトリ作成  
✅ Cloudflare Pages設定  
✅ 自動デプロイ確認  
✅ HTTPSアクセス確認  
✅ パフォーマンステスト  