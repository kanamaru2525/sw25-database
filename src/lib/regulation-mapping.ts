import { prisma } from './prisma'

/**
 * RegulationConfigテーブルから動的にマッピングを生成する
 * CSVのインポート時に日本語表記からDBのコードに変換するために使用
 */
export async function getRegulationMapping(): Promise<{ [key: string]: string }> {
  try {
    const regulations = await prisma.regulationConfig.findMany()
    const mapping: { [key: string]: string } = {}
    
    // name -> code のマッピング
    regulations.forEach(reg => {
      mapping[reg.name] = reg.code
      // code自体もそのまま許可（CSVにコードが入っている場合）
      mapping[reg.code] = reg.code
    })
    
    return mapping
  } catch (error) {
    console.error('Failed to get regulation mapping:', error)
    // フォールバック: 空のマッピングを返す
    return {}
  }
}

/**
 * 入力値を正規化してレギュレーションコードに変換
 * マッピングに存在しない場合は入力値をそのまま返す
 */
export function normalizeRegulation(value: string, mapping: { [key: string]: string }): string {
  return mapping[value] || value
}
