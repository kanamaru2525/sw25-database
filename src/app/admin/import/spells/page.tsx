import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { CSVImport } from "@/components/csv-import"
import Link from "next/link"

export default async function SpellsImportPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    redirect('/')
  }

  const sampleHeaders = [
    'name',
    'type',
    'level',
    'target',
    'range',
    'shape',
    'duration',
    'resistance',
    'cost',
    'attribute',
    'fairyAttributes',
    'deity',
    'biblioRank',
    'summary',
    'magisphere',
    'page',
    'regulation'
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
          endpoint="/api/admin/import/spells"
          title="魔法データインポート"
          description="魔法データをCSVファイルから一括登録します。"
          sampleHeaders={sampleHeaders}
          fieldNotes={[
            { field: 'type', note: 'SHINGO, SOREI, SHINCHI, SHINSEI, MADOKI, YOSEI, SHINRA, SHOI, NARAKU, HIOU' },
            { field: 'fairyAttributes', note: '姖精魔法の属性。カンマ区切りで複数指定（例: 土,水氷,火）。空欄可' },
            { field: 'deity', note: '神聖魔法の神の名前。空欄で全神共通' },
            { field: 'biblioRank', note: '魔導書ランク。数値または空欄' },
            { field: 'magisphere', note: 'LARGE, MEDIUM, SMALL または空欄' },
             { field: 'regulation', note: '管理画面で登録したレギュレーションのコードまたは名称' }
          ]}
        />
      </main>
    </div>
  )
}
