import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import SpecialSkillManager from '@/components/special-skill-manager'

export default async function SpecialSkillsAdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <Header user={session.user} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">その他技能データ管理</h1>
          <a 
            href="/admin/special-skills/categories"
            className="px-6 py-3 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
          >
            カテゴリー・フィールド管理
          </a>
        </div>
        <SpecialSkillManager />
      </main>
    </div>
  )
}
