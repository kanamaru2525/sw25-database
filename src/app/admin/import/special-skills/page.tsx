import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { CSVImport } from "@/components/csv-import"
import Link from "next/link"

export default async function SpecialSkillsImportPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    redirect('/')
  }

  const sampleHeaders = [
    'categoryCode',
    'level',
    'name',
    'summary',
    'page',
    'regulation',
    'duration',
    'resistance',
    'cost',
    'attribute',
    'target',
    'rangeShape',
    'customFields'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12">
        <Link 
          href="/admin"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
        >
          ← 管理者画面に戻る
        </Link>

        <CSVImport
          endpoint="/api/admin/import/special-skills"
          title="その他技能データインポート"
          description="その他技能データ（練技、呆歌、騎芸など）をCSVファイルから一括登録します。"
          sampleHeaders={sampleHeaders}
          fieldNotes={[
            { field: 'categoryCode', note: 'ENHANCER, BARD_SONG, BARD_FINALE, RIDER, ALCHEMIST, GEOMANCER, WARLEADER_KOUHAI, WARLEADER_JINRITSU, DARKHUNTER' },
            { field: 'level', note: '技能レベル。数値または空欄' },
            { field: 'customFields', note: 'カテゴリ固有のフィールド。JSON形式（例: {"hasSinging":true,"condition":"なし"}）。空欄可' },
            { field: 'regulation', note: 'Ⅰ, Ⅱ, Ⅲ, DX, ET, ML, MA, BM, AL, RL, BR, BS, AB, BI, DD, US, TS, AZ' }
          ]}
        />
      </main>
    </div>
  )
}
