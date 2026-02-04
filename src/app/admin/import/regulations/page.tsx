'use client';

import { CSVImport } from "@/components/csv-import"
import Link from "next/link"

const SAMPLE_HEADERS = ['code', 'name', 'order', 'description'];

const FIELD_NOTES = [
  { field: 'code', note: '一意なコード（英数字、TYPE_I等）' },
  { field: 'name', note: 'レギュレーション名（日本語推奨）' },
  { field: 'order', note: 'オプション：表示順序（数値、指定なしで行番号）' },
  { field: 'description', note: 'オプション：説明文' },
];

export default function RegulationsImportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <main className="container mx-auto px-4 py-12">
        <Link 
          href="/admin"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
        >
          ← 管理者画面に戻る
        </Link>

        <CSVImport
          endpoint="/api/admin/import/regulations"
          title="レギュレーション CSVインポート"
          description="レギュレーションデータをCSVファイルから一括登録します。"
          sampleHeaders={SAMPLE_HEADERS}
          fieldNotes={FIELD_NOTES}
        />
      </main>
    </div>
  );
}
