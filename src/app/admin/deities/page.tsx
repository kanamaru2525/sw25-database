import { DeityManager } from '@/components/deity-manager'

export default function DeitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#efefef] mb-8">神の管理</h1>
        <DeityManager />
      </div>
    </div>
  )
}
