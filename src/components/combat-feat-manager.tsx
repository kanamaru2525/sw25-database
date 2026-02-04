'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type FeatType = 'PASSIVE' | 'MAJOR' | 'DECLARATION'

interface CombatFeat {
  id: number
  type: FeatType
  name: string
  requirement: string | null
  target: string | null
  risk: string | null
  summary: string
  page: string
  regulation: string
  vagrancy: boolean
}

interface Regulation {
  code: string
  name: string
}

const FEAT_TYPE_LABELS: Record<FeatType, string> = {
  PASSIVE: '常動',
  MAJOR: '主動作',
  DECLARATION: '宣言',
}

const FEAT_TYPES: FeatType[] = ['PASSIVE', 'MAJOR', 'DECLARATION']

export default function CombatFeatManager() {
  const [feats, setFeats] = useState<CombatFeat[]>([])
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [includeVagrancy, setIncludeVagrancy] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFeat, setEditingFeat] = useState<CombatFeat | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const [formData, setFormData] = useState<Partial<CombatFeat>>({
    type: 'PASSIVE',
    name: '',
    requirement: '',
    target: '',
    risk: '',
    summary: '',
    page: '',
    regulation: '',
    vagrancy: false,
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchRegulations = async () => {
    try {
      const response = await fetch('/api/regulations')
      const data = await response.json()
      setRegulations(data.regulations || [])
    } catch (error) {
      console.error('Failed to fetch regulations:', error)
      setRegulations([])
    }
  }

  const fetchFeats = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search,
        includeVagrancy: includeVagrancy.toString(),
      })
      const response = await fetch(`/api/admin/combat-feats?${params}`)
      const data = await response.json()
      setFeats(data.feats || [])
    } catch (error) {
      console.error('Failed to fetch feats:', error)
      setFeats([])
      showToast('データの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegulations()
    fetchFeats()
  }, [search, includeVagrancy])

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const openModal = (feat?: CombatFeat) => {
    if (feat) {
      setEditingFeat(feat)
      setFormData(feat)
    } else {
      setEditingFeat(null)
      setFormData({
        type: 'PASSIVE',
        name: '',
        requirement: '',
        target: '',
        risk: '',
        summary: '',
        page: '',
        regulation: '',
        vagrancy: false,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingFeat(null)
    setFormData({
      type: 'PASSIVE',
      name: '',
      requirement: '',
      target: '',
      risk: '',
      summary: '',
      page: '',
      regulation: '',
      vagrancy: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingFeat
        ? `/api/admin/combat-feats/${editingFeat.id}`
        : '/api/admin/combat-feats'
      const method = editingFeat ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save')

      showToast(
        editingFeat ? '更新しました' : '作成しました',
        'success'
      )
      closeModal()
      fetchFeats()
    } catch (error) {
      console.error('Failed to save feat:', error)
      showToast('保存に失敗しました', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/combat-feats/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      showToast('削除しました', 'success')
      fetchFeats()
    } catch (error) {
      console.error('Failed to delete feat:', error)
      showToast('削除に失敗しました', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast通知 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-[#efefef] animate-slide-up z-50 ${
            toast.type === 'success' ? 'bg-[#6d6d6d]' : 'bg-[#303027] border border-[#6d6d6d]'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <Link
          href="/admin"
          className="text-[#6d6d6d] hover:text-[#efefef] text-sm sm:text-base"
        >
          ← 管理者画面に戻る
        </Link>
        <div className="flex gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
          <Link
            href="/admin/import/combat-feats"
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors text-center text-sm sm:text-base"
          >
            CSVインポート
          </Link>
          <button
            onClick={() => openModal()}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors text-sm sm:text-base"
          >
            新規追加
          </button>
        </div>
      </div>

      {/* 検索 */}
      <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl p-4 border border-[#6d6d6d]">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="text"
            placeholder="名前で検索..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:flex-1 px-4 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded-lg text-[#efefef] placeholder-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d] text-sm"
          />
          <label className="flex items-center gap-2 text-[#efefef] cursor-pointer whitespace-nowrap text-sm">
            <input
              type="checkbox"
              checked={includeVagrancy}
              onChange={(e) => setIncludeVagrancy(e.target.checked)}
              className="w-4 h-4 rounded border-[#6d6d6d] bg-[#303027]/50 checked:bg-[#6d6d6d]"
            />
            <span>ヴァグランツを含む</span>
          </label>
        </div>
      </div>

      {/* データ一覧 */}
      {loading ? (
        <div className="text-center py-12 text-[#6d6d6d]">読み込み中...</div>
      ) : (
        <>
          <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] overflow-x-auto">
            <table className="w-full min-w-full text-sm sm:text-base">
              <thead className="bg-[#6d6d6d]/50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#efefef]">名前</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#efefef]">タイプ</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#efefef]">前提</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#efefef]">対象</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#efefef]">リスク</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#efefef]">レギュ</th>
                  <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-[#efefef]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6d6d6d]">
                {feats?.map((feat) => (
                  <tr key={feat.id} className="hover:bg-[#6d6d6d]/30">
                    <td className="px-2 sm:px-4 py-3 text-[#efefef] text-xs sm:text-sm">{feat.name}</td>
                    <td className="px-2 sm:px-4 py-3 text-[#6d6d6d] text-xs sm:text-sm">
                      {FEAT_TYPE_LABELS[feat.type]}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-[#6d6d6d] text-xs sm:text-sm">{feat.requirement || '-'}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-[#6d6d6d] text-xs sm:text-sm">{feat.target || '-'}</td>
                    <td className="hidden lg:table-cell px-4 py-3 text-[#6d6d6d] text-xs sm:text-sm">{feat.risk || '-'}</td>
                    <td className="px-2 sm:px-4 py-3 text-[#6d6d6d] text-xs sm:text-sm">{feat.regulation}</td>
                    <td className="px-2 sm:px-4 py-3 text-right">
                      <button
                        onClick={() => openModal(feat)}
                        className="px-2 sm:px-3 py-1 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors text-xs sm:text-sm mr-1 sm:mr-2 whitespace-nowrap"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(feat.id)}
                        className="px-2 sm:px-3 py-1 bg-[#a44949] hover:bg-[#b85656] text-white rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* ページネーション */}
          {/* TODO: ページ数・API対応後に有効化。下記はUI例。 */}
          {/*
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#efefef] hover:text-[#303027] rounded"
              >
                前へ
              </button>
              <span className="px-4 py-2 text-[#6d6d6d]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#efefef] hover:text-[#303027] rounded"
              >
                次へ
              </button>
            </div>
          )}
          */}
        </>
      )}

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#303027] rounded-xl p-4 sm:p-6 max-w-2xl w-full my-8 border border-[#6d6d6d]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#efefef] mb-6">
              {editingFeat ? '特技編集' : '特技作成'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#efefef] mb-2">
                    名前 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#efefef] mb-2">
                    タイプ *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as FeatType,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef] text-sm"
                    required
                  >
                    {FEAT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {FEAT_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#efefef] mb-2">
                    前提
                  </label>
                  <input
                    type="text"
                    value={formData.requirement || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirement: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#efefef] mb-2">
                    対象
                  </label>
                  <input
                    type="text"
                    value={formData.target || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, target: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#efefef] mb-2">
                    リスク
                  </label>
                  <input
                    type="text"
                    value={formData.risk || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, risk: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#efefef] mb-2">
                    ページ *
                  </label>
                  <input
                    type="text"
                    value={formData.page}
                    onChange={(e) =>
                      setFormData({ ...formData, page: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef] text-sm"
                    required
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-[#efefef] mb-2">
                    概要 *
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef] text-sm"
                    rows={3}
                    required
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-[#efefef] mb-2">
                    レギュレーション *
                  </label>
                  <select
                    value={formData.regulation || (regulations.length > 0 ? regulations[0].code : '')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        regulation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef] text-sm"
                    required
                  >
                    {regulations.map((reg) => (
                      <option key={reg.code} value={reg.code}>
                        {reg.code} - {reg.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="flex items-center gap-2 text-[#efefef] cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={formData.vagrancy || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vagrancy: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-[#6d6d6d] bg-[#303027]/50 checked:bg-[#6d6d6d]"
                    />
                    <span>ヴァグランツ</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-[#303027] hover:bg-[#6d6d6d] text-[#efefef] border border-[#6d6d6d] rounded-lg transition-colors text-sm"
                  disabled={isSaving}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  disabled={isSaving}
                >
                  {isSaving && (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
