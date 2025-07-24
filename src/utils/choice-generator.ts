/**
 * クイズ問題の選択肢生成ユーティリティ
 */
import { generateRandomIpAddress } from './network-generator'
import { cidrToSubnetMask } from './ip-utils'
import { calculateNetworkAddress } from './subnet-utils'

/**
 * 配列をシャッフルする
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * ランダムな2進数表記IPアドレスを生成する
 */
export function generateRandomBinaryIp(): string {
  const ip = generateRandomIpAddress()
  return ip.split('.').map(part => parseInt(part).toString(2).padStart(8, '0')).join('.')
}

/**
 * ランダムなCIDRを生成する
 */
export function generateRandomCidr(): number {
  return Math.floor(Math.random() * 25) + 8 // /8 から /32
}

/**
 * ランダムなサブネットマスクを生成する（有効なCIDRベース）
 */
export function generateRandomSubnetMask(): string {
  // /8, /16, /24, /30などの一般的なCIDRからランダム選択
  const commonCidrs = [8, 16, 24, 25, 26, 27, 28, 29, 30]
  const randomCidr = commonCidrs[Math.floor(Math.random() * commonCidrs.length)]
  return cidrToSubnetMask(randomCidr)
}

/**
 * 間違った選択肢を生成する
 */
export function generateWrongChoices(correctAnswer: string, type: 'ip' | 'binary' | 'number'): string[] {
  const wrongChoices: string[] = []
  let attempts = 0
  const maxAttempts = 100 // 無限ループを防ぐ
  
  while (wrongChoices.length < 3 && attempts < maxAttempts) {
    let wrongChoice: string
    attempts++
    
    switch (type) {
      case 'ip':
        wrongChoice = generateRandomIpAddress()
        break
      case 'binary':
        wrongChoice = generateRandomBinaryIp()
        break
      case 'number':
        const baseNumber = parseInt(correctAnswer, 10)
        const variation = Math.floor(Math.random() * 100) + 1
        const sign = Math.random() > 0.5 ? 1 : -1
        wrongChoice = Math.max(0, baseNumber + (variation * sign)).toString()
        break
      default:
        wrongChoice = generateRandomIpAddress()
    }
    
    if (wrongChoice !== correctAnswer && !wrongChoices.includes(wrongChoice)) {
      wrongChoices.push(wrongChoice)
    }
  }
  
  // 必要な数の選択肢が生成できなかった場合のフォールバック
  while (wrongChoices.length < 3) {
    const currentIndex = wrongChoices.length
    const uniqueId = `${Date.now()}-${currentIndex}-${Math.random().toString(36).substring(2, 8)}`
    const fallbackChoice = `fallback-${uniqueId}`
    
    // 重複チェックを行うが、確実に追加する
    if (!wrongChoices.includes(fallbackChoice) && fallbackChoice !== correctAnswer) {
      wrongChoices.push(fallbackChoice)
    } else {
      // 重複していても強制的に追加（無限ループを防ぐ）
      const forcedChoice = `forced-${Date.now()}-${currentIndex}-${Math.random().toString(36).substring(2, 10)}`
      wrongChoices.push(forcedChoice)
    }
  }
  
  return wrongChoices
}

/**
 * サブネットマスクの重複しない選択肢を生成
 */
export function generateUniqueSubnetChoices(correctSubnet: string): string[] {
  const wrongChoices: string[] = []
  let attempts = 0
  
  // 重複しない間違い選択肢を生成
  while (wrongChoices.length < 3 && attempts < 100) {
    const wrongSubnet = generateRandomSubnetMask()
    if (wrongSubnet !== correctSubnet && !wrongChoices.includes(wrongSubnet)) {
      wrongChoices.push(wrongSubnet)
    }
    attempts++
  }
  
  // フォールバック: 十分な選択肢が生成できない場合
  while (wrongChoices.length < 3) {
    const fallbackCidr = generateRandomCidr()
    const fallbackSubnet = cidrToSubnetMask(fallbackCidr)
    if (fallbackSubnet !== correctSubnet && !wrongChoices.includes(fallbackSubnet)) {
      wrongChoices.push(fallbackSubnet)
    } else {
      // 強制的にフォールバック選択肢を生成
      const forcedCidr = 8 + (wrongChoices.length * 4) // 8, 12, 16など
      const forcedSubnet = cidrToSubnetMask(forcedCidr)
      wrongChoices.push(forcedSubnet)
    }
  }
  
  return wrongChoices
}

/**
 * CIDRの重複しない選択肢を生成
 */
