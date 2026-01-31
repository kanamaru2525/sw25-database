'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type ItemType = 'weapon' | 'armor' | 'accessory'
type Rank = 'B' | 'A' | 'S' | 'SS'
type RegulationType = 'TYPE_I' | 'TYPE_II' | 'TYPE_III' | 'DX' | 'ET' | 'ML' | 'MA' | 'BM' | 'AL' | 'RL' | 'BR' | 'BS' | 'AB' | 'BI' | 'DD' | 'US' | 'TS'

interface Item {
  id: string
  itemType: ItemType
  name: string
  category?: string
  rank?: string
  usage?: string
  minStrength?: number
  hit?: number
  power?: number
  critical?: number
  extraDamage?: number
  range?: number | null
  evasion?: number
  defense?: number
  price: number
  summary: string
  page: string
  regulation: string
}

const RANK_LABELS: Record<Rank, string> = {
  B: 'B',
  A: 'A',
  S: 'S',
  SS: 'SS',
}

const WEAPON_CATEGORIES = [
  'ソード', 'アックス', 'スピア', 'メイス', 'スタッフ', 'フレイル',
  'ウォーハンマー', '格闘', '投擲', 'ボウ', 'クロスボウ', 'ガン',
]

const ARMOR_CATEGORIES = [
  '非金属鎧', '金属鎧', '盾',
]

const ACCESSORY_USAGES = [
  '1H', '2H', '頭', '顔', '耳', '首', '背中', '手', '腰', '足', '任意', 'なし',
]

const REGULATION_LABELS: Record<RegulationType, string> = {
  TYPE_I: 'Ⅰ', TYPE_II: 'Ⅱ', TYPE_III: 'Ⅲ', DX: 'DX', ET: 'ET', ML: 'ML',
  MA: 'MA', BM: 'BM', AL: 'AL', RL: 'RL', BR: 'BR', BS: 'BS',
  AB: 'AB', BI: 'BI', DD: 'DD', US: 'US', TS: 'TS',
}

