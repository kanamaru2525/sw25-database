import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (!session.user.isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">管理者画面</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/import/spells"
            className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              魔法データインポート
            </h2>
            <p className="text-slate-300">
              CSVファイルから魔法データを一括登録
            </p>
          </Link>

          <Link
            href="/admin/import/weapons"
            className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              武器データインポート
            </h2>
            <p className="text-slate-300">
              CSVファイルから武器データを一括登録
            </p>
          </Link>

          <Link
            href="/admin/import/armors"
            className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              防具データインポート
            </h2>
            <p className="text-slate-300">
              CSVファイルから防具データを一括登録
            </p>
          </Link>

          <Link
            href="/admin/import/combat-feats"
            className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              特技データインポート
            </h2>
            <p className="text-slate-300">
              CSVファイルから特技データを一括登録
            </p>
          </Link>

          <Link
            href="/admin/import/special-skills"
            className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              その他技能インポート
            </h2>
            <p className="text-slate-300">
              CSVファイルからその他技能データを一括登録
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
