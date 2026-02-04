# 動的レギュレーション・その他技能管理システム 実装完了

## 実装概要

Prisma enumベースのハードコードされたカテゴリー（`SkillCategory`、`RegulationType`）から、データベース駆動の動的設定システムへ移行しました。

## 完了した作業

### 1. Prismaスキーマの変更
- **Enumの削除**: `SkillCategory`、`RegulationType`、`FieldType`
- **String型への変更**: カテゴリーやレギュレーションをString型に
- **新規テーブル追加**:
  - `SkillCategoryConfig`: カテゴリー設定（code, name, order）
  - `SkillFieldConfig`: カスタムフィールド設定（fieldType: text/number/boolean/select/textarea）
  - `RegulationConfig`: レギュレーション設定
  - `Deity`: 信仰神テーブル

### 2. マイグレーション
- **実行済みマイグレーション**: `20260203163814_dynamic_skill_config`
- **データベースリセット**: すべての既存データを削除し、新スキーマを適用
- **初期データ投入**: `scripts/init-categories.ts`で以下を作成
  - 9カテゴリー（賦術、呪歌、終律、騎芸、練技、相域、鼓吠、陣律、操気）
  - 呪歌・終律：5フィールド（歌唱、条件、基礎楽素、巧奏値、追加楽素）
  - 騎芸：1フィールド（ペット）
  - 鼓吠：3フィールド（対象、効果、使用タイミング）

### 3. React コンポーネントの更新
#### `src/components/special-skill-manager.tsx`
- カテゴリーをAPIから動的取得
- `category.fields`を使用した動的フィールドレンダリング
- `fieldType`のlowercase比較（`field.fieldType.toLowerCase()`）
- SELECT フィールドのサポート追加

#### `src/components/special-skill-search.tsx`
- カテゴリーラベルをAPIから取得
- ハードコードされた`SKILL_CATEGORY_LABELS`を削除

#### `src/app/admin/special-skills/categories/page.tsx`
- フィールドタイプを文字列ベースに変更
- enum制約のガイダンスを削除

### 4. API ルートの更新
#### 特殊技能CRUD
- **`/api/admin/special-skills/route.ts`**: customFieldsのJSON parse処理追加
- **`/api/admin/special-skills/[id]/route.ts`**: 同上

#### カテゴリー管理
- **`/api/admin/special-skills/categories/route.ts`**: fields relationに変更
- **`/api/admin/special-skills/categories/[categoryId]/route.ts`**: 削除チェック修正
- **`/api/admin/special-skills/categories/create/route.ts`**: fields relation対応
- **`/api/admin/special-skills/categories/[categoryId]/fields/route.ts`**: fieldType lowercase正規化
- **`/api/admin/special-skills/categories/[categoryId]/fields/[fieldId]/route.ts`**: 同上

#### 初期化
- **`/api/admin/special-skills/init/route.ts`**: lowercase fieldType対応
- **`/api/admin/special-skills/categories/seed/route.ts`**: String code対応
- **`/api/admin/special-skills/fields/seed/route.ts`**: lowercase fieldType対応

#### CSV インポート
- **`/api/admin/import/special-skills/route.ts`**: 動的カテゴリーコード受付、customFields JSON parse
- **`/app/admin/import/special-skills/page.tsx`**: CSV形式ガイダンス更新

## 初期化コマンド

```bash
# データベースマイグレーション適用（すでに完了）
npx prisma migrate dev --name dynamic-skill-config

# Prisma Client再生成（すでに完了）
npx prisma generate

# 初期データ投入（すでに完了）
npx tsx scripts/init-categories.ts
```

## 動作確認

1. **開発サーバー起動**:
   ```bash
   npm run dev
   ```

2. **管理画面でカテゴリー確認**:
   - http://localhost:3000/admin/special-skills/categories

3. **特殊技能登録テスト**:
   - http://localhost:3000/admin/special-skills
   - 「呪歌」カテゴリーを選択すると、5つのカスタムフィールドが動的に表示される

4. **CSV インポート**:
   - http://localhost:3000/admin/import/special-skills
   - カテゴリーコード（例：`BARD_SONG`）とcustomFields（JSON形式）を含むCSVをアップロード

## 今後の拡張

### カテゴリー追加方法
1. 管理画面 `/admin/special-skills/categories` でカテゴリー新規作成
2. カスタムフィールドを追加
3. すぐに特殊技能登録フォームで新カテゴリーが利用可能

### レギュレーション動的管理
同様の仕組みで`RegulationConfig`テーブルを管理画面で編集可能にする（今後の実装）

## 技術的な注意点

### Prisma Client 7.x の要件
- **adapter必須**: PrismaClientの初期化には`@prisma/adapter-pg`とPgアダプターが必要
- **環境変数**: `DIRECT_URL`または`DATABASE_URL`必須

### フィールドタイプの正規化
- データベース保存時: lowercase（`text`, `number`, `boolean`, `select`, `textarea`）
- コンポーネント比較時: `field.fieldType.toLowerCase()`で比較

### customFieldsのJSON処理
- データベース: `Json`型（Prismaが自動変換）
- API: POST/PUTで文字列→JSON変換（`JSON.parse()`）、GET時は自動でオブジェクト化

## ファイル一覧

### 変更ファイル（17件）
- `prisma/schema.prisma`
- `src/components/special-skill-manager.tsx`
- `src/components/special-skill-search.tsx`
- `src/app/admin/special-skills/categories/page.tsx`
- `src/app/api/admin/special-skills/route.ts`
- `src/app/api/admin/special-skills/[id]/route.ts`
- `src/app/api/admin/special-skills/categories/route.ts`
- `src/app/api/admin/special-skills/categories/[categoryId]/route.ts`
- `src/app/api/admin/special-skills/categories/create/route.ts`
- `src/app/api/admin/special-skills/categories/[categoryId]/fields/route.ts`
- `src/app/api/admin/special-skills/categories/[categoryId]/fields/[fieldId]/route.ts`
- `src/app/api/admin/import/special-skills/route.ts`
- `src/app/api/admin/special-skills/categories/seed/route.ts`
- `src/app/api/admin/special-skills/fields/seed/route.ts`
- `src/app/api/admin/special-skills/init/route.ts`
- `src/app/admin/import/special-skills/page.tsx`
- `prisma/migrations/20260128155040_add_unified_item_model/migration.sql`（enum cast修正）

### 新規ファイル（2件）
- `scripts/init-categories.ts` - 初期データ投入スクリプト
- `scripts/init-categories.js` - （不要、.tsを使用）
- `IMPLEMENTATION.md` - このドキュメント

### マイグレーション
- `prisma/migrations/20260203163814_dynamic_skill_config/`

## 実装完了日時
2025年2月3日
