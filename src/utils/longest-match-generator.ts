/**
 * ロンゲストマッチ問題生成のユーティリティ
 */
import { calculateNetworkAddress } from './subnet-utils'
import { 
  NetworkEntry, 
  NetworkDuplicateChecker, 
  generateRandomIpAddress 
} from './network-generator'
import { ipBelongsToNetwork } from './ip-utils'

/**
 * ロンゲストマッチ問題の結果
 */
export interface LongestMatchNetworksResult {
  targetIp: string
  correctNetwork: string
  correctCidr: number
  otherNetworks: NetworkEntry[]
  explanation: string
}

/**
 * IPアドレスがネットワークに属さない、似ているネットワークを生成する
 */
function generateNonMatchingButSimilarNetwork(targetIp: string, cidr: number): string {
  const parts = targetIp.split('.').map(Number)
  
  // 最後のオクテットを変更
  if (cidr >= 24) {
    parts[3] = (parts[3] + 64) % 256
  } 
  // 3番目のオクテットを変更
  else if (cidr >= 16) {
    parts[2] = (parts[2] + 1) % 256
  }
  // 2番目のオクテットを変更
  else if (cidr >= 8) {
    parts[1] = (parts[1] + 1) % 256
  }
  // 1番目のオクテットを変更
  else {
    parts[0] = (parts[0] + 1) % 256
  }
  
  const modifiedIp = parts.join('.')
  return calculateNetworkAddress(modifiedIp, cidr)
}

/**
 * 紛らわしいネットワークを生成する（対象IPのサブネット）
 */
function generateConfusingNetwork(targetIp: string, confusingCidr: number, correctCidr: number): string | null {
  if (confusingCidr <= correctCidr) return null
  
  const targetParts = targetIp.split('.').map(Number)
  
  // より具体的なサブネット内で、わずかに異なるネットワークを生成
  if (confusingCidr >= 24) {
    targetParts[3] = (targetParts[3] + Math.floor(Math.random() * 16) + 1) % 256
  } else if (confusingCidr >= 16) {
    targetParts[2] = (targetParts[2] + Math.floor(Math.random() * 4) + 1) % 256
  } else {
    targetParts[1] = (targetParts[1] + Math.floor(Math.random() * 4) + 1) % 256
  }
  
  const confusingIp = targetParts.join('.')
  return calculateNetworkAddress(confusingIp, confusingCidr)
}

/**
 * 通常のロンゲストマッチ選択肢を生成
 */
