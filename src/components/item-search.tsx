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

export function ItemSearch() {
  const [itemType, setItemType] = useState<ItemType>('weapon')
  const [category, setCategory] = useState<string>('')
  const [rank, setRank] = useState<Rank>('ALL')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ALL')
  const [presets, setPresets] = useState<RegulationPreset[]>([])
  const [name, setName] = useState<string>('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  const handleCopy = async (item: Item) => {
    let text = `${item.name}\n`
    
    if (item.itemType === 'weapon') {
      text += `武器 / ${item.category} / ランク${item.rank} / ${REGULATION_LABELS[item.regulation as RegulationType] || item.regulation}\n`
      text += `用法:${item.usage} / 必筋:${item.minStrength} / 命中:${item.hit > 0 ? '+' : ''}${item.hit} / 威力:${item.power} / C値:${item.critical} / 追加D:${item.extraDamage}${item.range ? ` / 射程:${item.range}m` : ''} / 価格:${item.price}G`
    } else if (item.itemType === 'armor') {
      text += `防具 / ${item.category} / ランク${item.rank} / ${REGULATION_LABELS[item.regulation as RegulationType] || item.regulation}\n`
      text += `用法:${item.usage} / 必筋:${item.minStrength} / 回避:${item.evasion > 0 ? '+' : ''}${item.evasion} / 防護:${item.defense} / 価格:${item.price}G`
    } else {
      text += `装備品 / ${REGULATION_LABELS[item.regulation as RegulationType] || item.regulation}\n`
      text += `用法:${item.usage} / 価格:${item.price}G`
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
    return []
  }

  const categoryOptions = getCategoryOptions()
  const showCategorySelect = itemType === 'weapon' || itemType === 'armor'

  return (
    <div className="space-y-6">
      {/* 検索フィルタ */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* アイテム種別 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              種別
            </label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value as ItemType)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="weapon">武器</option>
              <option value="armor">防具</option>
              <option value="accessory">装備品</option>
            </select>
          </div>

          {/* カテゴリ */}
          {showCategorySelect ? (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                カテゴリ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">すべて</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="opacity-50 pointer-events-none">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                カテゴリ
              </label>
              <select
                disabled
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-500"
              >
                <option>-</option>
              </select>
            </div>
          )}

          {/* ランク */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ランク
            </label>
            <select
              value={rank}
              onChange={(e) => setRank(e.target.value as Rank)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(RANK_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* レギュレーションプリセット */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              レギュレーション
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前で検索"
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="pt-7">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg transition-colors h-[42px]"
            >
              検索
            </button>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* 検索結果 */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4">検索中...</p>
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* 検索結果サマリー */}
          <div className="text-slate-300">
            {result.pagination.total}件のアイテムが見つかりました
          </div>

          {/* アイテムリスト */}
          <div className="space-y-3">
            {result.items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 border border-slate-700 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {item.name}
                    </h3>
                    <div className="flex gap-3 text-sm text-slate-400">
                      <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {item.itemType === 'weapon' ? '武器' : item.itemType === 'armor' ? '防具' : '装備品'}
                      </span>
                      {(item.itemType === 'weapon' || item.itemType === 'armor') && (
                        <>
                          <span>{item.category}</span>
                          <span>ランク{item.rank}</span>
                        </>
                      )}
                      <span>{REGULATION_LABELS[item.regulation as RegulationType] || item.regulation}</span>
                      <span className="text-slate-500">{item.page}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(item)}
                    className="ml-4 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded transition-colors text-sm flex items-center gap-2"
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

                <div className="text-sm text-slate-300 mb-3 flex flex-wrap gap-x-3 gap-y-1">
                  <span>
                    <span className="text-slate-400">用法:</span>
                    <span className="ml-1 text-white">{item.usage}</span>
                  </span>
                  <span className="text-slate-600">/</span>
                  <span>
                    <span className="text-slate-400">必筋:</span>
                    <span className="ml-1 text-white">{item.minStrength}</span>
                  </span>
                  {item.itemType === 'weapon' ? (
                    <>
                      <span className="text-slate-600">/</span>
                      <span>
                        <span className="text-slate-400">命中:</span>
                        <span className="ml-1 text-white">{item.hit > 0 ? '+' : ''}{item.hit}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                      <span>
                        <span className="text-slate-400">威力:</span>
                        <span className="ml-1 text-white">{item.power}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                      <span>
                        <span className="text-slate-400">C値:</span>
                        <span className="ml-1 text-white">{item.critical}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                      <span>
                        <span className="text-slate-400">追加D:</span>
                        <span className="ml-1 text-white">{item.extraDamage}</span>
                      </span>
                      {item.range && (
                        <>
                          <span className="text-slate-600">/</span>
                          <span>
                            <span className="text-slate-400">射程:</span>
                            <span className="ml-1 text-white">{item.range}m</span>
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-slate-600">/</span>
                      <span>
                        <span className="text-slate-400">回避:</span>
                        <span className="ml-1 text-white">{item.evasion > 0 ? '+' : ''}{item.evasion}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                      <span>
                        <span className="text-slate-400">防護:</span>
                        <span className="ml-1 text-white">{item.defense}</span>
                      </span>
                    </>
                  )}
                  <span className="text-slate-600">/</span>
                  <span>
                    <span className="text-slate-400">価格:</span>
                    <span className="ml-1 text-white">{item.price}G</span>
                  </span>
                </div>

                <div className="text-sm text-slate-300 mt-4 pt-4 border-t border-slate-700 leading-relaxed">
                  {item.summary}
                </div>
              </div>
            ))}
          </div>

          {/* ページネーション情報 */}
          {result.pagination.totalPages > 1 && (
            <div className="text-center text-slate-400">
              ページ {result.pagination.page} / {result.pagination.totalPages}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
