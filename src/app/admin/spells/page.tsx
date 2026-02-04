'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { SpellManager } from '@/components/spell-manager'

export default function SpellsManagePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>読み込み中...</div>
  }

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  if (!session.user.isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027]">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">魔法データ管理</h1>
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
