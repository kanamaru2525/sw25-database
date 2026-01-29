'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md w-full">
        {/* メインカード */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* ヘッダー部分 */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              SW2.5データベース
            </h1>
            <p className="text-purple-100 text-sm">
              ソード・ワールド2.5 全データ検索システム
            </p>
          </div>
          
          {/* コンテンツ部分 */}
          <div className="p-8 space-y-6">
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    このアプリケーションにアクセスするには、指定されたDiscordサーバーのメンバーである必要があります。
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => signIn('discord', { callbackUrl: '/' })}
              className="w-full group relative overflow-hidden bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-xl py-4 px-6 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0)">
                    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
                  </g>
                  <defs>
                    <clipPath id="clip0">
                      <rect width="71" height="55" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span className="text-lg">Discordでサインイン</span>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-slate-500 text-xs">セキュア認証</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>
          </div>
        </div>
        
        {/* フッター */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 leading-relaxed">
            サインインすることで、
            <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline decoration-dotted underline-offset-2 transition-colors mx-1">
              利用規約
            </Link>
            と
            <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline decoration-dotted underline-offset-2 transition-colors mx-1">
              プライバシーポリシー
            </Link>
            に同意したことになります。
          </p>
        </div>
      </div>
    </div>
  )
}
