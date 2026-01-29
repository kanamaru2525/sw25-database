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
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#efefef] mb-8">管理者画面</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#6d6d6d] mb-6">データ管理</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/spells"
              className="group p-6 bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] hover:border-[#efefef] transition-all hover:shadow-lg hover:shadow-[#efefef]/20"
            >
              <h3 className="text-2xl font-bold text-[#efefef] mb-2 group-hover:text-[#6d6d6d] transition-colors">
                魔法データ管理
              </h3>
              <p className="text-[#6d6d6d]">
                魔法データの閲覧・編集・追加・削除
              </p>
            </Link>

            <Link
              href="/admin/items"
              className="group p-6 bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] hover:border-[#efefef] transition-all hover:shadow-lg hover:shadow-[#efefef]/20"
            >
              <h3 className="text-2xl font-bold text-[#efefef] mb-2 group-hover:text-[#6d6d6d] transition-colors">
                アイテムデータ管理
              </h3>
              <p className="text-[#6d6d6d]">
                武器・防具・装飾品の統合管理
              </p>
            </Link>

            <Link
              href="/admin/combat-feats"
              className="group p-6 bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] hover:border-[#efefef] transition-all hover:shadow-lg hover:shadow-[#efefef]/20"
            >
              <h3 className="text-2xl font-bold text-[#efefef] mb-2 group-hover:text-[#6d6d6d] transition-colors">
                特技データ管理
              </h3>
              <p className="text-[#6d6d6d]">
                特技データの閲覧・編集・追加・削除
              </p>
            </Link>

            <Link
              href="/admin/special-skills"
              className="group p-6 bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] hover:border-[#efefef] transition-all hover:shadow-lg hover:shadow-[#efefef]/20"
            >
              <h3 className="text-2xl font-bold text-[#efefef] mb-2 group-hover:text-[#6d6d6d] transition-colors">
                その他技能データ管理
              </h3>
              <p className="text-[#6d6d6d]">
                その他技能データの閲覧・編集・追加・削除
              </p>
            </Link>

            <Link
              href="/admin/regulations"
              className="group p-6 bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] hover:border-[#efefef] transition-all hover:shadow-lg hover:shadow-[#efefef]/20"
            >
              <h3 className="text-2xl font-bold text-[#efefef] mb-2 group-hover:text-[#6d6d6d] transition-colors">
                レギュレーションの管理
              </h3>
              <p className="text-[#6d6d6d]">
                レギュレーションの追加・編集・削除
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
