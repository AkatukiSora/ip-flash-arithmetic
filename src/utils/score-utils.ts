/**
 * スコア管理のユーティリティ関数（静的サイト対応版）
 */

export interface ScoreData {
  nickname: string
  score: number
  accuracy: number
  totalQuestions: number
}

export interface RankingEntry {
  id: string
  nickname: string
  score: number
  accuracy: number
  totalQuestions: number
  createdAt: Date
}

/**
 * ローカルストレージからスコアを取得する
 */
function getScoresFromStorage(): RankingEntry[] {
  if (typeof window === 'undefined') return []
  
  try {
    const scores = localStorage.getItem('ip-flush-scores')
    return scores ? JSON.parse(scores) : []
  } catch {
    return []
  }
}

/**
 * ローカルストレージにスコアを保存する
 */
function saveScoresToStorage(scores: RankingEntry[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('ip-flush-scores', JSON.stringify(scores))
  } catch (error) {
    console.error('Failed to save scores to localStorage:', error)
  }
}

/**
 * スコアを保存する（ローカルストレージ版）
 */
export function saveScore(data: ScoreData): RankingEntry {
  const newEntry: RankingEntry = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    nickname: data.nickname,
    score: data.score,
    accuracy: data.accuracy,
    totalQuestions: data.totalQuestions,
    createdAt: new Date()
  }
  
  const scores = getScoresFromStorage()
  scores.push(newEntry)
  
  // スコア順でソート（降順）
  scores.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    if (a.accuracy !== b.accuracy) return b.accuracy - a.accuracy
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
  
  // 上位100件まで保持
  const limitedScores = scores.slice(0, 100)
  saveScoresToStorage(limitedScores)
  
  return newEntry
}

/**
 * ランキングを取得する（上位30件）
 */
export function getRanking(): RankingEntry[] {
  const scores = getScoresFromStorage()
  return scores.slice(0, 30)
}

/**
 * 特定のニックネームの最高スコアを取得する
 */
export function getBestScore(nickname: string): RankingEntry | null {
  const scores = getScoresFromStorage()
  const userScores = scores.filter(score => score.nickname === nickname)
  
  if (userScores.length === 0) return null
  
  // すでにソート済みなので最初の要素が最高スコア
  return userScores[0]
}
