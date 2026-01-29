# Vercelデプロイガイド

## 事前準備

### 1. Supabaseデータベース設定
Supabaseプロジェクトから以下の接続文字列を取得：
- **DATABASE_URL**: Transaction Pooler (Session mode) - `?pgbouncer=true`付き
- **DIRECT_URL**: Direct Connection - `?pgbouncer=false`または接続パラメータなし

### 2. NextAuth Secret生成
```bash
openssl rand -base64 32
```

### 3. Discord OAuth設定（オプション）
Discord Developer Portalで:
- Redirect URL: `https://your-domain.vercel.app/api/auth/callback/discord`
- CLIENT_IDとCLIENT_SECRETを取得

## Vercelデプロイ手順

### ステップ1: Vercelプロジェクト作成
```bash
npm install -g vercel
vercel login
vercel
```

### ステップ2: 環境変数設定
Vercel Dashboardで以下を設定（Settings > Environment Variables）:

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://...?pgbouncer=true` | Production, Preview, Development |
| `DIRECT_URL` | `postgresql://...` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production, Preview |
| `NEXTAUTH_SECRET` | `<openssl生成値>` | Production, Preview, Development |
| `DISCORD_CLIENT_ID` | `<Discord値>` | Production, Preview, Development |
| `DISCORD_CLIENT_SECRET` | `<Discord値>` | Production, Preview, Development |

**重要**: 
- `NEXTAUTH_URL`はProduction環境では自動デプロイURLに設定
- `DATABASE_URL`には必ず`?pgbouncer=true`を付与
- `DIRECT_URL`にはpgbouncerパラメータ不要

### ステップ3: ビルド確認
ローカルで動作確認：
```bash
npm run build
npm start
```

### ステップ4: デプロイ
```bash
vercel --prod
```

## トラブルシューティング

### Prisma Client生成エラー
- `postinstall`スクリプトが自動実行されます
- ビルドコマンドでも`prisma generate`を実行

### データベース接続エラー
- `DATABASE_URL`に`?pgbouncer=true`が付いているか確認
- `DIRECT_URL`にpgbouncerパラメータがないか確認
- Supabaseのデータベース接続設定を確認

### NextAuth認証エラー
- `NEXTAUTH_URL`がVercelのデプロイURLと一致しているか確認
- `NEXTAUTH_SECRET`が正しく設定されているか確認
- Discord OAuth設定のRedirect URLが正しいか確認

## 注意事項

1. **Prisma設定**: 
   - `prisma.config.ts`でDIRECT_URLを優先使用
   - マイグレーション実行時は必ずDIRECT_URLを使用

2. **Next.js設定**:
   - Turbopackは無効化済み（Prismaキャッシュ問題回避）
   
3. **セキュリティ**:
   - `.env.local`はGitにコミットしない
   - 本番環境の環境変数はVercel Dashboardで管理

## 参考リンク
- [Vercel + Next.js](https://vercel.com/docs/frameworks/nextjs)
- [Vercel + Prisma](https://vercel.com/guides/nextjs-prisma-postgres)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
