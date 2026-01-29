export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. 収集する情報</h2>
            <p className="text-slate-300 leading-relaxed">
              本サービスでは、Discord OAuth認証を通じて以下の情報を収集します：
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
              <li>DiscordユーザーID</li>
              <li>ユーザー名</li>
              <li>メールアドレス</li>
              <li>プロフィール画像</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. 情報の利用目的</h2>
            <p className="text-slate-300 leading-relaxed">
              収集した情報は、サービスの提供、ユーザー認証、およびサービス改善のために利用します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. 情報の第三者提供</h2>
            <p className="text-slate-300 leading-relaxed">
              ユーザーの個人情報を第三者に提供することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. データの保存</h2>
            <p className="text-slate-300 leading-relaxed">
              ユーザーデータはSupabaseのセキュアなデータベースに保存されます。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