function generateLongestMatchChoices(
  targetIp: string,
  correctNetwork: string,
  correctCidr: number,
  possibleCidrs: number[],
  otherNetworks: NetworkEntry[]
): void {
  const checker = new NetworkDuplicateChecker(correctNetwork, correctCidr, otherNetworks)
  
  // より短いCIDR（より大きなネットワーク）を追加
  const shorterCidrs = possibleCidrs.filter(cidr => cidr < correctCidr)
  if (shorterCidrs.length > 0 && otherNetworks.length < 3) {
    for (const shorterCidr of shorterCidrs) {
      if (otherNetworks.length >= 3) break
      
      const shorterNetwork = calculateNetworkAddress(targetIp, shorterCidr)
      
      // 正解や既存の選択肢と異なることを確認
      if (!checker.isDuplicate(shorterNetwork, shorterCidr)) {
        otherNetworks.push({ network: shorterNetwork, cidr: shorterCidr })
        checker.addNetwork(shorterNetwork, shorterCidr)
        break // 1つだけ追加
      }
    }
  }

  // 紛らわしい選択肢を生成
  let attempts = 0
  const maxAttempts = 200
  
  while (otherNetworks.length < 3 && attempts < maxAttempts) {
    const confusingCidr = possibleCidrs[Math.floor(Math.random() * possibleCidrs.length)]
    
    // 正解より具体的（CIDRが大きい）だが、ネットワーク部が微妙に違う選択肢
    if (confusingCidr > correctCidr) {
      const confusingNetwork = generateConfusingNetwork(targetIp, confusingCidr, correctCidr)
      if (confusingNetwork && 
          !ipBelongsToNetwork(targetIp, confusingNetwork, confusingCidr) &&
          !checker.isDuplicate(confusingNetwork, confusingCidr)) {
        otherNetworks.push({ network: confusingNetwork, cidr: confusingCidr })
        checker.addNetwork(confusingNetwork, confusingCidr)
        attempts++
        continue
      }
    }
    
    // 似ているがマッチしないネットワークを生成
    const similarNetwork = generateNonMatchingButSimilarNetwork(targetIp, confusingCidr)
    if (!checker.isDuplicate(similarNetwork, confusingCidr)) {
      otherNetworks.push({ network: similarNetwork, cidr: confusingCidr })
      checker.addNetwork(similarNetwork, confusingCidr)
    }
    
    attempts++
  }
  
  // フォールバック：選択肢が足りない場合は完全にランダムなネットワークを追加
  let fallbackAttempts = 0
  const maxFallbackAttempts = 100
  
  while (otherNetworks.length < 3 && fallbackAttempts < maxFallbackAttempts) {
    const fallbackCidr = possibleCidrs[Math.floor(Math.random() * possibleCidrs.length)]
    const randomIp = generateRandomIpAddress()
    const fallbackNetwork = calculateNetworkAddress(randomIp, fallbackCidr)
    
    if (!checker.isDuplicate(fallbackNetwork, fallbackCidr)) {
      otherNetworks.push({ network: fallbackNetwork, cidr: fallbackCidr })
      checker.addNetwork(fallbackNetwork, fallbackCidr)
    }
    
    fallbackAttempts++
  }
  
  // 最終フォールバック：どうしても3つの選択肢が作れない場合
  if (otherNetworks.length < 3) {
    const remainingCount = 3 - otherNetworks.length
    for (let i = 0; i < remainingCount; i++) {
      const uniqueEntry = generateUniqueNetworkFallback(checker, possibleCidrs)
      otherNetworks.push(uniqueEntry)
      checker.addNetwork(uniqueEntry.network, uniqueEntry.cidr)
    }
  }
}

/**
 * ロンゲストマッチ問題のためのネットワーク候補を生成する
 */
export function generateLongestMatchNetworks(targetIp: string): LongestMatchNetworksResult {
  // 20%の確率でデフォルトルートが正解になるケースを生成
  if (Math.random() < 0.2) {
    // デフォルトルートが正解の場合
    const correctNetwork = '0.0.0.0'
    const correctCidr = 0
    
    // 他の選択肢として通常のネットワークを生成
    const otherNetworks: NetworkEntry[] = []
    const possibleCidrs = [16, 20, 24, 28]
    
    // マッチしないネットワークを3つ生成
    for (let i = 0; i < 3; i++) {
      const cidr = possibleCidrs[Math.floor(Math.random() * possibleCidrs.length)]
      // 対象IPとは異なるネットワーク範囲のIPを生成
      const parts = targetIp.split('.').map(Number)
      parts[0] = (parts[0] + 100 + i * 50) % 256 // 異なる第1オクテット
      const nonMatchingIp = parts.join('.')
      const networkAddress = calculateNetworkAddress(nonMatchingIp, cidr)
      
      // 対象IPがこのネットワークに属さないことを確認
      if (!ipBelongsToNetwork(targetIp, networkAddress, cidr)) {
        otherNetworks.push({ network: networkAddress, cidr })
      } else {
        // マッチしてしまう場合は、別のネットワークを生成
        const altNetwork = `${10 + i}.${20 + i}.${30 + i}.0`
        otherNetworks.push({ network: altNetwork, cidr: 24 })
      }
    }
    
    const explanation = generateLongestMatchExplanation(
      targetIp, correctNetwork, correctCidr, otherNetworks
    )
    
    return {
      targetIp,
      correctNetwork,
      correctCidr,
      otherNetworks: otherNetworks.slice(0, 3),
      explanation
    }
  }
  
  // 通常のケース：具体的なネットワークが正解
  const possibleCidrs = [16, 20, 24, 28]
  const correctCidr = possibleCidrs[Math.floor(Math.random() * possibleCidrs.length)]
  
  // 対象IPアドレスから正解のネットワークアドレスを計算
  const correctNetwork = calculateNetworkAddress(targetIp, correctCidr)
  
  // 他の選択肢を格納する配列
  const otherNetworks: NetworkEntry[] = []
  
  // デフォルトルートを40%の確率で他の選択肢として追加
  if (Math.random() < 0.4) {
    otherNetworks.push({ network: '0.0.0.0', cidr: 0 })
  }
  
  // 通常の選択肢を生成
  generateLongestMatchChoices(targetIp, correctNetwork, correctCidr, possibleCidrs, otherNetworks)
  
  // 必ず少なくとも1つのマッチしないネットワークを含むように確認
  const hasNonMatchingNetwork = otherNetworks.some(({ network, cidr }) => 
    !ipBelongsToNetwork(targetIp, network, cidr)
  )
  
  if (!hasNonMatchingNetwork && otherNetworks.length > 0) {
    // 最後の選択肢を確実にマッチしないネットワークに置き換え
    const parts = targetIp.split('.').map(Number)
    parts[0] = (parts[0] + 100) % 256 // 異なる第1オクテット
    const nonMatchingIp = parts.join('.')
    const nonMatchingNetwork = calculateNetworkAddress(nonMatchingIp, 24)
    otherNetworks[otherNetworks.length - 1] = { network: nonMatchingNetwork, cidr: 24 }
  }
  
  // 説明を生成
  const explanation = generateLongestMatchExplanation(
    targetIp,
    correctNetwork,
    correctCidr,
    otherNetworks
  )
  
  return {
    targetIp,
    correctNetwork,
    correctCidr,
    otherNetworks: otherNetworks.slice(0, 3), // 最大3個まで
    explanation
  }
}

