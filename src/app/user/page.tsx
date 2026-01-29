import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { prisma } from "@/lib/prisma"
import RegulationPresetManager from "@/components/regulation-preset-manager"

export default async function UserPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // ユーザーのプリセットを取得
  const presets = await prisma.regulationPreset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">マイページ</h1>

        <div className="space-y-8">
          {/* ユーザー情報 */}
          <section className="bg-[#303027]/50 backdrop-blur-sm rounded-xl p-6 border border-[#6d6d6d]">
            <h2 className="text-2xl font-bold text-[#efefef] mb-4">ユーザー情報</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ''}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <p className="text-[#efefef] text-xl">{session.user.name}</p>
                  <p className="text-[#6d6d6d]">{session.user.email}</p>
                  {session.user.isAdmin && (
                    <span className="inline-block mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                      管理者
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* レギュレーションプリセット */}
          <section className="bg-[#303027]/50 backdrop-blur-sm rounded-xl p-6 border border-[#6d6d6d]">
            <h2 className="text-2xl font-bold text-[#efefef] mb-4">レギュレーションプリセット</h2>
            <p className="text-[#6d6d6d] mb-6">
              よく使うレギュレーションの組み合わせを保存して、検索時に素早く適用できます。
            </p>
            <RegulationPresetManager initialPresets={presets} />
          </section>
        </div>
      </main>
    </div>
  )
}
