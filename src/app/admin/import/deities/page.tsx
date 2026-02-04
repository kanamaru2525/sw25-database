'use client';

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { CSVImport } from "@/components/csv-import"
import Link from "next/link"

const SAMPLE_HEADERS = ['name', 'order'];

const FIELD_NOTES = [
  { field: 'name', note: '神の名前（一意）' },
  { field: 'order', note: 'オプション：表示順序（数値）' },
];

export default function DeitiesImportPage() {
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
          endpoint="/api/admin/import/deities"
          title="神 CSVインポート"
          description="神データをCSVファイルから一括登録します。"
          sampleHeaders={SAMPLE_HEADERS}
          fieldNotes={FIELD_NOTES}
        />
      </main>
    </div>
  );
}