/**
 * ロンゲストマッチの説明を生成
 */
export function generateLongestMatchExplanation(
  targetIp: string,
  correctNetwork: string,
  correctCidr: number,
  otherNetworks: NetworkEntry[]
): string {
  let explanation = `✅ 正解：${correctNetwork}/${correctCidr}\n`
  explanation += `💡 ルーティング判定結果：\n`
  
  // 正解の判定
  explanation += `  ${correctNetwork}/${correctCidr} → ○ (最長マッチ)\n`
  
  // 他の選択肢の判定
  otherNetworks.forEach(({ network, cidr }) => {
    const isMatch = ipBelongsToNetwork(targetIp, network, cidr)
    explanation += `  ${network}/${cidr} → ${isMatch ? '○' : '×'}\n`
  })
  
  // デフォルトルートが正解の場合
  if (correctNetwork === '0.0.0.0' && correctCidr === 0) {
    explanation += `\n📍 判定理由：\n`
    explanation += `• 他にマッチするネットワークがない場合\n`
    explanation += `• デフォルトルート（0.0.0.0/0）が選択される\n`
    explanation += `• すべてのIPアドレスがマッチする`
  } else {
    explanation += `\n📍 ロンゲストマッチ：\n`
    explanation += `• 複数のネットワークがマッチする場合\n`
    explanation += `• 最も具体的（CIDR値が最も大きい）なものを選択\n`
    explanation += `• より詳細なルートが優先される`
  }
  
  return explanation
}

/**
 * 一意なネットワークエントリを生成する最終フォールバック
 */
function generateUniqueNetworkFallback(checker: NetworkDuplicateChecker, possibleCidrs: number[]): NetworkEntry {
  // 固定パターンから生成を試行
  const fallbackPatterns = [
    '10.0.0.0', '172.16.0.0', '192.168.0.0',
    '203.0.113.0', '198.51.100.0', '192.0.2.0'
  ]
  
  for (const baseNetwork of fallbackPatterns) {
    for (const cidr of possibleCidrs) {
      if (!checker.isDuplicate(baseNetwork, cidr)) {
        return { network: baseNetwork, cidr }
      }
    }
  }
  
  // それでも見つからない場合は強制的に一意なものを生成
  let counter = 1
  while (counter < 255) {
    const uniqueNetwork = `10.${counter}.0.0`
    for (const cidr of possibleCidrs) {
      if (!checker.isDuplicate(uniqueNetwork, cidr)) {
        return { network: uniqueNetwork, cidr }
      }
    }
    counter++
  }
  
  // 最終的なフォールバック
  return { network: '10.255.255.0', cidr: 24 }
}
