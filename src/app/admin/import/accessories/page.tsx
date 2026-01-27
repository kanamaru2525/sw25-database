import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { CSVImport } from "@/components/csv-import"
import Link from "next/link"

export default async function AccessoriesImportPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    redirect('/')
  }

  const sampleHeaders = [
    'name',
    'usage',
    'price',
    'summary',
    'page',
    'regulation'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12">
        <Link 
          href="/admin"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
        >
          ← 管理者画面に戻る
        </Link>

        <CSVImport
          endpoint="/api/admin/import/accessories"
          title="装備品データインポート"
          description="装備品データをCSVファイルから一括登録します。"
          sampleHeaders={sampleHeaders}
        />
      </main>
    </div>
  )
}
