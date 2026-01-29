'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type SkillCategory =
  | 'ENHANCER'
  | 'BARD_SONG'
  | 'BARD_FINALE'
  | 'RIDER'
  | 'ALCHEMIST'
  | 'GEOMANCER'
  | 'WARLEADER_KOUHAI'
  | 'WARLEADER_JINRITSU'
  | 'DARKHUNTER'

type FieldType = 'BOOLEAN' | 'TEXT' | 'NUMBER' | 'SELECT' | 'TEXTAREA'

interface SkillFieldConfig {
  id: string
  categoryId: string
  fieldKey: string
  fieldLabel: string
  fieldType: FieldType
  placeholder: string | null
  options: any
  order: number
  required: boolean
}

interface SkillCategoryConfig {
  id: string
  code: SkillCategory
  name: string
  order: number
  customFields: SkillFieldConfig[]
}

interface SpecialSkill {
  id: string
  categoryCode: SkillCategory
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
  customFields: Record<string, any> | null
  category?: SkillCategoryConfig
}

export default function SpecialSkillManager() {
  const [skills, setSkills] = useState<SpecialSkill[]>([])
  const [categories, setCategories] = useState<SkillCategoryConfig[]>([])
  const [regulations, setRegulations] = useState<Array<{ code: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [regulationFilter, setRegulationFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<SpecialSkill | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const [formData, setFormData] = useState<{
    category: SkillCategory
    level: number | null
    name: string
    duration: string
    resistance: string
    cost: string
    attribute: string
    target: string
    rangeShape: string
    summary: string
    page: string
    regulation: string
    customFields: Record<string, any>
  }>({
    category: 'ENHANCER',
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
    customFields: {},
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // レギュレーションを取得
  const fetchRegulations = async () => {
    try {
      const response = await fetch('/api/regulations')
      if (response.ok) {
        const data = await response.json()
        setRegulations(data.regulations.map((r: any) => ({ code: r.code, name: r.name })))
      }
    } catch (error) {
      console.error('Failed to fetch regulations:', error)
    }
  }

  useEffect(() => {
    fetchRegulations()
  }, [])

  // カテゴリー設定を取得
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/special-skills/categories')
      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      showToast('カテゴリー設定の取得に失敗しました', 'error')
    }
  }

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter)
      if (regulationFilter !== 'ALL') params.append('regulation', regulationFilter)
      
      const response = await fetch(`/api/admin/special-skills?${params}`)
      const data = await response.json()
      setSkills(data.skills || [])
    } catch (error) {
      console.error('Failed to fetch skills:', error)
      showToast('データの取得に失敗しました', 'error')
      setSkills([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchSkills()
  }, [search, categoryFilter, regulationFilter])

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  // 選択されたカテゴリーのフィールド設定を取得
  const getSelectedCategoryFields = () => {
    const category = categories.find((c) => c.code === formData.category)
    return category?.customFields || []
  }

  const openModal = (skill?: SpecialSkill) => {
    if (skill) {
      setEditingSkill(skill)
      setFormData({
        category: skill.categoryCode,
        level: skill.level,
        name: skill.name,
        duration: skill.duration || '',
        resistance: skill.resistance || '',
        cost: skill.cost || '',
        attribute: skill.attribute || '',
        target: skill.target || '',
        rangeShape: skill.rangeShape || '',
        summary: skill.summary,
        page: skill.page,
        regulation: skill.regulation,
        customFields: skill.customFields || {},
      })
    } else {
      setEditingSkill(null)
      setFormData({
        category: 'ENHANCER',
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
        customFields: {},
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSkill(null)
    setFormData({
      category: 'ENHANCER',
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
      customFields: {},
    })
  }

  // カスタムフィールドの値を更新
  const updateCustomField = (fieldKey: string, value: any) => {
    setFormData({
      ...formData,
      customFields: {
        ...formData.customFields,
        [fieldKey]: value,
      },
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
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-[#efefef] animate-slide-up ${
            toast.type === 'success' ? 'bg-[#6d6d6d]' : 'bg-[#303027] border border-[#6d6d6d]'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <Link
          href="/admin"
          className="text-[#6d6d6d] hover:text-[#efefef]"
        >
          ← 管理者画面に戻る
        </Link>
        <div className="flex gap-4">
          <Link
            href="/admin/import/special-skills"
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
          >
            CSVインポート
          </Link>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
          >
            新規追加
          </button>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl p-4 border border-[#6d6d6d]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="名前で検索..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded-lg text-[#efefef] placeholder-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
          >
            <option value="ALL">すべてのカテゴリー</option>
            {categories.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={regulationFilter}
            onChange={(e) => setRegulationFilter(e.target.value)}
            className="px-4 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
          >
            <option value="ALL">すべてのレギュレーション</option>
            <option value="TYPE_I">Ⅰ</option>
            <option value="TYPE_II">Ⅱ</option>
            <option value="TYPE_III">Ⅲ</option>
            <option value="DX">DX</option>
            <option value="ET">ET</option>
            <option value="ML">ML</option>
            <option value="MA">MA</option>
            <option value="BM">BM</option>
            <option value="AL">AL</option>
          </select>
        </div>
      </div>

      {/* データ一覧 */}
      {loading ? (
        <div className="text-center py-12 text-[#6d6d6d]">読み込み中...</div>
      ) : (
        <>
          <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#6d6d6d]/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#efefef]">名前</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#efefef]">カテゴリー</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#efefef]">レベル</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#efefef]">対象</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#efefef]">射程</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#efefef]">レギュレーション</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#efefef]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6d6d6d]">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-[#6d6d6d]/30">
                    <td className="px-4 py-3 text-[#efefef]">{skill.name}</td>
                    <td className="px-4 py-3 text-[#6d6d6d]">
                      {skill.category?.name || skill.categoryCode}
                    </td>
                    <td className="px-4 py-3 text-[#6d6d6d]">{skill.level || '-'}</td>
                    <td className="px-4 py-3 text-[#6d6d6d]">{skill.target || '-'}</td>
                    <td className="px-4 py-3 text-[#6d6d6d]">
                      {skill.rangeShape || '-'}
                    </td>
                    <td className="px-4 py-3 text-[#6d6d6d]">{skill.regulation}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openModal(skill)}
                        className="px-3 py-1 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors mr-2"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="px-3 py-1 bg-[#a44949] hover:bg-[#b85656] text-white rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#303027] rounded-xl p-6 max-w-3xl w-full my-8 border border-[#6d6d6d] max-h-[calc(100vh-4rem)] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#efefef] mb-6">
              {editingSkill ? 'その他技能編集' : 'その他技能作成'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
                    名前 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
                    カテゴリー *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as SkillCategory,
                        customFields: {}, // カテゴリー変更時にカスタムフィールドをクリア
                      })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.code} value={category.code}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
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
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                    placeholder="オプション"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
                    持続時間
                  </label>
                  <input
                    type="text"
                    value={formData.duration || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
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
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
                    コスト
                  </label>
                  <input
                    type="text"
                    value={formData.cost || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
                    属性
                  </label>
                  <input
                    type="text"
                    value={formData.attribute || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, attribute: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
                    対象
                  </label>
                  <input
                    type="text"
                    value={formData.target || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, target: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
                    射程/形状
                  </label>
                  <input
                    type="text"
                    value={formData.rangeShape || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, rangeShape: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
                    ページ *
                  </label>
                  <input
                    type="text"
                    value={formData.page}
                    onChange={(e) =>
                      setFormData({ ...formData, page: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
                    概要 *
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                    rows={3}
                    required
                  />
                </div>

                {/* カテゴリー別カスタムフィールド（動的生成） */}
                {getSelectedCategoryFields().map((field) => {
                  const value = formData.customFields[field.fieldKey]

                  if (field.fieldType === 'BOOLEAN') {
                    return (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-[#efefef] mb-2">
                          {field.fieldLabel}
                          {field.required && ' *'}
                        </label>
                        <select
                          value={value === null || value === undefined ? '' : value ? 'true' : 'false'}
                          onChange={(e) =>
                            updateCustomField(
                              field.fieldKey,
                              e.target.value === '' ? null : e.target.value === 'true'
                            )
                          }
                          className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                          required={field.required}
                        >
                          <option value="">-</option>
                          <option value="true">有</option>
                          <option value="false">無</option>
                        </select>
                      </div>
                    )
                  }

                  if (field.fieldType === 'NUMBER') {
                    return (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-[#efefef] mb-2">
                          {field.fieldLabel}
                          {field.required && ' *'}
                        </label>
                        <input
                          type="number"
                          value={value ?? ''}
                          onChange={(e) =>
                            updateCustomField(
                              field.fieldKey,
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                          placeholder={field.placeholder || ''}
                          required={field.required}
                        />
                      </div>
                    )
                  }

                  if (field.fieldType === 'TEXTAREA') {
                    return (
                      <div key={field.id} className="col-span-2">
                        <label className="block text-sm font-medium text-[#efefef] mb-2">
                          {field.fieldLabel}
                          {field.required && ' *'}
                        </label>
                        <textarea
                          value={value || ''}
                          onChange={(e) =>
                            updateCustomField(field.fieldKey, e.target.value)
                          }
                          className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                          placeholder={field.placeholder || ''}
                          rows={3}
                          required={field.required}
                        />
                      </div>
                    )
                  }

                  // TEXT または SELECT
                  return (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-[#efefef] mb-2">
                        {field.fieldLabel}
                        {field.required && ' *'}
                      </label>
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) =>
                          updateCustomField(field.fieldKey, e.target.value)
                        }
                        className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                        placeholder={field.placeholder || ''}
                        required={field.required}
                      />
                    </div>
                  )
                })}

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#efefef] mb-2">
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
                    className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                    required
                  >
                    {regulations.length === 0 ? (
                      <option value="">読み込み中...</option>
                    ) : (
                      regulations.map((reg) => (
                        <option key={reg.code} value={reg.code}>
                          {reg.code} - {reg.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-[#303027] hover:bg-[#6d6d6d] text-[#efefef] border border-[#6d6d6d] rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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
