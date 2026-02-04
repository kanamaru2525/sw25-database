'use client'

import Link from "next/link"
import { signOut } from "next-auth/react"
import { useState } from "react"

interface HeaderProps {
  user: {
    name?: string | null
    image?: string | null
    isAdmin?: boolean
  }
}

export function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-[#6d6d6d] bg-[#303027]/50 backdrop-blur-sm" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between" suppressHydrationWarning>
        <Link href="/" suppressHydrationWarning>
          <h1 className="text-xl sm:text-2xl font-bold text-[#efefef] hover:text-[#6d6d6d] transition-colors cursor-pointer" suppressHydrationWarning>SW2.5 データベース</h1>
        </Link>

        {/* デスクトップメニュー */}
        <div className="hidden md:flex items-center gap-4" suppressHydrationWarning>
          {user.isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors text-sm sm:text-base"
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
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            )}
            <span className="text-[#efefef] text-sm sm:text-base truncate" suppressHydrationWarning>{user.name}</span>
          </div>
          <Link
            href="/user"
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors text-sm sm:text-base"
            suppressHydrationWarning
          >
            マイページ
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="px-4 py-2 bg-[#303027] hover:bg-[#6d6d6d] text-[#efefef] border border-[#6d6d6d] rounded-lg transition-colors text-sm sm:text-base"
            suppressHydrationWarning
          >
            ログアウト
          </button>
        </div>

        {/* モバイルハンバーガーメニュー */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-[#efefef] hover:text-[#6d6d6d] transition-colors"
          suppressHydrationWarning
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* モバイルメニューコンテンツ */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#6d6d6d] bg-[#303027]/80 backdrop-blur-sm" suppressHydrationWarning>
          <div className="container mx-auto px-4 py-4 space-y-2" suppressHydrationWarning>
            {user.isAdmin && (
              <Link
                href="/admin"
                className="block w-full px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors text-sm text-center"
                suppressHydrationWarning
                onClick={() => setIsMenuOpen(false)}
              >
                管理者画面
              </Link>
            )}
            <Link
              href="/user"
              className="block w-full px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors text-sm text-center"
              suppressHydrationWarning
              onClick={() => setIsMenuOpen(false)}
            >
              マイページ
            </Link>
            <div className="flex items-center gap-2 px-4 py-2" suppressHydrationWarning>
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name || ''}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
              )}
              <span className="text-[#efefef] text-xs truncate" suppressHydrationWarning>{user.name}</span>
            </div>
            <button
              onClick={() => {
                setIsMenuOpen(false)
                signOut({ callbackUrl: '/auth/signin' })
              }}
              className="w-full px-4 py-2 bg-[#303027] hover:bg-[#6d6d6d] text-[#efefef] border border-[#6d6d6d] rounded-lg transition-colors text-sm"
              suppressHydrationWarning
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
