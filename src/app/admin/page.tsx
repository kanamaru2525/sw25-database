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
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-400 mb-6">データ管理</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/spells"
              className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                魔法データ管理
              </h3>
              <p className="text-slate-300">
                魔法データの閲覧・編集・追加・削除
              </p>
            </Link>

            <Link
              href="/admin/weapons"
              className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                武器データ管理
              </h3>
              <p className="text-slate-300">
                武器データの閲覧・編集・追加・削除
              </p>
            </Link>

            <Link
              href="/admin/armors"
              className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                防具データ管理
              </h3>
              <p className="text-slate-300">
                防具データの閲覧・編集・追加・削除
              </p>
            </Link>

            <Link
              href="/admin/accessories"
              className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                装備品データ管理
              </h3>
              <p className="text-slate-300">
                装備品データの閲覧・編集・追加・削除
              </p>
            </Link>

            <Link
              href="/admin/combat-feats"
              className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                特技データ管理
              </h3>
              <p className="text-slate-300">
                特技データの閲覧・編集・追加・削除
              </p>
            </Link>

            <Link
              href="/admin/special-skills"
              className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                その他技能データ管理
              </h3>
              <p className="text-slate-300">
                その他技能データの閲覧・編集・追加・削除
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
