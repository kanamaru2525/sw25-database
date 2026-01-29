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
    <header className="border-b border-[#6d6d6d] bg-[#303027]/50 backdrop-blur-sm" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between" suppressHydrationWarning>
        <Link href="/" suppressHydrationWarning>
          <h1 className="text-2xl font-bold text-[#efefef] hover:text-[#6d6d6d] transition-colors cursor-pointer" suppressHydrationWarning>SW2.5 データベース</h1>
        </Link>
        <div className="flex items-center gap-4" suppressHydrationWarning>
          {user.isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
              suppressHydrationWarning
            >
              管理者画面
            </Link>
          )}
          <div className="flex items-center gap-2" suppressHydrationWarning>
            {user.image && (
              <img
                src={user.image}
                alt={user.name || ''}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-[#efefef]" suppressHydrationWarning>{user.name}</span>
          </div>
          <Link
            href="/user"
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
            suppressHydrationWarning
          >
            マイページ
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="px-4 py-2 bg-[#303027] hover:bg-[#6d6d6d] text-[#efefef] border border-[#6d6d6d] rounded-lg transition-colors"
            suppressHydrationWarning
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  )
}
