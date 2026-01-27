'use client'

import Link from "next/link"
import { signOut } from "next-auth/react"

interface HeaderProps {
  user: {
    name?: string | null
    image?: string | null
    isAdmin?: boolean
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">SW2.5 データベース</h1>
        <div className="flex items-center gap-4">
          {user.isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              管理者画面
            </Link>
          )}
          <div className="flex items-center gap-2">
            {user.image && (
              <img
                src={user.image}
                alt={user.name || ''}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-white">{user.name}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  )
}
