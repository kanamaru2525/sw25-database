'use client'

import { useState, useEffect } from 'react'

type ItemType = 'weapon' | 'armor' | 'accessory'
type Rank = 'ALL' | 'B' | 'A' | 'S' | 'SS'
type RegulationType = 'ALL' | 'TYPE_I' | 'TYPE_II' | 'TYPE_III' | 'DX' | 'ET' | 'ML' | 'MA' | 'BM' | 'AL' | 'RL' | 'BR' | 'BS' | 'AB' | 'BI' | 'DD' | 'US' | 'TS'

interface Weapon {
  id: string
  itemType: 'weapon'
  name: string
  category: string
  rank: string
  usage: string
  minStrength: number
  hit: number
  power: number
  critical: number
  extraDamage: number
  range: number | null
  price: number
  summary: string
  page: string
  regulation: string
}

interface Armor {
  id: string
  itemType: 'armor'
  name: string
  category: string
  rank: string
  usage: string
  minStrength: number
  evasion: number
  defense: number
  price: number
  summary: string
  page: string
  regulation: string
}

interface Accessory {
  id: string
  itemType: 'accessory'
  name: string
  usage: string
  price: number
  summary: string
  page: string
  regulation: string
}

type Item = Weapon | Armor | Accessory

interface RegulationPreset {
  id: string
  name: string
  regulations: string[]
  createdAt: Date
}

