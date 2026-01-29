import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import CombatFeatManager from '@/components/combat-feat-manager'

export default async function CombatFeatsAdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <Header user={session.user} />
      
      <main className="container mx-auto px-4 py-12" suppressHydrationWarning>
        <h1 className="text-4xl font-bold text-white mb-8" suppressHydrationWarning>特技データ管理</h1>
        <CombatFeatManager />
      </main>
    </div>
  )
}
