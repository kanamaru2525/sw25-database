'use client'

import { useState, useEffect } from 'react'

type SpellType = 'ALL' | 'SHINGO' | 'SOREI' | 'SHINCHI' | 'SHINSEI' | 'MADOKI' | 'YOSEI' | 'SHINRA' | 'SHOI' | 'NARAKU' | 'HIOU'

type RegulationType = 'ALL' | 'TYPE_I' | 'TYPE_II' | 'TYPE_III' | 'DX' | 'ET' | 'ML' | 'MA' | 'BM' | 'AL' | 'RL' | 'BR' | 'BS' | 'AB' | 'BI' | 'DD' | 'US' | 'TS'

interface Spell {
  id: string
  name: string
  type: string
  level: number
  range: string
  shape: string
  duration: string
  resistance: string
  cost: string
  attribute: string | null
  fairyAttributes: string[]
  deity: string | null
  biblioRank: number | null
  target: string
  summary: string
  magisphere: string | null // LARGE, MEDIUM, SMALL
  page: string
  regulation: string
}

interface RegulationPreset {
  id: string
  name: string
  regulations: string[]
  createdAt: Date
}

interface SearchResult {
  spells: Spell[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const SPELL_TYPE_LABELS: Record<SpellType, string> = {
  ALL: 'すべて',
  SHINGO: '真語魔法',
  SOREI: '操霊魔法',
  SHINCHI: '深智魔法',
  SHINSEI: '神聖魔法',
  MADOKI: '魔動機術',
  YOSEI: '妖精魔法',
  SHINRA: '森羅魔法',
  SHOI: '召異魔法',
  NARAKU: '奈落魔法',
  HIOU: '秘奥魔法',
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

// 妖精魔法の属性（魔法のattributeとは異なる妖精魔法専用のカテゴリー）
type FairyAttribute = '土' | '水氷' | '火' | '風' | '光' | '闇'
const FAIRY_ATTRIBUTES: FairyAttribute[] = ['土', '水氷', '火', '風', '光', '闇']

// 神聖魔法の神
const DEITIES = [
  'ティダン',
  'ル=ロウド',
  'グレンダール',
  'カルディア',
  'イーヴ',
  'ダルクレム'
]

// 契約数による魔法ランク計算
const calculateFairyRank = (level: number, contractCount: number, isSpecial: boolean): number => {
  if (isSpecial) {
    // 特殊妖精魔法は全属性契約時のみ
    const specialRanks = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5]
    return specialRanks[level - 1] || 0
  }
  
  if (contractCount === 6) {
    // 全属性契約
    const allRanks = [0, 0, 2, 3, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10]
    return allRanks[level - 1] || 0
  } else if (contractCount === 4) {
    // 4属性契約
    return level
  } else if (contractCount === 3) {
    // 3属性契約
    const threeRanks = [2, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 15, 15, 15, 15]
    return threeRanks[level - 1] || 0
  }
  return level // デフォルト
}

// 秘奥魔法のレベルからランクを計算
const calculateHiouRank = (level: number): number => {
  if (level >= 13) return 5
  if (level >= 10) return 4
  if (level >= 7) return 3
  if (level >= 4) return 2
  return 1
}

// 魔法タイプとレベルの組み合わせ
interface SpellTypeLevel {
  type: SpellType
  level: string
}

export function SpellSearch() {
  const [spellTypeLevels, setSpellTypeLevels] = useState<SpellTypeLevel[]>([{ type: 'ALL', level: '' }])
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ALL')
  const [presets, setPresets] = useState<RegulationPreset[]>([])
  const [name, setName] = useState<string>('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // 妖精魔法の属性選択
  const [selectedFairyAttributes, setSelectedFairyAttributes] = useState<FairyAttribute[]>([])
  
  // 神聖魔法の神選択
  const [selectedDeity, setSelectedDeity] = useState<string>('')
  
  // 神のリスト
  const [deities, setDeities] = useState<string[]>([])

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
  
  // 神を取得
  useEffect(() => {
    const fetchDeities = async () => {
      try {
        const response = await fetch('/api/deities')
        if (response.ok) {
          const data = await response.json()
          setDeities(data.deities.map((d: any) => d.name))
        }
      } catch (err) {
        console.error('Failed to fetch deities:', err)
      }
    }
    fetchDeities()
  }, [])

  const handleCopy = async (spell: Spell) => {
    const text = `${spell.name}
${SPELL_TYPE_LABELS[spell.type as SpellType] || spell.type} Lv.${spell.level} ${REGULATION_LABELS[spell.regulation as RegulationType] || spell.regulation}${spell.magisphere ? ' [魔法圏]' : ''}
射程:${spell.range} / 形状:${spell.shape} / 持続時間:${spell.duration} / 消費:${spell.cost} / 対象:${spell.target} / 抵抗:${spell.resistance}${spell.attribute ? ` / 属性:${spell.attribute}` : ''}${spell.fairyAttributes.length > 0 ? ` / 妖精属性:${spell.fairyAttributes.join(', ')}` : ''}${spell.deity ? ` / 神:${spell.deity}` : ''}${spell.biblioRank !== null ? ` / 文献ランク:${spell.biblioRank}` : ''}`

    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(spell.id)
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
      
      // 複数の魔法タイプとレベルの組み合わせをパラメータに追加
      spellTypeLevels.forEach((stl, index) => {
        if (stl.type !== 'ALL') {
          params.append(`spellTypes[${index}][type]`, stl.type)
          if (stl.level) {
            params.append(`spellTypes[${index}][level]`, stl.level)
          }
        }
      })
      
      // 妖精魔法で属性が選択されている場合（最初の妖精魔法タイプ用）
      const firstYoseiType = spellTypeLevels.find(stl => stl.type === 'YOSEI')
      if (firstYoseiType && selectedFairyAttributes.length > 0) {
        selectedFairyAttributes.forEach(attr => {
          params.append('fairyAttributes[]', attr)
        })
        
        // 契約数に応じた最大ランクを計算
        const numLevel = parseInt(firstYoseiType.level) || 15
        const contractCount = selectedFairyAttributes.length
        const maxRank = calculateFairyRank(numLevel, contractCount, false)
        
        // 基本妖精魔法のランク（4属性以上契約時に表示）
        if (contractCount >= 4) {
          params.append('includeBasicFairy', 'true')
          params.append('maxFairyRank', maxRank.toString())
        }
        
        // 特殊妖精魔法のランク（全属性契約時のみ）
        if (contractCount === 6) {
          const specialMaxRank = calculateFairyRank(numLevel, 6, true)
          params.append('includeSpecialFairy', 'true')
          params.append('maxSpecialRank', specialMaxRank.toString())
        }
      }
      
      // 神聖魔法で神が選択されている場合
      const firstShinseiType = spellTypeLevels.find(stl => stl.type === 'SHINSEI')
      if (firstShinseiType && selectedDeity) {
        params.append('deity', selectedDeity)
      }
      
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
      
      const response = await fetch(`/api/spells?${params.toString()}`)
      
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
    if (presets.length >= 0) {
      handleSearch()
    }
  }, [spellTypeLevels, selectedPresetId, selectedFairyAttributes, selectedDeity])

  return (
    <div className="space-y-6">
      {/* 検索フィルタ */}
      <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl p-6 border border-[#6d6d6d]">
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[#efefef]">
              魔法種別とレベル
            </label>
            <button
              onClick={() => setSpellTypeLevels([...spellTypeLevels, { type: 'ALL', level: '' }])}
              className="px-3 py-1 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded text-sm transition-colors"
            >
              + 追加
            </button>
          </div>
          
          {spellTypeLevels.map((stl, index) => (
            <div key={index} className="flex gap-2">
              {/* 魔法種別 */}
              <select
                value={stl.type}
                onChange={(e) => {
                  const newList = [...spellTypeLevels]
                  newList[index].type = e.target.value as SpellType
                  setSpellTypeLevels(newList)
                }}
                className="flex-1 px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
              >
                {Object.entries(SPELL_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              {/* レベル */}
              <select
                value={stl.level}
                onChange={(e) => {
                  const newList = [...spellTypeLevels]
                  newList[index].level = e.target.value
                  setSpellTypeLevels(newList)
                }}
                className="w-32 px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
              >
                <option value="">すべて</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((lv) => (
                  <option key={lv} value={lv}>
                    Lv.{lv}
                  </option>
                ))}
              </select>
              
              {spellTypeLevels.length > 1 && (
                <button
                  onClick={() => {
                    const newList = spellTypeLevels.filter((_, i) => i !== index)
                    setSpellTypeLevels(newList)
                  }}
                  className="px-3 py-2 bg-[#a44949] hover:bg-[#b85656] text-white rounded-lg transition-colors"
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

          {/* レギュレーション */}
          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
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

          {/* 名前検索 */}
          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              魔法名
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="魔法名で検索"
                className="flex-1 px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] placeholder-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#efefef] hover:text-[#303027] disabled:text-[#6d6d6d] rounded-lg transition-colors"
              >
                検索
              </button>
            </div>
          </div>
        </div>

        {/* 妖精魔法の属性選択 */}
        {spellTypeLevels.some(stl => stl.type === 'YOSEI') && (
          <div className="mt-4 pt-4 border-t border-[#6d6d6d]">
            <label className="block text-sm font-medium text-[#efefef] mb-3">
              契約属性を選択（妖精魔法専用）
            </label>
            <div className="flex flex-wrap gap-2">
              {FAIRY_ATTRIBUTES.map((attr) => (
                <button
                  key={attr}
                  onClick={() => {
                    setSelectedFairyAttributes(prev => 
                      prev.includes(attr) 
                        ? prev.filter(a => a !== attr)
                        : [...prev, attr]
                    )
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedFairyAttributes.includes(attr)
                      ? 'bg-[#6d6d6d] text-[#efefef] border-2 border-[#efefef]'
                      : 'bg-[#303027] text-[#6d6d6d] border border-[#6d6d6d] hover:border-[#efefef]'
                  }`}
                >
                  {attr}
                </button>
              ))}
            </div>
            {selectedFairyAttributes.length > 0 && (() => {
              const yoseiLevel = spellTypeLevels.find(stl => stl.type === 'YOSEI')?.level
              return (
                <div className="mt-3 text-sm text-[#6d6d6d]">
                  契約数: {selectedFairyAttributes.length}属性
                  {yoseiLevel && ` | 表示ランク: 1～${calculateFairyRank(parseInt(yoseiLevel), selectedFairyAttributes.length, false)}`}
                  {selectedFairyAttributes.length === 6 && yoseiLevel && 
                    ` | 特殊: 1～${calculateFairyRank(parseInt(yoseiLevel), 6, true)}`}
                </div>
              )
            })()}
          </div>
        )}

        {/* 神聖魔法の神選択 */}
        {spellTypeLevels.some(stl => stl.type === 'SHINSEI') && (
          <div className="mt-4 pt-4 border-t border-[#6d6d6d]">
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              信仰する神を選択（神聖魔法専用）
            </label>
            <select
              value={selectedDeity}
              onChange={(e) => setSelectedDeity(e.target.value)}
              className="w-full md:w-64 px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
            >
              <option value="">すべて</option>
              {deities.map((deity) => (
                <option key={deity} value={deity}>
                  {deity}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 秘奥魔法のランク表示 */}
        {spellTypeLevels.some(stl => stl.type === 'HIOU' && stl.level) && (() => {
          const hiouLevel = spellTypeLevels.find(stl => stl.type === 'HIOU')?.level
          if (!hiouLevel) return null
          const maxRank = calculateHiouRank(parseInt(hiouLevel))
          return (
            <div className="mt-4 pt-4 border-t border-[#6d6d6d]">
              <div className="text-sm text-[#6d6d6d]">
                秘奥魔法 レベル{hiouLevel}以下 | 表示ランク: 1～{maxRank}
              </div>
            </div>
          )
        })()}
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
            {result.pagination.total}件の魔法が見つかりました
          </div>

          {/* 魔法リスト */}
          <div className="space-y-3">
            {result.spells.map((spell) => (
              <div
                key={spell.id}
                className="bg-[#303027]/50 backdrop-blur-sm rounded-lg p-5 border border-[#6d6d6d] hover:border-[#efefef]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {spell.name}
                    </h3>
                    <div className="flex gap-3 text-sm text-slate-400">
                      <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {SPELL_TYPE_LABELS[spell.type as SpellType] || spell.type}
                      </span>
                      <span>Lv.{spell.level}</span>
                      <span>{REGULATION_LABELS[spell.regulation as RegulationType] || spell.regulation}</span>
                      <span className="text-slate-500">{spell.page}</span>
                      {spell.magisphere && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                          魔法圏
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(spell)}
                    className="ml-4 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded transition-colors text-sm flex items-center gap-2"
                    title="情報をコピー"
                  >
                    {copiedId === spell.id ? (
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
                    <span className="text-slate-400">射程:</span>
                    <span className="ml-1 text-white">{spell.range}</span>
                  </span>
                  <span className="text-slate-600">/</span>
                  <span>
                    <span className="text-slate-400">形状:</span>
                    <span className="ml-1 text-white">{spell.shape}</span>
                  </span>
                  <span className="text-slate-600">/</span>
                  <span>
                    <span className="text-slate-400">持続時間:</span>
                    <span className="ml-1 text-white">{spell.duration}</span>
                  </span>
                  <span className="text-slate-600">/</span>
                  <span>
                    <span className="text-slate-400">消費:</span>
                    <span className="ml-1 text-white">{spell.cost}</span>
                  </span>
                  <span className="text-slate-600">/</span>
                  <span>
                    <span className="text-slate-400">対象:</span>
                    <span className="ml-1 text-white">{spell.target}</span>
                  </span>
                  <span className="text-slate-600">/</span>
                  <span>
                    <span className="text-slate-400">抵抗:</span>
                    <span className="ml-1 text-white">{spell.resistance}</span>
                  </span>
                  {spell.attribute && (
                    <>
                      <span className="text-slate-600">/</span>
                      <span>
                        <span className="text-slate-400">属性:</span>
                        <span className="ml-1 text-white">{spell.attribute}</span>
                      </span>
                    </>
                  )}
                  {spell.fairyAttributes.length > 0 && (
                    <>
                      <span className="text-slate-600">/</span>
                      <span>
                        <span className="text-slate-400">妖精属性:</span>
                        <span className="ml-1 text-white">{spell.fairyAttributes.join(', ')}</span>
                      </span>
                    </>
                  )}
                  {spell.deity && (
                    <>
                      <span className="text-slate-600">/</span>
                      <span>
                        <span className="text-slate-400">神:</span>
                        <span className="ml-1 text-white">{spell.deity}</span>
                      </span>
                    </>
                  )}
                  {spell.biblioRank !== null && (
                    <>
                      <span className="text-slate-600">/</span>
                      <span>
                        <span className="text-slate-400">文献ランク:</span>
                        <span className="ml-1 text-white">{spell.biblioRank}</span>
                      </span>
                    </>
                  )}
                </div>

                <div className="text-sm text-slate-300 mt-4 pt-4 border-t border-slate-700 leading-relaxed">
                  {spell.summary}
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
