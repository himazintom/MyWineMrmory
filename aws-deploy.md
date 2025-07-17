# AWS S3 + CloudFrontデプロイ手順

## 1. 前準備

### AWS CLIのインストール・設定
```bash
# AWS CLI インストール
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 設定
aws configure
# Access Key ID: [AWSコンソールから取得]
# Secret Access Key: [AWSコンソールから取得]
# Default region: ap-northeast-1
# Default output format: json
```

### 本番用ビルド
```bash
cd /mnt/c/Product/claude_portfolio/wine
npm install
npm run build
```

## 2. S3バケットの作成と設定

### バケット作成
```bash
# バケット名は全世界で一意である必要があります
aws s3 mb s3://wine-records-your-unique-name
```

### 静的ウェブサイトホスティング有効化
```bash
aws s3 website s3://wine-records-your-unique-name \
  --index-document advanced-index.html \
  --error-document advanced-index.html
```

### パブリックアクセス設定
```bash
# バケットポリシーを作成
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wine-records-your-unique-name/*"
    }
  ]
}
EOF

# バケットポリシーを適用
aws s3api put-bucket-policy \
  --bucket wine-records-your-unique-name \
  --policy file://bucket-policy.json
```

### ファイルアップロード
```bash
# distフォルダの内容をS3にアップロード
aws s3 sync ./dist/ s3://wine-records-your-unique-name \
  --delete \
  --cache-control max-age=31536000 \
  --exclude "*.html" \
  --exclude "*.xml" \
  --exclude "*.json"

# HTMLファイルは別途設定
aws s3 sync ./dist/ s3://wine-records-your-unique-name \
  --delete \
  --cache-control max-age=0 \
  --include "*.html" \
  --include "*.xml" \
  --include "*.json"
```

## 3. CloudFrontディストリビューション設定

### CloudFrontディストリビューション作成
```bash
cat > cloudfront-config.json << 'EOF'
{
  "CallerReference": "wine-records-$(date +%s)",
  "DefaultRootObject": "advanced-index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-wine-records",
        "DomainName": "wine-records-your-unique-name.s3.ap-northeast-1.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-wine-records",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    }
  },
  "Comment": "Wine Records Site",
  "Enabled": true,
  "PriceClass": "PriceClass_All"
}
EOF

aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### ディストリビューションのステータス確認
```bash
aws cloudfront list-distributions
```

## 4. 自動デプロイスクリプト

### deploy.sh作成
```bash
cat > deploy.sh << 'EOF'
#!/bin/bash

# 変数設定
BUCKET_NAME="wine-records-your-unique-name"
DISTRIBUTION_ID="YOUR_DISTRIBUTION_ID"

# ビルド
echo "Building..."
npm run build

# S3にアップロード
echo "Uploading to S3..."
aws s3 sync ./dist/ s3://${BUCKET_NAME} \
  --delete \
  --cache-control max-age=31536000 \
  --exclude "*.html" \
  --exclude "*.xml" \
  --exclude "*.json"

aws s3 sync ./dist/ s3://${BUCKET_NAME} \
  --delete \
  --cache-control max-age=0 \
  --include "*.html" \
  --include "*.xml" \
  --include "*.json"

# CloudFrontキャッシュを無効化
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"

echo "Deployment completed!"
EOF

chmod +x deploy.sh
```

## 5. GitHub Actionsでの自動デプロイ（オプション）

### .github/workflows/deploy.yml作成
```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ap-northeast-1
    
    - name: Deploy to S3
      run: |
        aws s3 sync ./dist/ s3://wine-records-your-unique-name \
          --delete \
          --cache-control max-age=31536000 \
          --exclude "*.html"
        aws s3 sync ./dist/ s3://wine-records-your-unique-name \
          --delete \
          --cache-control max-age=0 \
          --include "*.html"
    
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation \
          --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
          --paths "/*"
```

## 6. 費用估算

### S3コスト
- ストレージ: 月$0.023/GB（最初の50TBまで）
- リクエスト: GET $0.0004/1000リクエスト
- データ転送: 月1GBまで無料

### CloudFrontコスト
- データ転送: 月1TBまで無料
- リクエスト: 月10,000,000件まで無料

### 예상 월비용
- 小規模サイト: $1-5/月
- 中規模サイト: $5-20/月

## 7. ドメイン設定（オプション）

### Route 53でドメイン設定
```bash
# ホストゾーン作成
aws route53 create-hosted-zone \
  --name yourdomain.com \
  --caller-reference $(date +%s)

# CNAMEレコード追加
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://change-batch.json
```

## 8. セキュリティ設定

### OAI（Origin Access Identity）設定
```bash
# OAI作成
aws cloudfront create-origin-access-identity \
  --origin-access-identity-config CallerReference=$(date +%s),Comment="Wine Records OAI"

# バケットポリシーを更新してOAIのみアクセス許可
```

## 9. 監視とログ

### CloudWatch設定
- アクセスログ
- エラーログ
- パフォーマンスメトリクス

### コスト監視
- 予算アラート設定
- 使用量監視

## 10. トラブルシューティング

### よくある問題
1. **403エラー**: バケットポリシーを確認
2. **404エラー**: インデックスドキュメント設定を確認
3. **キャッシュ問題**: CloudFrontの無効化を実行

### デバッグコマンド
```bash
# S3バケットの内容確認
aws s3 ls s3://wine-records-your-unique-name --recursive

# CloudFrontディストリビューション確認
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

---

## 完了確認
✅ S3バケット作成・設定  
✅ 静的ウェブサイトホスティング有効化  
✅ CloudFrontディストリビューション作成  
✅ 自動デプロイスクリプト作成  
✅ HTTPSアクセス確認  
✅ パフォーマンステスト  