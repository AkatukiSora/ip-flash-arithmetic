/**
 * ネットワーク生成に関するユーティリティ関数
 */
import { calculateNetworkAddress } from './subnet-utils'

export interface NetworkEntry {
  network: string
  cidr: number
}

/**
 * ネットワーク重複チェッククラス
 */
export class NetworkDuplicateChecker {
  private correctNetwork: string
  private correctCidr: number
  private existingNetworks: NetworkEntry[]

  constructor(correctNetwork: string, correctCidr: number, existingNetworks: NetworkEntry[] = []) {
    this.correctNetwork = correctNetwork
    this.correctCidr = correctCidr
    this.existingNetworks = [...existingNetworks] // 配列のコピーを作成
  }

  addNetwork(network: string, cidr: number): void {
    this.existingNetworks.push({ network, cidr })
  }

  isDuplicate(network: string, cidr: number): boolean {
    // 正解との重複チェック
    if (network === this.correctNetwork && cidr === this.correctCidr) {
      return true
    }
    
    // 既存の選択肢との重複チェック
    return this.existingNetworks.some(entry => 
      entry.network === network && entry.cidr === cidr
    )
  }

  getExistingNetworks(): NetworkEntry[] {
    return [...this.existingNetworks]
  }

  size(): number {
    return this.existingNetworks.length
  }
}

/**
 * ランダムなIPアドレスを生成する
 */
export function generateRandomIpAddress(): string {
  const parts = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256))
  return parts.join('.')
}

/**
 * 似ているがマッチしないネットワークアドレスを生成する
 */
export function generateNonMatchingButSimilarNetwork(targetIp: string, cidr: number): string {
  const ipParts = targetIp.split('.').map(Number)
  
  // まず対象IPでネットワークアドレスを計算
  const targetNetworkAddress = calculateNetworkAddress(targetIp, cidr)
  
  // 元のIPアドレスに似ているが、ネットワーク部が異なるアドレスを生成
  const similarParts = [...ipParts]
  
  // 複数回試行して、確実に異なるネットワークを生成
  let attempts = 0
  let resultNetwork: string
  
  do {
    // CIDRに応じて適切な位置を変更
    if (cidr <= 8) {
      // 最初のオクテットを変更
      similarParts[0] = (similarParts[0] + Math.floor(Math.random() * 50) + 1) % 256
    } else if (cidr <= 16) {
      // 2番目のオクテットを変更
      similarParts[1] = (similarParts[1] + Math.floor(Math.random() * 20) + 1) % 256
    } else if (cidr <= 24) {
      // 3番目のオクテットを変更
      similarParts[2] = (similarParts[2] + Math.floor(Math.random() * 10) + 1) % 256
    } else {
      // 4番目のオクテットを変更（サブネット境界を考慮）
      const hostBits = 32 - cidr
      const subnetSize = Math.pow(2, hostBits)
      const currentSubnet = Math.floor(similarParts[3] / subnetSize) * subnetSize
      
      let newSubnet
      // より確実に異なるサブネットを選択
      const randomOffset = Math.floor(Math.random() * 3) + 1 // 1, 2, 3のいずれか
      if (currentSubnet + (subnetSize * randomOffset) < 256) {
        newSubnet = currentSubnet + (subnetSize * randomOffset)
      } else if (currentSubnet - (subnetSize * randomOffset) >= 0) {
        newSubnet = currentSubnet - (subnetSize * randomOffset)
      } else {
        // フォールバック：3番目のオクテットを変更
        similarParts[2] = (similarParts[2] + Math.floor(Math.random() * 5) + 1) % 256
        newSubnet = 0
      }
      
      similarParts[3] = newSubnet
    }
    
    resultNetwork = calculateNetworkAddress(similarParts.join('.'), cidr)
    attempts++
    
    // 無限ループ防止
    if (attempts > 50) {
      // 最後の手段：完全にランダムなネットワークを生成
      const randomIp = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
      resultNetwork = calculateNetworkAddress(randomIp, cidr)
      break
    }
  } while (resultNetwork === targetNetworkAddress)
  
  return resultNetwork
}

/**
 * 紛らわしいネットワークアドレスを生成する（CIDRが大きいがマッチしない）
 */
