'use client'

import { useState } from 'react'

interface CSVImportProps {
  endpoint: string
  title: string
  description: string
  sampleHeaders: string[]
  fieldNotes?: { field: string; note: string }[]
}

export function CSVImport({ endpoint, title, description, sampleHeaders, fieldNotes }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'インポートが完了しました',
          count: data.count,
        })
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('csv-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setResult({
          success: false,
          message: data.error || 'インポートに失敗しました',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'エラーが発生しました',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-300 mb-6">{description}</p>

        <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">CSVフォーマット</h3>
          <p className="text-sm text-slate-400 mb-2">以下のヘッダーを含むCSVファイルをアップロードしてください：</p>
          <code className="text-sm text-green-400 block bg-slate-950 p-3 rounded overflow-x-auto whitespace-pre-wrap break-all">
            {sampleHeaders.join(',')}
          </code>
          
          {fieldNotes && fieldNotes.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-white">フィールド説明：</h4>
              {fieldNotes.map((note, index) => (
                <div key={index} className="text-xs text-slate-400">
                  <span className="text-green-400 font-mono">{note.field}</span>: {note.note}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="csv-file" className="block text-white mb-2">
              CSVファイルを選択
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'インポート中...' : 'インポート実行'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success 
              ? 'bg-green-900/30 border border-green-700' 
              : 'bg-red-900/30 border border-red-700'
          }`}>
            <p className={result.success ? 'text-green-400' : 'text-red-400'}>
              {result.message}
              {result.count !== undefined && ` (${result.count}件)`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
