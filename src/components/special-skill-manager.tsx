'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type SkillCategory =
  | 'MAGIC'
  | 'MAGIC_ITEM'
  | 'CEREMONY'
  | 'MAGIC_USER'
  | 'ALCHEMY'
  | 'ENCHANTER'
  | 'ARTS'
  | 'FAMILIAR'
  | 'OTHER'

interface SpecialSkill {
  id: number
  category: SkillCategory
  level: number | null
  name: string
  duration: string | null
  resistance: string | null
  cost: string | null
  attribute: string | null
  target: string | null
  rangeShape: string | null
  summary: string
  page: string
  regulation: string
}

const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  MAGIC: '魔法',
  MAGIC_ITEM: '魔法のアイテム',
  CEREMONY: 'セレモニー',
  MAGIC_USER: '魔法使い',
  ALCHEMY: '練技',
  ENCHANTER: '賦術',
  ARTS: '呪歌',
  FAMILIAR: '騎芸',
  OTHER: 'その他',
}

const SKILL_CATEGORIES: SkillCategory[] = [
  'MAGIC',
  'MAGIC_ITEM',
  'CEREMONY',
  'MAGIC_USER',
  'ALCHEMY',
  'ENCHANTER',
  'ARTS',
  'FAMILIAR',
  'OTHER',
]

export default function SpecialSkillManager() {
  const [skills, setSkills] = useState<SpecialSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<SpecialSkill | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const [formData, setFormData] = useState<Partial<SpecialSkill>>({
    category: 'MAGIC',
    level: null,
    name: '',
    duration: '',
    resistance: '',
    cost: '',
    attribute: '',
    target: '',
    rangeShape: '',
    summary: '',
    page: '',
    regulation: '',
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search,
      })
      const response = await fetch(`/api/admin/special-skills?${params}`)
      const data = await response.json()
      setSkills(data.skills)
    } catch (error) {
      console.error('Failed to fetch skills:', error)
      showToast('データの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const openModal = (skill?: SpecialSkill) => {
    if (skill) {
      setEditingSkill(skill)
      setFormData(skill)
    } else {
      setEditingSkill(null)
      setFormData({
        category: 'MAGIC',
        level: null,
        name: '',
        duration: '',
        resistance: '',
        cost: '',
        attribute: '',
        target: '',
        rangeShape: '',
        summary: '',
        page: '',
        regulation: '',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSkill(null)
    setFormData({
      category: 'MAGIC',
      level: null,
      name: '',
      duration: '',
      resistance: '',
      cost: '',
      attribute: '',
      target: '',
      rangeShape: '',
      summary: '',
      page: '',
      regulation: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingSkill
        ? `/api/admin/special-skills/${editingSkill.id}`
        : '/api/admin/special-skills'
      const method = editingSkill ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save')

      showToast(
        editingSkill ? '更新しました' : '作成しました',
        'success'
      )
      closeModal()
      fetchSkills()
    } catch (error) {
      console.error('Failed to save skill:', error)
      showToast('保存に失敗しました', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/special-skills/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      showToast('削除しました', 'success')
      fetchSkills()
    } catch (error) {
      console.error('Failed to delete skill:', error)
      showToast('削除に失敗しました', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast通知 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white animate-slide-up ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <Link
          href="/admin"
          className="text-purple-400 hover:text-purple-300"
        >
          ← 管理者画面に戻る
        </Link>
        <div className="flex gap-4">
          <Link
            href="/admin/import/special-skills"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            CSVインポート
          </Link>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            新規追加
          </button>
        </div>
      </div>

      {/* 検索 */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
        <input
          type="text"
          placeholder="名前で検索..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* データ一覧 */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">読み込み中...</div>
      ) : (
        <>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">名前</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">カテゴリー</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">レベル</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">対象</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">射程</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">レギュレーション</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-white">{skill.id}</td>
                    <td className="px-4 py-3 text-white">{skill.name}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {SKILL_CATEGORY_LABELS[skill.category]}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{skill.level || '-'}</td>
                    <td className="px-4 py-3 text-slate-300">{skill.target || '-'}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {skill.rangeShape || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{skill.regulation}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openModal(skill)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mr-2"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 max-w-3xl w-full my-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingSkill ? 'その他技能編集' : 'その他技能作成'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    名前 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    カテゴリー *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as SkillCategory,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                    required
                  >
                    {SKILL_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {SKILL_CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    レベル
                  </label>
                  <input
                    type="number"
                    value={formData.level ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        level: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                    placeholder="オプション"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    持続時間
                  </label>
                  <input
                    type="text"
                    value={formData.duration || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    抵抗
                  </label>
                  <input
                    type="text"
                    value={formData.resistance || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resistance: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    コスト
                  </label>
                  <input
                    type="text"
                    value={formData.cost || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    属性
                  </label>
                  <input
                    type="text"
                    value={formData.attribute || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, attribute: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    対象
                  </label>
                  <input
                    type="text"
                    value={formData.target || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, target: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    射程/形状
                  </label>
                  <input
                    type="text"
                    value={formData.rangeShape || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, rangeShape: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    ページ *
                  </label>
                  <input
                    type="text"
                    value={formData.page}
                    onChange={(e) =>
                      setFormData({ ...formData, page: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    概要 *
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                    rows={3}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    レギュレーション *
                  </label>
                  <input
                    type="text"
                    value={formData.regulation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        regulation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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
