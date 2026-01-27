'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return '認証設定にエラーがあります。管理者にお問い合わせください。'
      case 'AccessDenied':
        return 'アクセスが拒否されました。指定されたDiscordサーバーのメンバーではない可能性があります。'
      case 'Verification':
        return '認証トークンの検証に失敗しました。'
      default:
        return '認証中にエラーが発生しました。もう一度お試しください。'
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-red-700/50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900/30 mb-4">
            <svg
              className="h-10 w-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            認証エラー
          </h1>
          
          <p className="text-slate-300 mt-4">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          {error === 'AccessDenied' && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-sm text-slate-300">
              <p className="font-semibold mb-2">アクセス条件:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>指定されたDiscordサーバーのメンバーであること</li>
                <li>有効なDiscordアカウントでログインしていること</li>
              </ul>
            </div>
          )}
          
          <Link
            href="/auth/signin"
            className="w-full block text-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            サインインページに戻る
          </Link>
          
          <Link
            href="/"
            className="w-full block text-center px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
