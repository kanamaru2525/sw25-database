import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { ArmorManager } from "@/components/armor-manager"

export default async function ArmorsManagePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">防具データ管理</h1>
        <ArmorManager />
      </main>
    </div>
  )
}
