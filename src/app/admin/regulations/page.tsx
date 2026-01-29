import { RegulationManager } from '@/components/regulation-manager'

export default function RegulationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#efefef] mb-8">レギュレーションの管理</h1>
        <RegulationManager />
      </div>
    </div>
  )
}
