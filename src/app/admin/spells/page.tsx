import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { SpellManager } from "@/components/spell-manager"

export default async function SpellsManagePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12" suppressHydrationWarning>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white" suppressHydrationWarning>魔法データ管理</h1>
          <Link
            href="/admin/deities"
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
          >
            神の管理
          </Link>
        </div>
        <SpellManager />
      </main>
    </div>
  )
}
