'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type SkillCategory = string

type FieldType = string

interface SkillFieldConfig {
  id: string
  categoryId: string
  fieldKey: string
  fieldLabel: string
  fieldType: FieldType
  placeholder: string | null
  options: Record<string, string | number> | null
  order: number
  required: boolean
}

interface SkillCategoryConfig {
  id: string
  code: SkillCategory
  name: string
  order: number
  fields: SkillFieldConfig[]
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<SkillCategoryConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<SkillCategoryConfig | null>(null)
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<SkillFieldConfig | null>(null)
  const [editingCategory, setEditingCategory] = useState<SkillCategoryConfig | null>(null)

  const [fieldFormData, setFieldFormData] = useState({
    fieldKey: '',
    fieldLabel: '',
    fieldType: 'text' as FieldType,
    placeholder: '',
    order: 1,
    required: false,
  })
  
  const [categoryFormData, setCategoryFormData] = useState({
    code: '',
    name: '',
    order: 1,
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/special-skills/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      showToast('カテゴリーの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openFieldModal = (category: SkillCategoryConfig, field?: SkillFieldConfig) => {
    setSelectedCategory(category)
    if (field) {
      setEditingField(field)
      setFieldFormData({
        fieldKey: field.fieldKey,
        fieldLabel: field.fieldLabel,
        fieldType: (field.fieldType || '').toString().toLowerCase(),
        placeholder: field.placeholder || '',
        order: field.order,
        required: field.required,
      })
    } else {
      setEditingField(null)
      setFieldFormData({
        fieldKey: '',
        fieldLabel: '',
        fieldType: 'text',
        placeholder: '',
        order: (category.fields.length + 1) * 10,
        required: false,
      })
    }
    setIsFieldModalOpen(true)
  }

  const closeFieldModal = () => {
    setIsFieldModalOpen(false)
    setSelectedCategory(null)
    setEditingField(null)
  }
  
  const openCategoryModal = (category?: SkillCategoryConfig) => {
    if (category) {
      setEditingCategory(category)
      setCategoryFormData({
        code: category.code,
        name: category.name,
        order: category.order,
      })
    } else {
      setEditingCategory(null)
      setCategoryFormData({
        code: '',
        name: '',
        order: categories.length + 1,
      })
    }
    setIsCategoryModalOpen(true)
  }
  
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false)
    setEditingCategory(null)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory
        ? `/api/admin/special-skills/categories/${editingCategory.id}`
        : '/api/admin/special-skills/categories/create'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || error.error || 'Failed to save category')
      }

      showToast(
        editingCategory ? 'カテゴリーを更新しました' : 'カテゴリーを作成しました',
        'success'
      )
      closeCategoryModal()
      fetchCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
      showToast(
        error instanceof Error ? error.message : 'カテゴリーの保存に失敗しました',
        'error'
      )
    }
  }
  
  const handleDeleteCategory = async (category: SkillCategoryConfig) => {
    if (!confirm(`カテゴリー「${category.name}」を削除しますか？\n\n注意: 削除する前に、このカテゴリーに紐づく技能データをすべて削除する必要があります。`)) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/special-skills/categories/${category.id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }

      showToast('カテゴリーを削除しました', 'success')
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      showToast(
        error instanceof Error ? error.message : 'カテゴリーの削除に失敗しました',
        'error'
      )
    }
  }
  
  const handleFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategory) return

    try {
      const url = editingField
        ? `/api/admin/special-skills/categories/${selectedCategory.id}/fields/${editingField.id}`
        : `/api/admin/special-skills/categories/${selectedCategory.id}/fields`
      const method = editingField ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fieldFormData,
          categoryId: selectedCategory.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to save field')

      showToast(
        editingField ? 'フィールドを更新しました' : 'フィールドを追加しました',
        'success'
      )
      closeFieldModal()
      fetchCategories()
    } catch (error) {
      console.error('Failed to save field:', error)
      showToast('保存に失敗しました', 'error')
    }
  }

  const handleDeleteField = async (categoryId: string, fieldId: string) => {
    if (!confirm('このフィールドを削除しますか？')) return

    try {
      const response = await fetch(
        `/api/admin/special-skills/categories/${categoryId}/fields/${fieldId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete field')

      showToast('フィールドを削除しました', 'success')
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete field:', error)
      showToast('削除に失敗しました', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#303027] via-[#6d6d6d] to-[#303027] py-12">
      <div className="container mx-auto px-4">
        {/* Toast通知 */}
        {toast && (
          <div
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-[#efefef] animate-slide-up z-50 ${
              toast.type === 'success'
                ? 'bg-[#6d6d6d]'
                : 'bg-[#303027] border border-[#6d6d6d]'
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#efefef]">
              その他技能カテゴリー管理
            </h1>
            <p className="text-[#6d6d6d] mt-2">
              カテゴリーとカスタムフィールドを管理します
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => openCategoryModal()}
              className="px-6 py-3 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
            >
              カテゴリー追加
            </button>
            <Link
              href="/admin/special-skills"
              className="px-6 py-3 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
            >
              ← 戻る
            </Link>
          </div>
        </div>

        {/* カテゴリー一覧 */}
        {loading ? (
          <div className="text-center py-12 text-[#6d6d6d]">読み込み中...</div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#efefef]">
                      {category.name}
                    </h2>
                    <p className="text-[#6d6d6d] text-sm">
                      コード: {category.code} | 順序: {category.order}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openCategoryModal(category)}
                      className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
                      title="カテゴリーを編集"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="px-4 py-2 bg-[#a44949] hover:bg-[#b85656] text-white rounded-lg transition-colors"
                      title="カテゴリーを削除"
                    >
                      削除
                    </button>
                    <button
                      onClick={() => openFieldModal(category)}
                      className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
                    >
                      フィールド追加
                    </button>
                  </div>
                </div>

                {/* カスタムフィールド一覧 */}
                {category.fields.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#6d6d6d]/30">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-[#efefef]">
                            順序
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-[#efefef]">
                            キー
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-[#efefef]">
                            ラベル
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-[#efefef]">
                            型
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-[#efefef]">
                            必須
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-[#efefef]">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#6d6d6d]">
                        {category.fields.map((field) => (
                          <tr key={field.id} className="hover:bg-[#6d6d6d]/20">
                            <td className="px-4 py-3 text-[#efefef]">
                              {field.order}
                            </td>
                            <td className="px-4 py-3 text-[#efefef]">
                              {field.fieldKey}
                            </td>
                            <td className="px-4 py-3 text-[#efefef]">
                              {field.fieldLabel}
                            </td>
                            <td className="px-4 py-3 text-[#6d6d6d]">
                              {field.fieldType}
                            </td>
                            <td className="px-4 py-3 text-[#6d6d6d]">
                              {field.required ? '✓' : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => openFieldModal(category, field)}
                                className="px-3 py-1 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors mr-2"
                              >
                                編集
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteField(category.id, field.id)
                                }
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
                ) : (
                  <p className="text-[#6d6d6d] text-center py-4">
                    カスタムフィールドが設定されていません
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* フィールド追加/編集モーダル */}
        {isFieldModalOpen && selectedCategory && (
          <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[#303027] rounded-xl p-6 max-w-2xl w-full my-8 border border-[#6d6d6d] max-h-[calc(100vh-4rem)] overflow-y-auto">
              <h2 className="text-2xl font-bold text-[#efefef] mb-6">
                {editingField ? 'フィールド編集' : 'フィールド追加'} -{' '}
                {selectedCategory.name}
              </h2>
              <form onSubmit={handleFieldSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#efefef] mb-2">
                      フィールドキー *
                    </label>
                    <input
                      type="text"
                      value={fieldFormData.fieldKey}
                      onChange={(e) =>
                        setFieldFormData({
                          ...fieldFormData,
                          fieldKey: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                      placeholder="例: hasSinging, pet"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#efefef] mb-2">
                      ラベル *
                    </label>
                    <input
                      type="text"
                      value={fieldFormData.fieldLabel}
                      onChange={(e) =>
                        setFieldFormData({
                          ...fieldFormData,
                          fieldLabel: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                      placeholder="例: 歌唱、ペット"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#efefef] mb-2">
                      フィールドタイプ *
                    </label>
                    <select
                      value={fieldFormData.fieldType}
                      onChange={(e) =>
                        setFieldFormData({
                          ...fieldFormData,
                          fieldType: e.target.value as FieldType,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                      required
                    >
                      <option value="text">テキスト</option>
                      <option value="number">数値</option>
                      <option value="boolean">真偽値</option>
                      <option value="textarea">テキストエリア</option>
                      <option value="select">選択</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#efefef] mb-2">
                      プレースホルダー
                    </label>
                    <input
                      type="text"
                      value={fieldFormData.placeholder}
                      onChange={(e) =>
                        setFieldFormData({
                          ...fieldFormData,
                          placeholder: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                      placeholder="例: なし、➘N、♡M、➚L など"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#efefef] mb-2">
                      順序
                    </label>
                    <input
                      type="number"
                      value={fieldFormData.order}
                      onChange={(e) =>
                        setFieldFormData({
                          ...fieldFormData,
                          order: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={fieldFormData.required}
                      onChange={(e) =>
                        setFieldFormData({
                          ...fieldFormData,
                          required: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor="required"
                      className="text-sm text-[#efefef]"
                    >
                      必須項目
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeFieldModal}
                    className="px-4 py-2 bg-[#303027] hover:bg-[#6d6d6d] text-[#efefef] border border-[#6d6d6d] rounded-lg transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
                  >
                    {editingField ? '更新' : '追加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* カテゴリー追加・編集モーダル */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#303027] rounded-xl border border-[#6d6d6d] p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-[#efefef] mb-6">
                {editingCategory ? 'カテゴリーを編集' : 'カテゴリーを追加'}
              </h2>
              
              {!editingCategory && (
                <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    <strong>注意:</strong> カテゴリーを追加した後は、管理画面から入力フォームが自動的に生成されます。必要に応じてフィールド設定も追加してください。
                  </p>
                </div>
              )}

              <form onSubmit={handleCategorySubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#efefef] mb-1">
                      カテゴリーコード（大文字英字とアンダースコアのみ）*
                    </label>
                    <input
                      type="text"
                      value={categoryFormData.code}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="例: NEW_CATEGORY"
                      pattern="[A-Z_]+"
                      className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                      disabled={!!editingCategory}
                      required
                    />
                    {editingCategory && (
                      <p className="text-[#6d6d6d] text-xs mt-1">
                        コードは変更できません
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#efefef] mb-1">
                      カテゴリー名 *
                    </label>
                    <input
                      type="text"
                      value={categoryFormData.name}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          name: e.target.value,
                        })
                      }
                      placeholder="例: 新技能"
                      className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#efefef] mb-1">
                      表示順序 *
                    </label>
                    <input
                      type="number"
                      value={categoryFormData.order}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          order: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-[#303027]/50 border border-[#6d6d6d] rounded text-[#efefef]"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeCategoryModal}
                    className="px-4 py-2 bg-[#303027] hover:bg-[#6d6d6d] text-[#efefef] border border-[#6d6d6d] rounded-lg transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
                  >
                    {editingCategory ? '更新' : '作成'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
