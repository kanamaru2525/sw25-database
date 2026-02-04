'use client'

import { useState, useEffect } from 'react'

type SkillCategory = 'ALL' | string

interface SpecialSkill {
  id: string
  categoryCode: string
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
  category?: {
    name: string
  }
}

interface RegulationPreset {
  id: string
  name: string
  regulations: string[]
  createdAt: Date
}

interface SearchResult {
  skills: SpecialSkill[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
interface SkillCategoryConfig {
  id: string
  code: string
  name: string
  order: number
}

export function SpecialSkillSearch() {
  const [category, setCategory] = useState<SkillCategory>('ALL')
  const [level, setLevel] = useState<string>('')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ALL')
  const [presets, setPresets] = useState<RegulationPreset[]>([])
  const [name, setName] = useState<string>('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [regulations, setRegulations] = useState<Array<{ code: string; name: string }>>([])
  const [categories, setCategories] = useState<SkillCategoryConfig[]>([])
  const [page, setPage] = useState(1)

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

  // カテゴリーを取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/special-skills/categories')
        const data = await response.json()
        setCategories(Array.isArray(data.categories) ? data.categories : [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  const getCategoryLabel = (code: string) => {
    return categories.find((c) => c.code === code)?.name || code
  }

  const handleCopy = async (skill: SpecialSkill) => {
    const regulationName = regulations.find((r) => r.code === skill.regulation)?.name || skill.regulation
    const categoryName = skill.category?.name || getCategoryLabel(skill.categoryCode)
    const text = `${skill.name}
${categoryName} Lv.${skill.level ?? '-'} ${regulationName}${skill.duration ? ` / 持続時間:${skill.duration}` : ''}${skill.resistance ? ` / 抵抗:${skill.resistance}` : ''}${skill.cost ? ` / 消費:${skill.cost}` : ''}${skill.attribute ? ` / 属性:${skill.attribute}` : ''}${skill.target ? ` / 対象:${skill.target}` : ''}${skill.rangeShape ? ` / 射程/形状:${skill.rangeShape}` : ''}`

    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(skill.id)
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
      if (category !== 'ALL') params.append('category', category)
      if (level) params.append('level', level)
      
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
      params.append('page', page.toString())
      
      const response = await fetch(`/api/special-skills?${params.toString()}`)
      
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
    setPage(1)
  }, [category, level, selectedPresetId])

  useEffect(() => {
    if (presets.length >= 0) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, level, selectedPresetId, page])

  return (
    <div className="space-y-6">
      {/* 検索フィルタ */}
      <div className="bg-[#303027]/50 backdrop-blur-sm rounded-xl p-6 border border-[#6d6d6d]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              カテゴリ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SkillCategory)}
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
            >
              <option value="ALL">すべて</option>
              {categories.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* レベル */}
          <div>
            <label className="block text-sm font-medium text-[#efefef] mb-2">
              レベル
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 bg-[#303027] border border-[#6d6d6d] rounded-lg text-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#6d6d6d]"
            >
              <option value="">すべて</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((lv) => (
                <option key={lv} value={lv}>
                  Lv.{lv}
                </option>
              ))}
            </select>
          </div>

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

        </div>

        <div>
          <label className="block text-sm font-medium text-[#efefef] mb-2">
            技能名
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="技能名で検索"
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
            {result.pagination.total}件の技能が見つかりました
          </div>

          {/* 技能リスト */}
          <div className="space-y-3">
            {result.skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-[#303027]/50 backdrop-blur-sm rounded-lg p-5 border border-[#6d6d6d] hover:border-[#efefef]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {skill.name}
                    </h3>
                    <div className="flex gap-3 text-sm text-slate-400">
                      <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {skill.category?.name || getCategoryLabel(skill.categoryCode)}
                      </span>
                      <span>Lv.{skill.level ?? '-'}</span>
                      <span>{regulations.find((r) => r.code === skill.regulation)?.name || skill.regulation}</span>
                      <span className="text-slate-500">{skill.page}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(skill)}
                    className="ml-4 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded transition-colors text-sm flex items-center gap-2"
                    title="情報をコピー"
                  >
                    {copiedId === skill.id ? (
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
                  {skill.duration && (
                    <>
                      <span>
                        <span className="text-slate-400">持続時間:</span>
                        <span className="ml-1 text-white">{skill.duration}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                    </>
                  )}
                  {skill.resistance && (
                    <>
                      <span>
                        <span className="text-slate-400">抵抗:</span>
                        <span className="ml-1 text-white">{skill.resistance}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                    </>
                  )}
                  {skill.cost && (
                    <>
                      <span>
                        <span className="text-slate-400">消費:</span>
                        <span className="ml-1 text-white">{skill.cost}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                    </>
                  )}
                  {skill.attribute && (
                    <>
                      <span>
                        <span className="text-slate-400">属性:</span>
                        <span className="ml-1 text-white">{skill.attribute}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                    </>
                  )}
                  {skill.target && (
                    <>
                      <span>
                        <span className="text-slate-400">対象:</span>
                        <span className="ml-1 text-white">{skill.target}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                    </>
                  )}
                  {skill.rangeShape && (
                    <span>
                      <span className="text-slate-400">射程/形状:</span>
                      <span className="ml-1 text-white">{skill.rangeShape}</span>
                    </span>
                  )}
                </div>

                <div className="text-sm text-slate-300 mt-4 pt-4 border-t border-slate-700 leading-relaxed">
                  {skill.summary}
                </div>
              </div>
            ))}
          </div>

          {/* ページネーション */}
          {result.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#efefef] hover:text-[#303027] rounded"
              >
                前へ
              </button>
              <span className="px-4 py-2 text-[#6d6d6d]">
                {page} / {result.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(result.pagination.totalPages, p + 1))}
                disabled={page === result.pagination.totalPages}
                className="px-4 py-2 bg-[#6d6d6d] hover:bg-[#efefef] disabled:bg-[#303027] text-[#efefef] hover:text-[#303027] rounded"
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