export function generateConfusingNetwork(targetIp: string, confusingCidr: number, baseCidr: number): string | null {
  // 基準となるネットワークを計算
  const baseNetwork = calculateNetworkAddress(targetIp, baseCidr)
  const baseNetworkParts = baseNetwork.split('.').map(Number)
  
  // より具体的なネットワーク部で、最後の数ビットだけ違うアドレスを生成
  const confusingParts = [...baseNetworkParts]
  
  let attempts = 0
  let resultNetwork: string | null = null
  
  while (attempts < 10) {
    // CIDRに応じて適切な位置のビットを変更
    if (confusingCidr <= 24) {
      // /24以下の場合、最後のオクテットで違いを作る
      const increment = Math.max(1, Math.floor(Math.random() * 64) + 1)
      confusingParts[3] = (confusingParts[3] + increment) % 256
    } else {
      // /25以上の場合、より細かい単位で違いを作る
      const hostBits = 32 - confusingCidr
      const subnetIncrement = Math.pow(2, hostBits)
      confusingParts[3] = Math.floor(confusingParts[3] / subnetIncrement) * subnetIncrement
      
      // 隣接するサブネットアドレスを生成（複数の選択肢を試す）
      const multiplier = (attempts % 2 === 0) ? 1 : -1
      const offset = Math.floor(attempts / 2) + 1
      
      if (confusingParts[3] + (subnetIncrement * multiplier * offset) < 256 && 
          confusingParts[3] + (subnetIncrement * multiplier * offset) >= 0) {
        confusingParts[3] += subnetIncrement * multiplier * offset
      } else if (attempts < 5) {
        // 他のオクテットを少し変更してみる
        confusingParts[2] = (confusingParts[2] + 1) % 256
        confusingParts[3] = 0
      } else {
        attempts++
        continue
      }
    }
    
    const candidateNetwork = confusingParts.join('.')
    
    // 対象IPがこのネットワークに属さないことを確認
    if (!ipBelongsToNetwork(targetIp, candidateNetwork, confusingCidr)) {
      resultNetwork = candidateNetwork
      break
    }
    
    // 次の試行のために値をリセット
    confusingParts[0] = baseNetworkParts[0]
    confusingParts[1] = baseNetworkParts[1]
    confusingParts[2] = baseNetworkParts[2]
    confusingParts[3] = baseNetworkParts[3]
    
    attempts++
  }
  
  return resultNetwork
}

/**
 * IPアドレスが特定のネットワークに属するかを判定する
 */
function ipBelongsToNetwork(ip: string, networkAddress: string, cidr: number): boolean {
  const targetNetwork = calculateNetworkAddress(ip, cidr)
  return targetNetwork === networkAddress
}

/**
 * 確実にユニークなネットワークを生成する最終フォールバック
 */
export function generateUniqueNetworkFallback(
  checker: NetworkDuplicateChecker,
  possibleCidrs: number[]
): NetworkEntry {
  // 確実に重複しない選択肢を生成
  let uniqueNetwork: string
  let uniqueCidr: number
  let uniqueAttempts = 0
  
  do {
    uniqueCidr = possibleCidrs[Math.floor(Math.random() * possibleCidrs.length)]
    const baseIp = generateRandomIpAddress()
    uniqueNetwork = calculateNetworkAddress(baseIp, uniqueCidr)
    uniqueAttempts++
  } while (checker.isDuplicate(uniqueNetwork, uniqueCidr) && uniqueAttempts < 50)
  
  // 最終手段：既存の選択肢から派生させて確実にユニークにする
  if (checker.isDuplicate(uniqueNetwork, uniqueCidr)) {
    const baseCidr = 24
    const baseNetwork = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.0`
    uniqueNetwork = baseNetwork
    uniqueCidr = baseCidr
    
    // それでも重複する場合は、IPアドレスを少しずつ変更
    let offset = 1
    while (checker.isDuplicate(uniqueNetwork, uniqueCidr) && offset < 256) {
      const parts = uniqueNetwork.split('.').map(Number)
      parts[2] = (parts[2] + offset) % 256
      uniqueNetwork = parts.join('.')
      offset++
    }
  }
  
  return { network: uniqueNetwork, cidr: uniqueCidr }
}
