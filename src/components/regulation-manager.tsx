'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RegulationConfig {
  id: string
  code: string
  name: string
  order: number
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export function RegulationManager() {
  const [regulations, setRegulations] = useState<RegulationConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [editingRegulation, setEditingRegulation] = useState<RegulationConfig | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchRegulations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/regulations')
      const data = await response.json()
      setRegulations(data.regulations)
    } catch (error) {
      console.error('Failed to fetch regulations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegulations()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (regulation: Partial<RegulationConfig>) => {
    try {
      const url = regulation.id
        ? `/api/admin/regulations/${regulation.id}`
        : '/api/admin/regulations'
      const method = regulation.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regulation),
      })

      if (response.ok) {
        setEditingRegulation(null)
        setIsCreating(false)
        showToast(regulation.id ? '保存しました' : '追加しました', 'success')
        fetchRegulations()
      } else {
        showToast('保存に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to save regulation:', error)
      showToast('保存中にエラーが発生しました', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/regulations/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast('削除しました', 'success')
        fetchRegulations()
      } else {
        showToast('削除に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to delete regulation:', error)
      showToast('削除中にエラーが発生しました', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <Link
          href="/admin"
          className="text-[#6d6d6d] hover:text-[#efefef]"
        >
          ← 管理者画面に戻る
        </Link>
        <div className="space-x-2 flex">
          <Link
            href="/admin/import/regulations"
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
          >
            CSVインポート
          </Link>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
          >
            レギュレーションを追加
          </button>
        </div>
      </div>

      {/* トースト通知 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === 'success'
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* レギュレーション一覧 */}
      {loading ? (
        <div className="text-center py-12 text-[#6d6d6d]">読み込み中...</div>
      ) : (
        <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#303027]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6d6d6d] uppercase tracking-wider">
                  コード
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6d6d6d] uppercase tracking-wider">
                  名前
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6d6d6d] uppercase tracking-wider">
                  説明
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6d6d6d] uppercase tracking-wider">
                  表示順
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6d6d6d] uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#6d6d6d]">
              {regulations.map((regulation) => (
                <tr key={regulation.id} className="hover:bg-[#303027]/30">
                  <td className="px-6 py-4 text-[#efefef]">{regulation.code}</td>
                  <td className="px-6 py-4 text-[#efefef]">{regulation.name}</td>
                  <td className="px-6 py-4 text-[#6d6d6d] text-sm">{regulation.description || '-'}</td>
                  <td className="px-6 py-4 text-[#efefef]">{regulation.order}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingRegulation(regulation)}
                      className="text-[#6d6d6d] hover:text-[#efefef]"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(regulation.id)}
                      className="px-3 py-1 bg-[#a44949] hover:bg-[#b85656] text-white rounded transition-colors"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 編集/新規作成モーダル */}
      {(editingRegulation || isCreating) && (
        <RegulationForm
          regulation={editingRegulation}
          onSave={handleSave}
          onCancel={() => {
            setEditingRegulation(null)
            setIsCreating(false)
          }}
        />
      )}
    </div>
  )
}

function RegulationForm({
  regulation,
  onSave,
  onCancel,
}: {
  regulation: RegulationConfig | null
  onSave: (regulation: Partial<RegulationConfig>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<RegulationConfig>>(
    regulation || {
      code: '',
      name: '',
      order: 0,
      description: '',
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#303027] rounded-xl p-6 max-w-md w-full border border-[#6d6d6d]">
        <h2 className="text-2xl font-bold text-[#efefef] mb-6">
          {regulation ? 'レギュレーションを編集' : 'レギュレーションを追加'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              コード
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              placeholder="例: MA, BM, AL"
              className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              名前
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="例: マギテックアクセサリー"
              className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              説明（任意）
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              表示順
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-[#303027] border border-[#6d6d6d] hover:bg-[#6d6d6d] text-[#efefef] rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
