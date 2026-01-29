'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Deity {
  id: string
  name: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export function DeityManager() {
  const [deities, setDeities] = useState<Deity[]>([])
  const [loading, setLoading] = useState(false)
  const [editingDeity, setEditingDeity] = useState<Deity | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchDeities = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/deities')
      const data = await response.json()
      setDeities(data.deities)
    } catch (error) {
      console.error('Failed to fetch deities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeities()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (deity: Partial<Deity>) => {
    try {
      const url = deity.id
        ? `/api/admin/deities/${deity.id}`
        : '/api/admin/deities'
      const method = deity.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deity),
      })

      if (response.ok) {
        setEditingDeity(null)
        setIsCreating(false)
        showToast(deity.id ? '保存しました' : '追加しました', 'success')
        fetchDeities()
      } else {
        showToast('保存に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to save deity:', error)
      showToast('保存中にエラーが発生しました', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/deities/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast('削除しました', 'success')
        fetchDeities()
      } else {
        showToast('削除に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to delete deity:', error)
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
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
        >
          神を追加
        </button>
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

      {/* 神一覧 */}
      {loading ? (
        <div className="text-center py-12 text-[#6d6d6d]">読み込み中...</div>
      ) : (
        <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#303027]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6d6d6d] uppercase tracking-wider">
                  名前
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
              {deities.map((deity) => (
                <tr key={deity.id} className="hover:bg-[#303027]/30">
                  <td className="px-6 py-4 text-[#efefef]">{deity.name}</td>
                  <td className="px-6 py-4 text-[#efefef]">{deity.order}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingDeity(deity)}
                      className="text-[#6d6d6d] hover:text-[#efefef]"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(deity.id)}
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
      {(editingDeity || isCreating) && (
        <DeityForm
          deity={editingDeity}
          onSave={handleSave}
          onCancel={() => {
            setEditingDeity(null)
            setIsCreating(false)
          }}
        />
      )}
    </div>
  )
}

function DeityForm({
  deity,
  onSave,
  onCancel,
}: {
  deity: Deity | null
  onSave: (deity: Partial<Deity>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<Deity>>(
    deity || {
      name: '',
      order: 0,
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
          {deity ? '神を編集' : '神を追加'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              名前
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
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
