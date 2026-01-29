'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: '設定エラー',
          message: '認証設定にエラーがあります。管理者にお問い合わせください。',
          details: 'NEXTAUTH_URLまたはDiscordの設定が正しくありません。'
        }
      case 'AccessDenied':
        return {
          title: 'アクセス拒否',
          message: '指定されたDiscordサーバーのメンバーではありません。',
          details: 'このアプリケーションにアクセスするには、特定のDiscordサーバーに参加している必要があります。'
        }
      case 'Verification':
        return {
          title: '検証エラー',
          message: '認証トークンの検証に失敗しました。',
          details: 'セッションの有効期限が切れている可能性があります。もう一度ログインしてください。'
        }
      case 'OAuthSignin':
        return {
          title: 'OAuth開始エラー',
          message: 'Discordとの連携開始に失敗しました。',
          details: 'ネットワーク接続を確認するか、しばらく時間をおいて再度お試しください。'
        }
      case 'OAuthCallback':
        return {
          title: 'OAuth コールバックエラー',
          message: 'Discord認証の完了に失敗しました。',
          details: 'Discord側でキャンセルされたか、タイムアウトが発生しました。'
        }
      case 'OAuthCreateAccount':
        return {
          title: 'アカウント作成エラー',
          message: 'データベースへのアカウント登録に失敗しました。',
          details: 'データベース接続に問題がある可能性があります。管理者にお問い合わせください。'
        }
      case 'EmailCreateAccount':
        return {
          title: 'アカウント作成エラー',
          message: 'アカウントの作成に失敗しました。',
          details: 'もう一度お試しいただくか、管理者にお問い合わせください。'
        }
      case 'Callback':
        return {
          title: 'コールバックエラー',
          message: '認証後の処理に失敗しました。',
          details: 'セッションの作成に問題が発生しました。もう一度お試しください。'
        }
      case 'OAuthAccountNotLinked':
        return {
          title: 'アカウントリンクエラー',
          message: 'このメールアドレスは既に別のアカウントに関連付けられています。',
          details: '同じメールアドレスを持つ別の認証方法が存在します。'
        }
      case 'EmailSignin':
        return {
          title: 'メール送信エラー',
          message: '認証メールの送信に失敗しました。',
          details: 'メールアドレスを確認するか、しばらく時間をおいて再度お試しください。'
        }
      case 'CredentialsSignin':
        return {
          title: '認証情報エラー',
          message: '認証情報が正しくありません。',
          details: 'ユーザー名またはパスワードを確認してください。'
        }
      case 'SessionRequired':
        return {
          title: 'セッション必須',
          message: 'このページにアクセスするにはログインが必要です。',
          details: 'セッションの有効期限が切れた可能性があります。'
        }
      default:
        return {
          title: '認証エラー',
          message: '認証中に不明なエラーが発生しました。',
          details: error ? `エラーコード: ${error}` : 'もう一度お試しください。'
        }
    }
  }
  
  const errorInfo = getErrorMessage(error)
  
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
            {errorInfo.title}
          </h1>
          
          <p className="text-slate-300 mt-4 mb-2 font-medium">
            {errorInfo.message}
          </p>
          
          <p className="text-slate-400 text-sm">
            {errorInfo.details}
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

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
