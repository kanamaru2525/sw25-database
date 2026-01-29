'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface RegulationPreset {
  id: string
  name: string
  regulations: string[]
  createdAt: Date
}

interface Regulation {
  code: string
  name: string
}

export default function RegulationPresetManager({
  initialPresets,
}: {
  initialPresets: RegulationPreset[]
}) {
  const [presets, setPresets] = useState<RegulationPreset[]>(initialPresets)
  const [regulations, setRegulations] = useState<Regulation[]>([])
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchRegulations()
  }, [])

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

      // 基本レギュレーション（Ⅰ、Ⅱ、Ⅲ、DX）を自動追加
      const baseRegulations = regulations
        .filter(r => ['Ⅰ', 'Ⅱ', 'Ⅲ', 'DX'].includes(r.code))
        .map(r => r.code)
      const allRegulations = [...new Set([...baseRegulations, ...formData.regulations])]

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, regulations: allRegulations }),
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
                    onClick={() => openModal(preset)}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="px-3 py-1 bg-[#a44949] hover:bg-[#b85656] text-white rounded transition-colors text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {preset.regulations.map((reg) => {
                  const regulation = regulations.find((r) => r.code === reg)
                  const label = regulation ? `${regulation.code} - ${regulation.name}` : reg
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
      {isCreating && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999] p-4 pt-8 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full border border-slate-700 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">
                {editingPreset ? 'プリセット編集' : 'プリセット作成'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="space-y-4 p-6 overflow-y-auto flex-1">
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
                    追加レギュレーション選択
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    ※ Ⅰ, Ⅱ, Ⅲ, DXは基本レギュレーションとして自動的に含まれます
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {regulations
                      .filter(r => !['Ⅰ', 'Ⅱ', 'Ⅲ', 'DX'].includes(r.code))
                      .map((regulation) => (
                      <button
                        key={regulation.code}
                        type="button"
                        onClick={() => toggleRegulation(regulation.code)}
                        className={`px-3 py-2 rounded transition-colors ${
                          formData.regulations.includes(regulation.code)
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                        title={regulation.name}
                      >
                        {regulation.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
