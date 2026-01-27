import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            href="/spells"
            className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              魔法データベース
            </h2>
            <p className="text-slate-300">
              真語魔法、操霊魔法、深智魔法など、すべての魔法を検索
            </p>
          </Link>

          <Link
            href="/items"
            className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              アイテムデータベース
            </h2>
            <p className="text-slate-300">
              武器、防具、装備品などのアイテムを検索
            </p>
          </Link>

          <Link
            href="/skills"
            className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              特技データベース
            </h2>
            <p className="text-slate-300">
              戦闘特技、魔法特技などの特技を検索
            </p>
          </Link>

          <Link
            href="/abilities"
            className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              その他技能データベース
            </h2>
            <p className="text-slate-300">
              練技、呪歌、騎芸、賦術などの技能を検索
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
