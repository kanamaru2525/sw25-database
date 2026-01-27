'use client'

import { useState } from 'react'

interface RegulationPreset {
  id: string
  name: string
  regulations: string[]
  createdAt: Date
}

const REGULATION_OPTIONS = [
  { value: 'TYPE_I', label: 'Ⅰ' },
  { value: 'TYPE_II', label: 'Ⅱ' },
  { value: 'TYPE_III', label: 'Ⅲ' },
  { value: 'DX', label: 'DX' },
  { value: 'ET', label: 'ET' },
  { value: 'ML', label: 'ML' },
  { value: 'MA', label: 'MA' },
  { value: 'BM', label: 'BM' },
  { value: 'AL', label: 'AL' },
  { value: 'RL', label: 'RL' },
  { value: 'BR', label: 'BR' },
  { value: 'BS', label: 'BS' },
  { value: 'AB', label: 'AB' },
  { value: 'BI', label: 'BI' },
  { value: 'DD', label: 'DD' },
  { value: 'US', label: 'US' },
  { value: 'TS', label: 'TS' },
]

export default function RegulationPresetManager({
  initialPresets,
}: {
  initialPresets: RegulationPreset[]
}) {
  const [presets, setPresets] = useState<RegulationPreset[]>(initialPresets)
  const [isCreating, setIsCreating] = useState(false)
  const [editingPreset, setEditingPreset] = useState<RegulationPreset | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    regulations: [] as string[],
  })
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/user/regulation-presets')
      const data = await response.json()
      setPresets(data.presets)
    } catch (error) {
      console.error('Failed to fetch presets:', error)
    }
  }

  const openModal = (preset?: RegulationPreset) => {
    if (preset) {
      setEditingPreset(preset)
      setFormData({
        name: preset.name,
        regulations: preset.regulations,
      })
    } else {
      setEditingPreset(null)
      setFormData({
        name: '',
        regulations: [],
      })
    }
    setIsCreating(true)
  }

  const closeModal = () => {
    setIsCreating(false)
    setEditingPreset(null)
    setFormData({ name: '', regulations: [] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingPreset
        ? `/api/user/regulation-presets/${editingPreset.id}`
        : '/api/user/regulation-presets'
      const method = editingPreset ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save')

      showToast(
        editingPreset ? 'プリセットを更新しました' : 'プリセットを作成しました',
        'success'
      )
      closeModal()
      fetchPresets()
    } catch (error) {
      console.error('Failed to save preset:', error)
      showToast('保存に失敗しました', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このプリセットを削除しますか？')) return

    try {
      const response = await fetch(`/api/user/regulation-presets/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      showToast('プリセットを削除しました', 'success')
      fetchPresets()
    } catch (error) {
      console.error('Failed to delete preset:', error)
      showToast('削除に失敗しました', 'error')
    }
  }

  const toggleRegulation = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      regulations: prev.regulations.includes(value)
        ? prev.regulations.filter((r) => r !== value)
        : [...prev.regulations, value],
    }))
  }

  const copyToClipboard = (preset: RegulationPreset) => {
    const params = new URLSearchParams({
      regulations: preset.regulations.join(','),
    })
    const url = `${window.location.origin}/search?${params.toString()}`
    
    navigator.clipboard.writeText(url)
    showToast('検索URLをコピーしました', 'success')
  }

  return (
    <div>
      {/* Toast通知 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white animate-slide-up z-50 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* 新規作成ボタン */}
      <div className="mb-6">
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          新規プリセット作成
        </button>
      </div>

      {/* プリセット一覧 */}
      <div className="space-y-4">
        {presets.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            プリセットがありません。新規作成してください。
          </p>
        ) : (
          presets.map((preset) => (
            <div
              key={preset.id}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{preset.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(preset)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                    title="検索URLをコピー"
                  >
                    URLコピー
                  </button>
                  <button
                    onClick={() => openModal(preset)}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {preset.regulations.map((reg) => {
                  const label =
                    REGULATION_OPTIONS.find((o) => o.value === reg)?.label || reg
                  return (
                    <span
                      key={reg}
                      className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm"
                    >
                      {label}
                    </span>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* モーダル */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingPreset ? 'プリセット編集' : 'プリセット作成'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    プリセット名 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                    placeholder="例: 基本レギュレーション"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    レギュレーション選択 *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {REGULATION_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleRegulation(option.value)}
                        className={`px-3 py-2 rounded transition-colors ${
                          formData.regulations.includes(option.value)
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {formData.regulations.length === 0 && (
                    <p className="text-red-400 text-sm mt-2">
                      少なくとも1つのレギュレーションを選択してください
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={formData.regulations.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
