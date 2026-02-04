import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { CSVImport } from "@/components/csv-import"
import Link from "next/link"

export default async function ItemsImportPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    redirect('/')
  }

  const sampleHeaders = [
    'itemType',
    'name',
    'category',
    'rank',
    'usage',
    'minStrength',
    'hit',
    'power',
    'critical',
    'extraDamage',
    'range',
    'evasion',
    'defense',
    'price',
    'summary',
    'page',
    'regulation'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12">
        <Link 
          href="/admin/items"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
        >
          ← アイテム管理に戻る
        </Link>

        <CSVImport
          endpoint="/api/admin/import/items"
          title="アイテムデータインポート"
          description="アイテムデータをCSVファイルから一括登録します。"
          sampleHeaders={sampleHeaders}
          fieldNotes={[
            { field: 'itemType', note: 'WEAPON, ARMOR, ACCESSORY' },
            { field: 'rank', note: 'B, A, S, SS' },
            { field: 'regulation', note: '管理画面で登録したレギュレーションのコードまたは名称' },
            { field: 'hit/power/critical/extraDamage/range', note: '武器専用（数値）' },
            { field: 'evasion/defense', note: '防具専用（数値）' }
          ]}
        />
      </main>
    </div>
  )
}
