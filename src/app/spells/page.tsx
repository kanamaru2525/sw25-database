import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { SpellSearch } from "@/components/spell-search"

export default async function SpellsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#efefef] mb-8">魔法データベース</h1>
        <SpellSearch />
      </main>
    </div>
  )
}
