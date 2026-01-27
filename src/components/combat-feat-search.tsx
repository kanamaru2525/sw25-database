'use client'

import { useState, useEffect } from 'react'

type FeatType = 'ALL' | 'PASSIVE' | 'MAJOR' | 'DECLARATION'
type RegulationType = 'ALL' | 'TYPE_I' | 'TYPE_II' | 'TYPE_III' | 'DX' | 'ET' | 'ML' | 'MA' | 'BM' | 'AL' | 'RL' | 'BR' | 'BS' | 'AB' | 'BI' | 'DD' | 'US' | 'TS'

interface CombatFeat {
  id: string
  name: string
  type: string
  requirement: string | null
  target: string | null
  risk: string | null
  summary: string
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
  feats: CombatFeat[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const FEAT_TYPE_LABELS: Record<FeatType, string> = {
  ALL: 'すべて',
  PASSIVE: '常時特技',
  MAJOR: '主動作特技',
  DECLARATION: '宣言特技',
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

export function CombatFeatSearch() {
  const [featType, setFeatType] = useState<FeatType>('ALL')
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

  const handleCopy = async (feat: CombatFeat) => {
    const text = `${feat.name}
${FEAT_TYPE_LABELS[feat.type as FeatType] || feat.type} ${REGULATION_LABELS[feat.regulation as RegulationType] || feat.regulation}${feat.requirement ? ` / 前提:${feat.requirement}` : ''}${feat.target ? ` / 対象:${feat.target}` : ''}${feat.risk ? ` / 宣言:${feat.risk}` : ''}`

    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(feat.id)
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
      if (featType !== 'ALL') params.append('featType', featType)
      
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
      
      const response = await fetch(`/api/skills?${params.toString()}`)
      
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
  }, [featType, selectedPresetId])

  return (
    <div className="space-y-6">
      {/* 検索フィルタ */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 特技タイプ */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              特技タイプ
            </label>
            <select
              value={featType}
              onChange={(e) => setFeatType(e.target.value as FeatType)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(FEAT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* レギュレーション */}
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

          {/* 名前検索 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              特技名
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="特技名で検索"
                className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
              >
                検索
              </button>
            </div>
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
            {result.pagination.total}件の特技が見つかりました
          </div>

          {/* 特技リスト */}
          <div className="space-y-3">
            {result.feats.map((feat) => (
              <div
                key={feat.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 border border-slate-700 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {feat.name}
                    </h3>
                    <div className="flex gap-3 text-sm text-slate-400">
                      <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {FEAT_TYPE_LABELS[feat.type as FeatType] || feat.type}
                      </span>
                      <span>{REGULATION_LABELS[feat.regulation as RegulationType] || feat.regulation}</span>
                      <span className="text-slate-500">{feat.page}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(feat)}
                    className="ml-4 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded transition-colors text-sm flex items-center gap-2"
                    title="情報をコピー"
                  >
                    {copiedId === feat.id ? (
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
                  {feat.requirement && (
                    <>
                      <span>
                        <span className="text-slate-400">前提:</span>
                        <span className="ml-1 text-white">{feat.requirement}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                    </>
                  )}
                  {feat.target && (
                    <>
                      <span>
                        <span className="text-slate-400">対象:</span>
                        <span className="ml-1 text-white">{feat.target}</span>
                      </span>
                      <span className="text-slate-600">/</span>
                    </>
                  )}
                  {feat.risk && (
                    <span>
                      <span className="text-slate-400">宣言:</span>
                      <span className="ml-1 text-white">{feat.risk}</span>
                    </span>
                  )}
                </div>

                <div className="text-sm text-slate-300 mt-4 pt-4 border-t border-slate-700 leading-relaxed">
                  {feat.summary}
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
