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
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <Link
            href="/spells"
            className="group p-6 sm:p-8 bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] hover:border-[#efefef] transition-all hover:shadow-lg hover:shadow-[#efefef]/20"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-[#efefef] mb-2 group-hover:text-[#6d6d6d] transition-colors" suppressHydrationWarning>
              魔法データベース
            </h2>
            <p className="text-sm sm:text-base text-[#6d6d6d]" suppressHydrationWarning>
              真語魔法、操霊魔法、深智魔法など、すべての魔法を検索
            </p>
          </Link>

          <Link
            href="/items"
            className="group p-6 sm:p-8 bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] hover:border-[#efefef] transition-all hover:shadow-lg hover:shadow-[#efefef]/20"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-[#efefef] mb-2 group-hover:text-[#6d6d6d] transition-colors" suppressHydrationWarning>
              アイテムデータベース
            </h2>
            <p className="text-sm sm:text-base text-[#6d6d6d]" suppressHydrationWarning>
              武器、防具、装備品などのアイテムを検索
            </p>
          </Link>

          <Link
            href="/skills"
            className="group p-6 sm:p-8 bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] hover:border-[#efefef] transition-all hover:shadow-lg hover:shadow-[#efefef]/20"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-[#efefef] mb-2 group-hover:text-[#6d6d6d] transition-colors" suppressHydrationWarning>
              特技データベース
            </h2>
            <p className="text-sm sm:text-base text-[#6d6d6d]" suppressHydrationWarning>
              戦闘特技、魔法特技などの特技を検索
            </p>
          </Link>

          <Link
            href="/abilities"
            className="group p-6 sm:p-8 bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] hover:border-[#efefef] transition-all hover:shadow-lg hover:shadow-[#efefef]/20"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-[#efefef] mb-2 group-hover:text-[#6d6d6d] transition-colors" suppressHydrationWarning>
              その他技能データベース
            </h2>
            <p className="text-sm sm:text-base text-[#6d6d6d]" suppressHydrationWarning>
              練技、呪歌、騎芸、賦術などの技能を検索
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