export function ItemManager() {
  const [itemType, setItemType] = useState<ItemType>('weapon')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [rankFilter, setRankFilter] = useState('')
  const [regulationFilter, setRegulationFilter] = useState('')
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [regulations, setRegulations] = useState<Array<{ code: string; name: string }>>([])

  // レギュレーションを取得
  useEffect(() => {
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
    fetchRegulations()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('itemType', itemType)
      params.append('page', page.toString())
      if (search) params.append('search', search)
      if (categoryFilter) params.append('category', categoryFilter)
      if (rankFilter) params.append('rank', rankFilter)
      if (regulationFilter) params.append('regulation', regulationFilter)

      const response = await fetch(`/api/items?${params.toString()}`)
      const data = await response.json()
      setItems(data.items || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch items:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [page, categoryFilter, rankFilter, regulationFilter, itemType])

  const handleSearch = () => {
    setPage(1)
    fetchItems()
  }

  const handleSave = async (itemData: Partial<Item>) => {
    try {
      const url = editingItem
        ? `/api/admin/items/${editingItem.id}`
        : `/api/admin/items`
      
      const dataToSend = editingItem ? itemData : { ...itemData, itemType }
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) throw new Error('Failed to save item')

      setToast({
        message: editingItem ? '更新しました' : '追加しました',
        type: 'success',
      })
      setEditingItem(null)
      setIsCreating(false)
      fetchItems()
    } catch (error) {
      setToast({
        message: 'エラーが発生しました',
        type: 'error',
      })
    }

    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/items/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete item')

      setToast({
        message: '削除しました',
        type: 'success',
      })
      fetchItems()
    } catch (error) {
      setToast({
        message: 'エラーが発生しました',
        type: 'error',
      })
    }

    setTimeout(() => setToast(null), 3000)
  }

  const getCategoryLabel = () => {
    switch (itemType) {
      case 'weapon': return 'カテゴリ'
      case 'armor': return 'カテゴリ'
      case 'accessory': return '用法'
      default: return 'カテゴリ'
    }
  }

  const getCategories = () => {
    switch (itemType) {
      case 'weapon': return WEAPON_CATEGORIES
      case 'armor': return ARMOR_CATEGORIES
      case 'accessory': return ACCESSORY_USAGES
      default: return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast通知 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg animate-slide-up ${
            toast.type === 'success' ? 'bg-[#6d6d6d] text-[#efefef]' : 'bg-[#303027] text-[#efefef] border border-[#6d6d6d]'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <Link
          href="/admin"
          className="text-[#6d6d6d] hover:text-[#efefef] transition-colors"
        >
          ← 管理者画面に戻る
        </Link>
        <div className="flex gap-4">
          <Link
            href={`/admin/import/${itemType === 'weapon' ? 'weapons' : itemType === 'armor' ? 'armors' : 'accessories'}`}
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
          >
            CSVインポート
          </Link>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
          >
            新規追加
          </button>
        </div>
      </div>

      {/* アイテムタイプ選択 */}
      <div className="bg-[#303027] backdrop-blur-sm rounded-xl p-4 border border-[#6d6d6d]">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-[#efefef]">種別:</label>
          <select
            value={itemType}
            onChange={(e) => {
              setItemType(e.target.value as ItemType)
              setCategoryFilter('')
              setRankFilter('')
              setPage(1)
            }}
            className="px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
          >
            <option value="weapon">武器</option>
            <option value="armor">防具</option>
            <option value="accessory">装飾品</option>
          </select>
        </div>
      </div>

      {/* 検索 */}
      <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl p-6 border border-[#6d6d6d] space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#efefef] mb-2">
            名前
          </label>
          <input
            type="text"
            placeholder="名前で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] placeholder-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              {getCategoryLabel()}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
            >
              <option value="">すべて</option>
              {getCategories().map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {itemType !== 'accessory' && (
            <div>
              <label className="block text-sm font-medium text-[#efefef] mb-2">
                ランク
              </label>
              <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
              >
                <option value="">すべて</option>
                {Object.entries(RANK_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              レギュレーション
            </label>
            <select
              value={regulationFilter}
              onChange={(e) => setRegulationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
            >
              <option value="">すべて</option>
              {regulations.map((reg) => (
                <option key={reg.code} value={reg.code}>{reg.code} - {reg.name}</option>
              ))}
            </select>
          </div>
        </div>

        {(categoryFilter || rankFilter || regulationFilter || search) && (
          <button
            onClick={() => {
              setCategoryFilter('')
              setRankFilter('')
              setRegulationFilter('')
              setSearch('')
            }}
            className="text-sm text-[#6d6d6d] hover:text-[#efefef] transition-colors"
          >
            フィルターをクリア
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6d6d6d]">読み込み中...</div>
      ) : (
        <>
          <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl border border-[#6d6d6d] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#303027]/50 border-b border-[#6d6d6d]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#efefef]">名前</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#efefef]">{getCategoryLabel()}</th>
                  {itemType !== 'accessory' && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#efefef]">ランク</th>
                  )}
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#efefef]">レギュレーション</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#efefef]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6d6d6d]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#6d6d6d]/20 transition-colors">
                    <td className="px-4 py-3 text-[#efefef]">{item.name}</td>
                    <td className="px-4 py-3 text-[#6d6d6d]">
                      {itemType === 'accessory' ? item.usage : item.category}
                    </td>
                    {itemType !== 'accessory' && (
                      <td className="px-4 py-3 text-[#6d6d6d]">{item.rank}</td>
                    )}
                    <td className="px-4 py-3 text-[#6d6d6d]">
                      {regulations.find((r) => r.code === item.regulation)?.name || item.regulation}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="px-3 py-1 bg-[#6d6d6d] hover:bg-[#efefef] text-[#303027] rounded-lg transition-colors mr-2"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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

      {(editingItem || isCreating) && (
        <ItemForm
          item={editingItem}
          itemType={itemType}
          regulations={regulations}
          onSave={handleSave}
          onCancel={() => {
            setEditingItem(null)
            setIsCreating(false)
          }}
        />
      )}


    </div>
  )
}

function ItemForm({
  item,
  itemType,
  regulations,
  onSave,
  onCancel,
}: {
  item: Item | null
  itemType: ItemType
  regulations: Array<{ code: string; name: string }>
  onSave: (item: Partial<Item>) => void
  onCancel: () => void
}) {
  const getDefaultFormData = (): Partial<Item> => {
    const base = {
      name: '',
      price: 0,
      summary: '',
      page: '',
      regulation: 'TYPE_I',
    }

    if (itemType === 'weapon') {
      return {
        ...base,
        category: '',
        rank: 'B',
        usage: '',
        minStrength: 0,
        hit: 0,
        power: 0,
        critical: 10,
        extraDamage: 0,
        range: null,
      }
    } else if (itemType === 'armor') {
      return {
        ...base,
        category: '',
        rank: 'B',
        usage: '',
        minStrength: 0,
        evasion: 0,
        defense: 0,
      }
    } else {
      return {
        ...base,
        usage: '',
      }
    }
  }

  const [formData, setFormData] = useState<Partial<Item>>(item || getDefaultFormData())
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
    } finally {
      setIsSaving(false)
    }
  }

  const getCategoryOptions = () => {
    switch (itemType) {
      case 'weapon': return WEAPON_CATEGORIES
      case 'armor': return ARMOR_CATEGORIES
      case 'accessory': return ACCESSORY_USAGES
      default: return []
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#303027] rounded-xl p-6 max-w-2xl w-full my-8 border border-[#6d6d6d]">
        <h2 className="text-2xl font-bold text-[#efefef] mb-6">
          {item ? `${itemType === 'weapon' ? '武器' : itemType === 'armor' ? '防具' : '装飾品'}編集` : `${itemType === 'weapon' ? '武器' : itemType === 'armor' ? '防具' : '装飾品'}追加`}
        </h2>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#efefef] mb-2">名前</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#efefef] mb-2">
                {itemType === 'accessory' ? '用法' : 'カテゴリ'}
              </label>
              {itemType === 'accessory' ? (
                <select
                  value={formData.usage || ''}
                  onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                  className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                >
                  <option value="">選択してください</option>
                  {getCategoryOptions().map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                >
                  <option value="">選択してください</option>
                  {getCategoryOptions().map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {itemType !== 'accessory' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#efefef] mb-2">ランク</label>
                <select
                  value={formData.rank || 'B'}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                >
                  {Object.entries(RANK_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {itemType === 'weapon' || itemType === 'armor' ? (
                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">用法</label>
                  <input
                    type="text"
                    value={formData.usage || ''}
                    onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                    className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>
              ) : null}
            </div>
          )}

          {itemType === 'weapon' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">必要筋力</label>
                  <input
                    type="number"
                    value={formData.minStrength || 0}
                    onChange={(e) => setFormData({ ...formData, minStrength: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">命中力</label>
                  <input
                    type="number"
                    value={formData.hit || 0}
                    onChange={(e) => setFormData({ ...formData, hit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">威力</label>
                  <input
                    type="number"
                    value={formData.power || 0}
                    onChange={(e) => setFormData({ ...formData, power: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">クリティカル値</label>
                  <input
                    type="number"
                    value={formData.critical || 10}
                    onChange={(e) => setFormData({ ...formData, critical: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">追加ダメージ</label>
                  <input
                    type="number"
                    value={formData.extraDamage || 0}
                    onChange={(e) => setFormData({ ...formData, extraDamage: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#efefef] mb-2">射程</label>
                  <input
                    type="number"
                    value={formData.range || ''}
                    onChange={(e) => setFormData({ ...formData, range: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                  />
                </div>
              </div>
            </>
          )}

          {itemType === 'armor' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#efefef] mb-2">必要筋力</label>
                <input
                  type="number"
                  value={formData.minStrength || 0}
                  onChange={(e) => setFormData({ ...formData, minStrength: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#efefef] mb-2">回避力</label>
                <input
                  type="number"
                  value={formData.evasion || 0}
                  onChange={(e) => setFormData({ ...formData, evasion: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#efefef] mb-2">防護点</label>
                <input
                  type="number"
                  value={formData.defense || 0}
                  onChange={(e) => setFormData({ ...formData, defense: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#efefef] mb-2">価格</label>
              <input
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#efefef] mb-2">レギュレーション</label>
              <select
                value={formData.regulation || (regulations.length > 0 ? regulations[0].code : 'Ⅰ')}
                onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
              >
                {regulations.length === 0 ? (
                  <option value="">読み込み中...</option>
                ) : (
                  regulations.map((reg) => (
                    <option key={reg.code} value={reg.code}>{reg.code} - {reg.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">概要</label>
            <textarea
              value={formData.summary || ''}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">ページ</label>
            <input
              type="text"
              value={formData.page || ''}
              onChange={(e) => setFormData({ ...formData, page: e.target.value })}
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded text-[#efefef]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#303027] hover:text-[#303027] disabled:text-[#6d6d6d] rounded transition-colors"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