interface SearchResult {
  items: Item[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const RANK_LABELS: Record<Rank, string> = {
  ALL: 'すべて',
  B: 'B',
  A: 'A',
  S: 'S',
  SS: 'SS',
}

const REGULATION_LABELS: Record<RegulationType, string> = {
  ALL: 'すべて',
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

const WEAPON_CATEGORIES = [
  'ソード',
  'アックス',
  'スピア',
  'メイス',
  'スタッフ',
  'フレイル',
  'ウォーハンマー',
  '格闘',
  '投擲',
  'ボウ',
  'クロスボウ',
  'ガン',
]

const ARMOR_CATEGORIES = [
  '非金属鎧',
  '金属鎧',
  '盾',
]
const ACCESSORY_CATEGORIES = [
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
  'なし',
]

// 用法を表示用に変換
const formatUsage = (usage: string): string => {
  return usage === 'NONE' ? '-' : usage
}

export function ItemSearch() {
  const [itemType, setItemType] = useState<ItemType>('weapon')
  const [category, setCategory] = useState<string>('')
  const [rank, setRank] = useState<Rank>('ALL')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ALL')
  const [presets, setPresets] = useState<RegulationPreset[]>([])
  const [name, setName] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [priceAbove, setPriceAbove] = useState(false)
  const [priceBelow, setPriceBelow] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [regulations, setRegulations] = useState<Array<{ code: string; name: string }>>([])

  // プリセットを取得
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await fetch('/api/user/regulation-presets')
        if (response.ok) {
          const data = await response.json()
          setPresets(Array.isArray(data.presets) ? data.presets : [])
        } else {
          setPresets([])
        }
      } catch (err) {
        console.error('Failed to fetch presets:', err)
        setPresets([])
      }
    }
    fetchPresets()
  }, [])

  // レギュレーションを取得
  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const response = await fetch('/api/regulations')
        const data = await response.json()
        setRegulations(data.regulations.map((r: { code: string; name: string }) => ({ code: r.code, name: r.name })))
      } catch (error) {
        console.error('Failed to fetch regulations:', error)
      }
    }
    fetchRegulations()
  }, [])

  const handleCopy = async (item: Item) => {
    const regulationDisplay = REGULATION_LABELS[item.regulation as RegulationType] || item.regulation
    let text = `${item.name}\n`
    
    if (item.itemType === 'weapon') {
      const w = item as any
      text += `武器 / ${item.category} / ランク${item.rank} / ${regulationDisplay}\n`
      text += `用法:${formatUsage(item.usage)} / 必筋:${w.minStrength} / 命中:${w.hit > 0 ? '+' : ''}${w.hit} / 威力:${w.power} / C値:${w.critical} / 追加D:${w.extraDamage}${w.range ? ` / 射程:${w.range}m` : ''} / 価格:${item.price}G`
    } else if (item.itemType === 'armor') {
      const a = item as any
      text += `防具 / ${item.category} / ランク${item.rank} / ${regulationDisplay}\n`
      text += `用法:${formatUsage(item.usage)} / 必筋:${a.minStrength} / 回避:${a.evasion > 0 ? '+' : ''}${a.evasion} / 防護:${a.defense} / 価格:${item.price}G`
    } else {
      text += `装備品 / ${regulationDisplay}\n`
      text += `用法:${formatUsage(item.usage)} / 価格:${item.price}G`
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams()
      params.append('itemType', itemType)
      if (category) params.append('category', category)
      if (rank !== 'ALL') params.append('rank', rank)
      
      // プリセットが選択されている場合、そのレギュレーションを使用
      if (selectedPresetId !== 'ALL') {
        const selectedPreset = presets.find(p => p.id === selectedPresetId)
        if (selectedPreset && selectedPreset.regulations.length > 0) {
          selectedPreset.regulations.forEach(reg => {
            params.append('regulations[]', reg)
          })
        }
      }
      
      if (name) params.append('name', name)
      
      if (price) {
        params.append('price', price)
        if (priceAbove) params.append('priceAbove', 'true')
        if (priceBelow) params.append('priceBelow', 'true')
      }
      
      const response = await fetch(`/api/items?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('検索に失敗しました')
      }
      
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (presets.length >= 0) { // プリセットの読み込み完了を待つ
      handleSearch()
    }
  }, [itemType, rank, selectedPresetId]) // presets を依存配列から削除

  // アイテムタイプが変更されたらカテゴリをリセット
  useEffect(() => {
    setCategory('')
  }, [itemType])

  // 現在のアイテムタイプに応じたカテゴリーリストを取得
  const getCategoryOptions = () => {
    if (itemType === 'weapon') return WEAPON_CATEGORIES
    if (itemType === 'armor') return ARMOR_CATEGORIES
    if (itemType === 'accessory') return ACCESSORY_CATEGORIES
    return []
  }

  const categoryOptions = getCategoryOptions()
  const showCategorySelect = itemType === 'weapon' || itemType === 'armor' || itemType === 'accessory'
  const showRankSelect = itemType === 'weapon' || itemType === 'armor'

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* 検索フィルタ */}
      <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl p-6 border border-[#6d6d6d]" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* アイテム種別 */}
          <div suppressHydrationWarning>
            <label className="block text-sm font-medium text-[#efefef] mb-2" suppressHydrationWarning>
              種別
            </label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value as ItemType)}
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
              suppressHydrationWarning
            >
              <option value="weapon" suppressHydrationWarning>武器</option>
              <option value="armor" suppressHydrationWarning>防具</option>
              <option value="accessory" suppressHydrationWarning>装備品</option>
            </select>
          </div>

          {/* カテゴリ */}
          <div suppressHydrationWarning>
            <label className="block text-sm font-medium text-[#efefef] mb-2" suppressHydrationWarning>
              {itemType === 'accessory' ? '用法' : 'カテゴリ'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
              suppressHydrationWarning
            >
              <option value="" suppressHydrationWarning>すべて</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat} suppressHydrationWarning>{cat}</option>
              ))}
            </select>
          </div>

          {/* ランク */}
          {showRankSelect ? (
            <div suppressHydrationWarning>
              <label className="block text-sm font-medium text-[#efefef] mb-2" suppressHydrationWarning>
                ランク
              </label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as Rank)}
                className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
              >
                {Object.entries(RANK_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="opacity-50 pointer-events-none">
              <label className="block text-sm font-medium text-[#efefef] mb-2">
                ランク
              </label>
              <select
                disabled
                className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#6d6d6d]"
              >
                <option>-</option>
              </select>
            </div>
          )}

          {/* レギュレーションプリセット */}
          <div suppressHydrationWarning>
            <label className="block text-sm font-medium text-[#efefef] mb-2" suppressHydrationWarning>
              レギュレーション
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
            >
              <option value="ALL">すべて</option>
              {Array.isArray(presets) && presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 名前検索 */}
        <div className="flex gap-2">
          <div className="flex-1" suppressHydrationWarning>
            <label className="block text-sm font-medium text-[#efefef] mb-2" suppressHydrationWarning>
              名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前で検索"
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] placeholder-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
            />
          </div>
          <div className="flex-1" suppressHydrationWarning>
            <label className="block text-sm font-medium text-[#efefef] mb-2" suppressHydrationWarning>
              価格
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="価格で検索"
                className="flex-1 px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] placeholder-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-sm text-[#efefef] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={priceAbove}
                    onChange={(e) => {
                      setPriceAbove(e.target.checked)
                      if (e.target.checked) setPriceBelow(false)
                    }}
                    className="w-4 h-4"
                  />
                  以上
                </label>
                <label className="flex items-center gap-1 text-sm text-[#efefef] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={priceBelow}
                    onChange={(e) => {
                      setPriceBelow(e.target.checked)
                      if (e.target.checked) setPriceAbove(false)
                    }}
                    className="w-4 h-4"
                  />
                  以下
                </label>
              </div>
            </div>
          </div>
          <div className="pt-7" suppressHydrationWarning>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#efefef] hover:text-[#303027] disabled:text-[#6d6d6d] rounded-lg transition-colors"
              suppressHydrationWarning
            >
              検索
            </button>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-[#303027]/20 border border-[#6d6d6d] rounded-lg p-4 text-[#efefef]">
          {error}
        </div>
      )}

      {/* 検索結果 */}
      {loading ? (
        <div className="text-center py-12 text-[#6d6d6d]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6d6d6d] mx-auto"></div>
          <p className="mt-4">検索中...</p>
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* 検索結果サマリー */}
          <div className="text-[#6d6d6d]">
            {result.pagination.total}件のアイテムが見つかりました
          </div>

          {/* アイテムリスト */}
          <div className="space-y-3">
            {result.items.map((item) => (
              <div
                key={item.id}
                className="bg-[#303027]/50 backdrop-blur-sm rounded-lg p-5 border border-[#6d6d6d] hover:border-[#efefef]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#efefef] mb-1">
                      {item.name}
                    </h3>
                    <div className="flex gap-3 text-sm text-[#6d6d6d]">
                      <span className="inline-flex items-center px-2 py-1 bg-[#6d6d6d]/20 text-[#efefef] rounded">
                        {item.itemType === 'weapon' ? '武器' : item.itemType === 'armor' ? '防具' : '装備品'}
                      </span>
                      {(item.itemType === 'weapon' || item.itemType === 'armor') && (
                        <>
                          <span>{item.category}</span>
                          <span>ランク{item.rank}</span>
                        </>
                      )}
                      <span>{REGULATION_LABELS[item.regulation as RegulationType] || item.regulation}</span>
                      <span className="text-[#6d6d6d]">{item.page}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(item)}
                    className="ml-4 px-3 py-2 bg-[#6d6d6d]/50 hover:bg-[#efefef]/50 text-[#efefef] hover:text-[#303027] rounded transition-colors text-sm flex items-center gap-2"
                    title="情報をコピー"
                  >
                    {copiedId === item.id ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        コピー完了
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        コピー
                      </>
                    )}
                  </button>
                </div>

                <div className="text-sm text-[#6d6d6d] mb-3 flex flex-wrap gap-x-3 gap-y-1">
                  <span>
                    <span className="text-[#6d6d6d]">用法:</span>
                    <span className="ml-1 text-[#efefef]">{formatUsage(item.usage)}</span>
                  </span>
                  <span className="text-[#6d6d6d]">/</span>
                  <span>
                    <span className="text-[#6d6d6d]">必筋:</span>
                    <span className="ml-1 text-[#efefef]">{(item as any).minStrength ?? '-'}</span>
                  </span>
                  {item.itemType === 'weapon' ? (
                    <>
                      <span className="text-[#6d6d6d]">/</span>
                      <span>
                        <span className="text-[#6d6d6d]">命中:</span>
                        <span className="ml-1 text-[#efefef]">{(item as any).hit > 0 ? '+' : ''}{(item as any).hit}</span>
                      </span>
                      <span className="text-[#6d6d6d]">/</span>
                      <span>
                        <span className="text-[#6d6d6d]">威力:</span>
                        <span className="ml-1 text-[#efefef]">{(item as any).power}</span>
                      </span>
                      <span className="text-[#6d6d6d]">/</span>
                      <span>
                        <span className="text-[#6d6d6d]">C値:</span>
                        <span className="ml-1 text-[#efefef]">{(item as any).critical}</span>
                      </span>
                      <span className="text-[#6d6d6d]">/</span>
                      <span>
                        <span className="text-[#6d6d6d]">追加D:</span>
                        <span className="ml-1 text-[#efefef]">{(item as any).extraDamage}</span>
                      </span>
                      {item.range && (
                        <>
                          <span className="text-[#6d6d6d]">/</span>
                          <span>
                            <span className="text-[#6d6d6d]">射程:</span>
                            <span className="ml-1 text-[#efefef]">{item.range}m</span>
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-[#6d6d6d]">/</span>
                      <span>
                        <span className="text-[#6d6d6d]">回避:</span>
                        <span className="ml-1 text-[#efefef]">{(item as any).evasion > 0 ? '+' : ''}{(item as any).evasion}</span>
                      </span>
                      <span className="text-[#6d6d6d]">/</span>
                      <span>
                        <span className="text-[#6d6d6d]">防護:</span>
                        <span className="ml-1 text-[#efefef]">{(item as any).defense}</span>
                      </span>
                    </>
                  )}
                  <span className="text-[#6d6d6d]">/</span>
                  <span>
                    <span className="text-[#6d6d6d]">価格:</span>
                    <span className="ml-1 text-[#efefef]">{item.price}G</span>
                  </span>
                </div>

                <div className="text-sm text-[#6d6d6d] mt-4 pt-4 border-t border-[#6d6d6d] leading-relaxed">
                  {item.summary}
                </div>
              </div>
            ))}
          </div>

          {/* ページネーション情報・ページ送り */}
          {result.pagination.totalPages > 1 && (
            <div className="flex flex-col items-center gap-2 mt-6">
              <div className="text-[#6d6d6d]">
                ページ {result.pagination.page} / {result.pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (result.pagination.page > 1) {
                      setResult(r => r && { ...r, pagination: { ...r.pagination, page: r.pagination.page - 1 } })
                    }
                  }}
                  disabled={result.pagination.page === 1}
                  className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#efefef] hover:text-[#303027] rounded"
                >
                  前へ
                </button>
                <button
                  onClick={() => {
                    if (result.pagination.page < result.pagination.totalPages) {
                      setResult(r => r && { ...r, pagination: { ...r.pagination, page: r.pagination.page + 1 } })
                    }
                  }}
                  disabled={result.pagination.page === result.pagination.totalPages}
                  className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#efefef] hover:text-[#303027] rounded"
                >
                  次へ
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