export function generateUniqueCidrChoices(correctCidr: number): string[] {
  const wrongChoices: string[] = []
  let attempts = 0
  
  while (wrongChoices.length < 3 && attempts < 100) {
    const wrongCidr = generateRandomCidr()
    const wrongCidrStr = `/${wrongCidr}`
    if (wrongCidr !== correctCidr && !wrongChoices.includes(wrongCidrStr)) {
      wrongChoices.push(wrongCidrStr)
    }
    attempts++
  }
  
  // フォールバック: 十分な選択肢が生成できない場合
  while (wrongChoices.length < 3) {
    const forcedCidr = 10 + (wrongChoices.length * 5) // 10, 15, 20など
    const forcedCidrStr = `/${forcedCidr}`
    wrongChoices.push(forcedCidrStr)
  }
  
  return wrongChoices
}

/**
 * 選択肢をシャッフルして正解のインデックスを返す
 */
export function shuffleChoices(correctAnswer: string, wrongChoices: string[], fallbackType: 'network' | 'default' = 'default'): { choices: string[], correctIndex: number } {
  // 間違い選択肢を最大3個まで取得し、不足分はフォールバックで補完
  const validWrongChoices = wrongChoices.slice(0, 3)
  
  // 不足している選択肢をフォールバックで生成
  let attempts = 0
  const maxAttempts = 50
  
  while (validWrongChoices.length < 3 && attempts < maxAttempts) {
    let fallbackChoice: string
    
    if (fallbackType === 'network') {
      // ネットワーク形式のフォールバック - より確実な重複回避
      const baseOctet = 10 + (attempts * 7 + validWrongChoices.length * 11) % 245 // 10-254の範囲
      const randomIp = `${baseOctet}.${(attempts * 3) % 256}.${validWrongChoices.length * 17 % 256}.0`
      const randomCidr = [8, 12, 16, 20, 24, 28][attempts % 6]
      const networkAddress = calculateNetworkAddress(randomIp, randomCidr)
      fallbackChoice = `${networkAddress}/${randomCidr}`
    } else {
      // デフォルトのフォールバック
      fallbackChoice = `fallback-${validWrongChoices.length}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    }
    
    // 重複チェック：正解と既存の間違い選択肢との重複を確認
    if (fallbackChoice !== correctAnswer && !validWrongChoices.includes(fallbackChoice)) {
      validWrongChoices.push(fallbackChoice)
    }
    
    attempts++
  }
  
  // 最終的に足りない場合は強制的にユニークな選択肢を作成
  while (validWrongChoices.length < 3) {
    let fallbackChoice: string
    const currentIndex = validWrongChoices.length
    
    if (fallbackType === 'network') {
      // ネットワーク形式のための確実にユニークなフォールバック
      const uniqueOctet = 100 + currentIndex * 30 + (Date.now() % 50)
      const uniqueCidr = [8, 16, 24, 30][currentIndex % 4] // 有効なCIDR値のみ使用
      fallbackChoice = `${uniqueOctet % 256}.${(uniqueOctet + currentIndex) % 256}.${currentIndex}.0/${uniqueCidr}`
    } else {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      fallbackChoice = `fallback-${uniqueId}`
    }
    
    // 重複チェックを行うが、最大3回の試行後は強制的に追加
    let retryCount = 0
    while ((fallbackChoice === correctAnswer || validWrongChoices.includes(fallbackChoice)) && retryCount < 3) {
      retryCount++
      if (fallbackType === 'network') {
        const uniqueOctet = 150 + currentIndex + retryCount + (Date.now() % 30)
        const uniqueCidr = [20, 25, 28, 29][currentIndex % 4]
        fallbackChoice = `${uniqueOctet}.${uniqueOctet}.${uniqueOctet}.0/${uniqueCidr}`
      } else {
        const uniqueId = `${Date.now()}-${retryCount}-${Math.random().toString(36).substring(2, 15)}`
        fallbackChoice = `fallback-${uniqueId}`
      }
    }
    
    // 確実に追加（重複していても強制的に追加して無限ループを防ぐ）
    validWrongChoices.push(fallbackChoice)
  }
  
  // 正解と間違い選択肢を結合（必ず4個になる）
  const allChoices = [correctAnswer, ...validWrongChoices]
  
  // シャッフル
  const shuffled = shuffleArray(allChoices)
  
  // 正解のインデックスを見つける
  const correctIndex = shuffled.indexOf(correctAnswer)
  
  return {
    choices: shuffled,
    correctIndex
  }
}
