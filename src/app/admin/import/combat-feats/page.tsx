import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { CSVImport } from "@/components/csv-import"
import Link from "next/link"

export default async function CombatFeatsImportPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    redirect('/')
  }

  const sampleHeaders = [
    'name',
    'type',
    'requirement',
    'target',
    'risk',
    'summary',
    'page',
    'regulation',
    'vagrancy'
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
          endpoint="/api/admin/import/combat-feats"
          title="特技データインポート"
          description="特技データをCSVファイルから一括登録します。"
          sampleHeaders={sampleHeaders}
          fieldNotes={[
            { field: 'type', note: 'PASSIVE, MAJOR, DECLARATION' },
            { field: 'vagrancy', note: 'ヴァグランツかどうか。true/false または 1/0' },
            { field: 'regulation', note: 'Ⅰ, Ⅱ, Ⅲ, DX, ET, ML, MA, BM, AL, RL, BR, BS, AB, BI, DD, US, TS, AZ' }
          ]}
        />
      </main>
    </div>
  )
}
