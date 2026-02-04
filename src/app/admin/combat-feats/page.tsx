'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Header } from '@/components/header'
import CombatFeatManager from '@/components/combat-feat-manager'

export default function CombatFeatsAdminPage() {
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
        <h1 className="text-4xl font-bold text-white mb-8">特技データ管理</h1>
        <CombatFeatManager />
      </main>
    </div>
  )
}
