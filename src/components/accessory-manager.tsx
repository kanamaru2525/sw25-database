'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type RegulationType = 'TYPE_I' | 'TYPE_II' | 'TYPE_III' | 'DX' | 'ET' | 'ML' | 'MA' | 'BM' | 'AL' | 'RL' | 'BR' | 'BS' | 'AB' | 'BI' | 'DD' | 'US' | 'TS'

interface Accessory {
  id: string
  name: string
  usage: string
  price: number
  summary: string
  page: string
  regulation: string
}

const ACCESSORY_USAGES = [
  '1H',
  '2H',
  '頭',
  '顔',
  '耳',
  '首',
  '背中',
  '手',
  '腰',
  '足',
  '任意',
]

const REGULATION_LABELS: Record<RegulationType, string> = {
  TYPE_I: 'Ⅰ',
  TYPE_II: 'Ⅱ',
  TYPE_III: 'Ⅲ',
  DX: 'DX',
  ET: 'ET',
  ML: 'ML',
  MA: 'MA',
  BM: 'BM',
  AL: 'AL',
  RL: 'RL',
  BR: 'BR',
  BS: 'BS',
  AB: 'AB',
  BI: 'BI',
  DD: 'DD',
  US: 'US',
  TS: 'TS',
}

export function AccessoryManager() {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [regulationFilter, setRegulationFilter] = useState('')
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchAccessories = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      if (search) params.append('search', search)
      if (regulationFilter) params.append('regulation', regulationFilter)

      const response = await fetch(`/api/admin/accessories?${params.toString()}`)
      const data = await response.json()
      setAccessories(data.accessories)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch accessories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccessories()
  }, [page, search, regulationFilter])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/accessories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast('削除しました', 'success')
        fetchAccessories()
      } else {
        showToast('削除に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to delete accessory:', error)
      showToast('削除中にエラーが発生しました', 'error')
    }
  }

  const handleSave = async (accessory: Partial<Accessory>) => {
    try {
      const url = accessory.id ? `/api/admin/accessories/${accessory.id}` : '/api/admin/accessories'
      const method = accessory.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessory),
      })

      if (response.ok) {
        setEditingAccessory(null)
        setIsCreating(false)
        showToast(accessory.id ? '保存しました' : '追加しました', 'success')
        fetchAccessories()
      } else {
        showToast('保存に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to save accessory:', error)
      showToast('保存中にエラーが発生しました', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/admin" className="text-purple-400 hover:text-purple-300">
          ← 管理者画面に戻る
        </Link>
        <div className="flex gap-4">
          <Link
            href="/admin/import/accessories"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            CSVインポート
          </Link>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            新規追加
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">レギュレーション</label>
            <select
              value={regulationFilter}
              onChange={(e) => setRegulationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
            >
              <option value="">すべて</option>
              {Object.entries(REGULATION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">名前</label>
            <input
              type="text"
              placeholder="名前で検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white placeholder-slate-400"
            />
          </div>
        </div>

        {(regulationFilter || search) && (
          <button
            onClick={() => {
              setRegulationFilter('')
              setSearch('')
            }}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            フィルターをクリア
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">読み込み中...</div>
      ) : (
        <>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">名前</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">用法</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">価格</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">レギュレーション</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {accessories.map((accessory) => (
                  <tr key={accessory.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-white">{accessory.name}</td>
                    <td className="px-4 py-3 text-slate-300">{accessory.usage}</td>
                    <td className="px-4 py-3 text-slate-300">{accessory.price}G</td>
                    <td className="px-4 py-3 text-slate-300">
                      {REGULATION_LABELS[accessory.regulation as RegulationType] || accessory.regulation}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingAccessory(accessory)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded mr-2"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(accessory.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded"
              >
                前へ
              </button>
              <span className="px-4 py-2 text-slate-300">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}

      {(editingAccessory || isCreating) && (
        <AccessoryForm
          accessory={editingAccessory}
          onSave={handleSave}
          onCancel={() => {
            setEditingAccessory(null)
            setIsCreating(false)
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}

function AccessoryForm({
  accessory,
  onSave,
  onCancel,
}: {
  accessory: Accessory | null
  onSave: (accessory: Partial<Accessory>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<Accessory>>(
    accessory || {
      name: '',
      usage: '',
      price: 0,
      summary: '',
      page: '',
      regulation: 'TYPE_I',
    }
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full my-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          {accessory ? '装備品編集' : '装備品追加'}
        </h2>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">名前</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">用法</label>
              <select
                value={formData.usage}
                onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              >
                <option value="">選択してください</option>
                {ACCESSORY_USAGES.map((usage) => (
                  <option key={usage} value={usage}>{usage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">価格</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">ページ</label>
              <input
                type="text"
                value={formData.page}
                onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">レギュレーション</label>
              <select
                value={formData.regulation}
                onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              >
                {Object.entries(REGULATION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">概要</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                保存中...
              </>
            ) : (
              '保存'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
