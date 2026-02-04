'use client'

import { useState, useEffect } from 'react'

type SpellType = 'ALL' | 'SHINGO' | 'SOREI' | 'SHINCHI' | 'SHINSEI' | 'MADOKI' | 'YOSEI' | 'SHINRA' | 'SHOI' | 'NARAKU' | 'HIOU'

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
  magisphere: string | null
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

// 妖精魔法のランク表ロジック
const FAIRY_RANK_DATA = {
  FOUR_ELEMENTS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  THREE_ELEMENTS: [2, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 15, 15, 15, 15],
  ALL_ELEMENTS: [0, 0, 2, 3, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10],
  SPECIAL: [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5]
};

type FairyAttribute = '土' | '水・氷' | '炎' | '風' | '光' | '闇'
const FAIRY_ATTRIBUTES: FairyAttribute[] = ['土', '水・氷', '炎', '風', '光', '闇']

interface SpellTypeLevel {
  type: SpellType
  level: string
}

export function SpellSearch() {
  const [spellTypeLevels, setSpellTypeLevels] = useState<SpellTypeLevel[]>([{ type: 'ALL', level: '' }])
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ALL')
  const [presets, setPresets] = useState<RegulationPreset[]>([])
  const [regulations, setRegulations] = useState<Array<{ code: string; name: string }>>([])
  const [name, setName] = useState<string>('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  
  const [selectedFairyAttributes, setSelectedFairyAttributes] = useState<FairyAttribute[]>([])
  const [selectedDeity, setSelectedDeity] = useState<string>('')
  const [deities, setDeities] = useState<string[]>([])

  const getRegulationLabel = (code: string) => {
    if (code === 'ALL') return 'すべて'
    return regulations.find((r) => r.code === code)?.name || code
  }

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await fetch('/api/user/regulation-presets')
        if (response.ok) {
          const data = await response.json()
          setPresets(Array.isArray(data.presets) ? data.presets : [])
        }
      } catch (err) {
        console.error('Failed to fetch presets:', err)
      }
    }
    fetchPresets()
  }, [])

  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const response = await fetch('/api/regulations')
        if (response.ok) {
          const data = await response.json()
          setRegulations(data.regulations.map((r: {code: string; name: string}) => ({ code: r.code, name: r.name })))
        }
      } catch (error) {
        console.error('Failed to fetch regulations:', error)
      }
    }
    fetchRegulations()
  }, [])
  
  useEffect(() => {
    const fetchDeities = async () => {
      try {
        const response = await fetch('/api/deities')
        if (response.ok) {
          const data = await response.json()
          setDeities(data.deities.map((d: {name: string}) => d.name))
        }
      } catch (err) {
        console.error('Failed to fetch deities:', err)
      }
    }
    fetchDeities()
  }, [])

  const getFairyMaxRank = (skillLevel: number, attributeCount: number, isSpecial: boolean = false) => {
    const idx = Math.max(0, Math.min(14, skillLevel - 1));
    if (isSpecial) return FAIRY_RANK_DATA.SPECIAL[idx];
    if (attributeCount === 6) return FAIRY_RANK_DATA.ALL_ELEMENTS[idx];
    if (attributeCount === 3) return FAIRY_RANK_DATA.THREE_ELEMENTS[idx];
    // 4属性契約をデフォルト（1,2,4,5属性選択時）とする
    return FAIRY_RANK_DATA.FOUR_ELEMENTS[idx];
  };

  const handleCopy = async (spell: Spell) => {
    const text = `${spell.name}
${SPELL_TYPE_LABELS[spell.type as SpellType] || spell.type} Lv.${spell.level} ${getRegulationLabel(spell.regulation)}${spell.magisphere ? ' [魔法圏]' : ''}
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
    try {
      const params = new URLSearchParams()
      
      // デバッグログ：妖精魔法の検索条件
      const yoseiSpellType = spellTypeLevels.find(stl => stl.type === 'YOSEI')
      if (yoseiSpellType) {
        console.log('=== 妖精魔法検索 デバッグログ ===')
        console.log('選択レベル:', yoseiSpellType.level)
        console.log('選択属性:', selectedFairyAttributes)
        console.log('属性数:', selectedFairyAttributes.length)
      }
      
      spellTypeLevels.forEach((stl, index) => {
        if (stl.type === 'ALL') return;
        params.append(`spellTypes[${index}][type]`, stl.type)
        
        if (stl.type === 'HIOU' && stl.level) {
          const lv = parseInt(stl.level)
          params.append(`spellTypes[${index}][biblioRankMin]`, '1')
          params.append(`spellTypes[${index}][biblioRankMax]`, Math.min(5, Math.ceil(lv / 3)).toString())
        } 
        else if (stl.type === 'YOSEI' && stl.level) {
          const lv = parseInt(stl.level)
          const attrCount = selectedFairyAttributes.length
          
          // 基本魔法を常に表示するためのパラメータ
          params.append('includeBasicFairy', 'true')
          params.append('basicFairyMaxLevel', lv.toString())
          
          // 属性魔法がある場合のみ属性魔法ランク設定
          if (attrCount > 0) {
            const maxRank = getFairyMaxRank(lv, attrCount)
            params.append(`spellTypes[${index}][level]`, maxRank.toString())
            console.log('属性魔法ランク:', maxRank)
          }
          
          if (attrCount === 6) {
            const specialRank = getFairyMaxRank(lv, 6, true)
            params.append('includeSpecialFairy', 'true')
            params.append('maxSpecialRank', specialRank.toString())
            console.log('特殊魔法ランク:', specialRank)
          }
        }
        else if (stl.level) {
          params.append(`spellTypes[${index}][level]`, stl.level)
        }
      })

      if (selectedFairyAttributes.length > 0) {
        selectedFairyAttributes.forEach(attr => params.append('fairyAttributes[]', attr))
      }
      if (selectedDeity) params.append('deity', selectedDeity)
      if (selectedPresetId !== 'ALL') {
        const preset = presets.find(p => p.id === selectedPresetId)
        preset?.regulations.forEach(reg => params.append('regulations[]', reg))
      }
      if (name) params.append('name', name)
      params.append('page', page.toString())

      const url = `/api/spells?${params.toString()}`
      console.log('リクエストURL:', url)
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('検索に失敗しました')
      const data = await response.json()
      
      // デバッグログ：検索結果
      if (yoseiSpellType) {
        console.log('検索結果件数:', data.pagination.total)
        console.log('取得魔法数:', data.spells.length)
        
        // 基本魔法、属性魔法、特殊魔法の分類
        const basicFairy = data.spells.filter((s: Spell) => 
          s.fairyAttributes.includes('基本')
        )
        const attributeFairy = data.spells.filter((s: Spell) => 
          s.fairyAttributes.length > 0 && !s.fairyAttributes.includes('基本') && !s.fairyAttributes.includes('特殊')
        )
        const specialFairy = data.spells.filter((s: Spell) => 
          s.fairyAttributes.includes('特殊')
        )
        
        console.log('基本妖精魔法:', basicFairy.length, '件')
        console.log('属性妖精魔法:', attributeFairy.length, '件')
        console.log('特殊妖精魔法:', specialFairy.length, '件')
        console.log('================================')
      }
      
      setResult(data)
    } catch (err) {
      console.error('検索エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [spellTypeLevels, selectedPresetId, selectedFairyAttributes, selectedDeity])

  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spellTypeLevels, selectedPresetId, selectedFairyAttributes, selectedDeity, page])

  return (
    <div className="space-y-6">
      {/* 検索条件セクション */}
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
              <select
                value={stl.type}
                onChange={(e) => {
                  const newList = [...spellTypeLevels]
                  newList[index].type = e.target.value as SpellType
                  setSpellTypeLevels(newList)
                }}
                className="flex-1 px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none"
              >
                {Object.entries(SPELL_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={stl.level}
                onChange={(e) => {
                  const newList = [...spellTypeLevels]
                  newList[index].level = e.target.value
                  setSpellTypeLevels(newList)
                }}
                className="w-32 px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef]"
              >
                <option value="">すべて</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((lv) => (
                  <option key={lv} value={lv}>Lv.{lv}</option>
                ))}
              </select>
              
              {spellTypeLevels.length > 1 && (
                <button
                  onClick={() => setSpellTypeLevels(spellTypeLevels.filter((_, i) => i !== index))}
                  className="px-3 py-2 bg-[#a44949] hover:bg-[#b85656] text-white rounded-lg transition-colors"
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">レギュレーション</label>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef]"
            >
              <option value="ALL">すべて</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>{preset.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">魔法名</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="魔法名で検索"
                className="flex-1 px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] placeholder-[#6d6d6d]"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-[#6d6d6d] hover:bg-[#efefef] text-[#efefef] hover:text-[#303027] rounded-lg transition-colors"
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
                  onClick={() => setSelectedFairyAttributes(prev => 
                    prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr]
                  )}
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
            {(() => {
              const yoseiLevel = spellTypeLevels.find(stl => stl.type === 'YOSEI')?.level
              if (!yoseiLevel) return null;
              const lv = parseInt(yoseiLevel);
              const count = selectedFairyAttributes.length;
              return (
                <div className="mt-3 text-sm text-[#6d6d6d]">
                  技能Lv: {lv} | 契約属性: {count}個
                  <br />
                  基本魔法: 1～{lv} | 属性魔法: 1～{getFairyMaxRank(lv, count)}
                  {count === 6 && ` | 特殊魔法: 1～${getFairyMaxRank(lv, 6, true)}`}
                </div>
              )
            })()}
          </div>
        )}

        {/* 神聖魔法の神選択 */}
        {spellTypeLevels.some(stl => stl.type === 'SHINSEI') && (
          <div className="mt-4 pt-4 border-t border-[#6d6d6d]">
            <label className="block text-sm font-medium text-[#efefef] mb-2">信仰する神を選択</label>
            <select
              value={selectedDeity}
              onChange={(e) => setSelectedDeity(e.target.value)}
              className="w-full md:w-64 px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef]"
            >
              <option value="">すべて</option>
              {deities.map((deity) => (
                <option key={deity} value={deity}>{deity}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6d6d6d]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6d6d6d] mx-auto"></div>
          <p className="mt-4">検索中...</p>
        </div>
      ) : result ? (
        <div className="space-y-4">
          <div className="text-[#6d6d6d]">
            {result.pagination.total}件の魔法が見つかりました
          </div>

          <div className="space-y-3">
            {result.spells.map((spell) => (
              <div
                key={spell.id}
                className="bg-[#303027]/50 backdrop-blur-sm rounded-lg p-5 border border-[#6d6d6d] hover:border-[#efefef]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{spell.name}</h3>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {SPELL_TYPE_LABELS[spell.type as SpellType] || spell.type}
                      </span>
                      <span className="text-slate-400">Lv.{spell.level}</span>
                      <span className="text-slate-400">{getRegulationLabel(spell.regulation)}</span>
                      <span className="text-slate-500">ページ-{spell.page}</span>
                      {spell.magisphere && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 rounded">魔法圏</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(spell)}
                    className="ml-4 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded transition-colors text-sm flex items-center gap-2"
                  >
                    {copiedId === spell.id ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                    {copiedId === spell.id ? '完了' : 'コピー'}
                  </button>
                </div>

                <div className="text-sm text-slate-300 mb-3 flex flex-wrap gap-x-3 gap-y-1">
                  <span><span className="text-slate-400">消費:</span> <span className="text-white">{spell.cost}</span></span>
                  <span className="text-slate-600">/</span>
                  <span><span className="text-slate-400">射程:</span> <span className="text-white">{spell.range}</span></span>
                  <span className="text-slate-600">/</span>
                  <span><span className="text-slate-400">形状:</span> <span className="text-white">{spell.shape}</span></span>
                  <span className="text-slate-600">/</span>
                  <span><span className="text-slate-400">対象:</span> <span className="text-white">{spell.target}</span></span>
                  <span className="text-slate-600">/</span>
                  <span><span className="text-slate-400">持続:</span> <span className="text-white">{spell.duration}</span></span>
                  <span className="text-slate-600">/</span>
                  <span><span className="text-slate-400">抵抗:</span> <span className="text-white">{spell.resistance}</span></span>
                  {spell.attribute && (
                    <><span className="text-slate-600">/</span><span><span className="text-slate-400">属性:</span> <span className="text-white">{spell.attribute}</span></span></>
                  )}
                </div>

                <div className="text-sm text-slate-300 mt-4 pt-4 border-t border-slate-700 whitespace-pre-wrap leading-relaxed">
                  {spell.summary}
                </div>
              </div>
            ))}
          </div>

          {result.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#efefef] hover:text-[#303027] rounded transition-colors"
              >
                前へ
              </button>
              <span className="px-4 py-2 text-[#6d6d6d]">{page} / {result.pagination.totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(result.pagination.totalPages, p + 1))}
                disabled={page === result.pagination.totalPages}
                className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#efefef] hover:text-[#303027] rounded transition-colors"
              >
                次へ
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}