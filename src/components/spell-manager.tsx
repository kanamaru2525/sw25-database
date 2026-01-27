'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type SpellType = 'SHINGO' | 'SOREI' | 'SHINCHI' | 'SHINSEI' | 'MADOKI' | 'YOSEI' | 'SHINRA' | 'SHOI' | 'NARAKU' | 'HIOU'
type RegulationType = 'TYPE_I' | 'TYPE_II' | 'TYPE_III' | 'DX' | 'ET' | 'ML' | 'MA' | 'BM' | 'AL' | 'RL' | 'BR' | 'BS' | 'AB' | 'BI' | 'DD' | 'US' | 'TS'

interface Spell {
  id: string
  name: string
  type: string
  level: number
  target: string
  range: string
  shape: string
  duration: string
  resistance: string
  cost: string
  attribute: string | null
  fairyAttributes: string[]
  biblioRank: number | null
  summary: string
  magisphere: string | null // LARGE, MEDIUM, SMALL
  page: string
  regulation: string
}

const SPELL_TYPE_LABELS: Record<SpellType, string> = {
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

export function SpellManager() {
  const [spells, setSpells] = useState<Spell[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [editingSpell, setEditingSpell] = useState<Spell | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchSpells = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/spells?${params.toString()}`)
      const data = await response.json()
      setSpells(data.spells)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch spells:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpells()
  }, [page, search])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/spells/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast('削除しました', 'success')
        fetchSpells()
      } else {
        showToast('削除に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to delete spell:', error)
      showToast('削除中にエラーが発生しました', 'error')
    }
  }

  const handleSave = async (spell: Partial<Spell>) => {
    try {
      const url = spell.id ? `/api/admin/spells/${spell.id}` : '/api/admin/spells'
      const method = spell.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spell),
      })

      if (response.ok) {
        setEditingSpell(null)
        setIsCreating(false)
        showToast(spell.id ? '保存しました' : '追加しました', 'success')
        fetchSpells()
      } else {
        showToast('保存に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to save spell:', error)
      showToast('保存中にエラーが発生しました', 'error')
    }
  }

  return (
    <div className="space-y-6">
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
            href="/admin/import/spells"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            CSVインポート
          </Link>
          <button
            onClick={() => setIsCreating(true)}
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="魔法名で検索..."
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">名前</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">種別</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Lv</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">レギュレーション</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {spells.map((spell) => (
                  <tr key={spell.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-white">{spell.name}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {SPELL_TYPE_LABELS[spell.type as SpellType] || spell.type}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{spell.level}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {REGULATION_LABELS[spell.regulation as RegulationType] || spell.regulation}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingSpell(spell)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded mr-2"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(spell.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
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
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded"
              >
                前へ
              </button>
              <span className="px-4 py-2 text-slate-300">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}

      {/* 編集/新規作成モーダル */}
      {(editingSpell || isCreating) && (
        <SpellForm
          spell={editingSpell}
          onSave={handleSave}
          onCancel={() => {
            setEditingSpell(null)
            setIsCreating(false)
          }}
        />
      )}

      {/* トースト通知 */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}

function SpellForm({
  spell,
  onSave,
  onCancel,
}: {
  spell: Spell | null
  onSave: (spell: Partial<Spell>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<Spell>>(
    spell || {
      name: '',
      type: 'SHINGO',
      level: 1,
      target: '',
      range: '',
      shape: '',
      duration: '',
      resistance: '',
      cost: '',
      attribute: '',
      fairyAttributes: [],
      biblioRank: null,
      summary: '',
      magisphere: null,
      page: '',
      regulation: 'TYPE_I',
    }
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full my-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          {spell ? '魔法編集' : '魔法追加'}
        </h2>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">名前</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">種別</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              >
                {Object.entries(SPELL_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">レベル</label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">レギュレーション</label>
              <select
                value={formData.regulation}
                onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              >
                {Object.entries(REGULATION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">射程</label>
              <input
                type="text"
                value={formData.range}
                onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">形状</label>
              <input
                type="text"
                value={formData.shape}
                onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">持続時間</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">消費</label>
              <input
                type="text"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">対象</label>
              <input
                type="text"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">抵抗</label>
              <input
                type="text"
                value={formData.resistance}
                onChange={(e) => setFormData({ ...formData, resistance: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">ページ</label>
              <input
                type="text"
                value={formData.page}
                onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">マギスフィア</label>
              <select
                value={formData.magisphere || ''}
                onChange={(e) => setFormData({ ...formData, magisphere: e.target.value || null })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
              >
                <option value="">不要</option>
                <option value="SMALL">小</option>
                <option value="MEDIUM">中</option>
                <option value="LARGE">大</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">概要</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                保存中...
              </>
            ) : (
              '保存'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
