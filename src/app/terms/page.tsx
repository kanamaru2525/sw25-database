export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">利用規約</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. サービスの利用</h2>
            <p className="text-slate-300 leading-relaxed">
              本サービスは、ソード・ワールド2.5のデータを検索・閲覧するためのツールです。
              指定されたDiscordサーバーのメンバーのみが利用できます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. 禁止事項</h2>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>本サービスのデータを無断で複製・配布すること</li>
              <li>他のユーザーに迷惑をかける行為</li>
              <li>サービスの運営を妨害する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. 免責事項</h2>
            <p className="text-slate-300 leading-relaxed">
              本サービスは現状のまま提供されます。データの正確性や完全性については保証いたしません。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
