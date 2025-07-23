/**
 * 問題生成のユーティリティ関数
 */
import { ipToBinary, cidrToSubnetMask } from './ip-utils'
import { calculateNetworkAddress, calculateBroadcastAddress, calculateHostCount } from './subnet-utils'

/**
 * IPアドレスが特定のネットワークに属するかを判定する
 */
function ipBelongsToNetwork(ip: string, networkAddress: string, cidr: number): boolean {
  const targetNetwork = calculateNetworkAddress(ip, cidr)
  return targetNetwork === networkAddress
}

/**
 * ロンゲストマッチ問題のためのネットワーク候補を生成する
 */
function generateLongestMatchNetworks(targetIp: string): {
  correctNetwork: string;
  correctCidr: number;
  otherNetworks: Array<{ network: string; cidr: number }>;
  includeDefaultRoute: boolean;
} {
  const ipParts = targetIp.split('.').map(Number)
  
  // 正解となるネットワークのCIDRを決定（/16, /20, /24, /28から選択）
  const possibleCidrs = [16, 20, 24, 28, 29, 30]
  const correctCidr = possibleCidrs[Math.floor(Math.random() * possibleCidrs.length)]
  const correctNetwork = calculateNetworkAddress(targetIp, correctCidr)
  
  // 他の選択肢を生成
  const otherNetworks: Array<{ network: string; cidr: number }> = []
  
  // 20%の確率でデフォルトルートを含む問題を生成
  const includeDefaultRoute = Math.random() < 0.2
  
  if (includeDefaultRoute) {
    // デフォルトルート問題の場合は、正解をより具体的なネットワークにするか、
    // 他のネットワークがマッチしない場合にデフォルトルートが正解になるようにする
    const shouldDefaultRouteBeCorrect = Math.random() < 0.3
    
    if (shouldDefaultRouteBeCorrect) {
      // デフォルトルートが正解の場合：他の選択肢はすべてマッチしないネットワーク
      for (let i = 0; i < 3; i++) {
        const randomCidr = possibleCidrs[Math.floor(Math.random() * possibleCidrs.length)]
        const nonMatchingNetwork = generateNonMatchingButSimilarNetwork(targetIp, randomCidr)
        otherNetworks.push({ network: nonMatchingNetwork, cidr: randomCidr })
      }
      return {
        correctNetwork: '0.0.0.0',
        correctCidr: 0,
        otherNetworks,
        includeDefaultRoute: true
      }
    } else {
      // 通常の正解だが、選択肢にデフォルトルートを含む
      otherNetworks.push({ network: '0.0.0.0', cidr: 0 })
    }
  }
  
  // より短いCIDR（より大きなネットワーク）を追加
  const shorterCidrs = possibleCidrs.filter(cidr => cidr < correctCidr)
  if (shorterCidrs.length > 0 && otherNetworks.length < 3) {
    const shorterCidr = shorterCidrs[Math.floor(Math.random() * shorterCidrs.length)]
    const shorterNetwork = calculateNetworkAddress(targetIp, shorterCidr)
    // 正解と重複しないことを確認
    if (shorterNetwork !== correctNetwork || shorterCidr !== correctCidr) {
      otherNetworks.push({ network: shorterNetwork, cidr: shorterCidr })
    }
  }
  
  // CIDRが大きいがネットワーク部が一部違う紛らわしい選択肢を生成
  let attempts = 0
  while (otherNetworks.length < 3 && attempts < 100) {
    const confusingCidr = possibleCidrs[Math.floor(Math.random() * possibleCidrs.length)]
    
    // 正解より具体的（CIDRが大きい）だが、ネットワーク部が微妙に違う選択肢
    if (confusingCidr > correctCidr) {
      const confusingNetwork = generateConfusingNetwork(targetIp, confusingCidr, correctCidr)
      if (confusingNetwork && !ipBelongsToNetwork(targetIp, confusingNetwork, confusingCidr)) {
        const networkEntry = { network: confusingNetwork, cidr: confusingCidr }
        const isDuplicate = otherNetworks.some(entry => 
          entry.network === networkEntry.network && entry.cidr === networkEntry.cidr
        ) || (confusingNetwork === correctNetwork && confusingCidr === correctCidr)
        if (!isDuplicate) {
          otherNetworks.push(networkEntry)
          continue
        }
      }
    }
    
    // 似ているがマッチしないネットワークを生成
    const similarNetwork = generateNonMatchingButSimilarNetwork(targetIp, confusingCidr)
    const networkEntry = { network: similarNetwork, cidr: confusingCidr }
    const isDuplicate = otherNetworks.some(entry => 
      entry.network === networkEntry.network && entry.cidr === networkEntry.cidr
    ) || (similarNetwork === correctNetwork && confusingCidr === correctCidr)
    
    if (!isDuplicate) {
      otherNetworks.push(networkEntry)
    }
    
    attempts++
  }
  
  // フォールバック：選択肢が足りない場合は完全にランダムなネットワークを追加
  while (otherNetworks.length < 3) {
    const fallbackCidr = possibleCidrs[Math.floor(Math.random() * possibleCidrs.length)]
    const randomIp = generateRandomIpAddress()
    const fallbackNetwork = calculateNetworkAddress(randomIp, fallbackCidr)
    
    const networkEntry = { network: fallbackNetwork, cidr: fallbackCidr }
    const isDuplicate = otherNetworks.some(entry => 
      entry.network === networkEntry.network && entry.cidr === networkEntry.cidr
    ) || (fallbackNetwork === correctNetwork && fallbackCidr === correctCidr)
    
    if (!isDuplicate) {
      otherNetworks.push(networkEntry)
    }
  }
  
  return {
    correctNetwork,
    correctCidr,
    otherNetworks,
    includeDefaultRoute
  }
}

/**
 * 紛らわしいネットワークアドレスを生成する（CIDRが大きいがマッチしない）
 */
function generateConfusingNetwork(targetIp: string, confusingCidr: number, baseCidr: number): string | null {
  const ipParts = targetIp.split('.').map(Number)
  
  // 基準となるネットワークを計算
  const baseNetwork = calculateNetworkAddress(targetIp, baseCidr)
  const baseNetworkParts = baseNetwork.split('.').map(Number)
  
  // より具体的なネットワーク部で、最後の数ビットだけ違うアドレスを生成
  const confusingParts = [...baseNetworkParts]
  
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
    
    // 隣接するサブネットアドレスを生成
    if (confusingParts[3] + subnetIncrement < 256) {
      confusingParts[3] += subnetIncrement
    } else if (confusingParts[3] - subnetIncrement >= 0) {
      confusingParts[3] -= subnetIncrement
    } else {
      return null
    }
  }
  
  return confusingParts.join('.')
}

/**
 * 似ているがマッチしないネットワークアドレスを生成する
 */
function generateNonMatchingButSimilarNetwork(targetIp: string, cidr: number): string {
  const ipParts = targetIp.split('.').map(Number)
  
  // 元のIPアドレスに似ているが、ネットワーク部が異なるアドレスを生成
  const similarParts = [...ipParts]
  
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
    if (currentSubnet + subnetSize < 256) {
      newSubnet = currentSubnet + subnetSize
    } else if (currentSubnet - subnetSize >= 0) {
      newSubnet = currentSubnet - subnetSize
    } else {
      // フォールバック：3番目のオクテットを変更
      similarParts[2] = (similarParts[2] + 1) % 256
      newSubnet = 0
    }
    
    similarParts[3] = newSubnet
  }
  
  return calculateNetworkAddress(similarParts.join('.'), cidr)
}

export enum QuestionType {
  BINARY_IP_CONVERSION = 'BINARY_IP_CONVERSION',
  CIDR_TO_SUBNET = 'CIDR_TO_SUBNET',
  SUBNET_TO_CIDR = 'SUBNET_TO_CIDR',
  NETWORK_ADDRESS = 'NETWORK_ADDRESS',
  BROADCAST_ADDRESS = 'BROADCAST_ADDRESS',
  HOST_COUNT = 'HOST_COUNT',
  HOST_IN_NETWORK = 'HOST_IN_NETWORK',
  LONGEST_MATCH = 'LONGEST_MATCH'
}

export interface QuizQuestion {
  type: QuestionType
  question: string
  choices: string[]
  correctAnswer: number
  explanation?: string
}

/**
 * ランダムなIPアドレスを生成する
 */
export function generateRandomIpAddress(): string {
  const parts = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256))
  return parts.join('.')
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
 * ランダムなCIDRを生成する
 */
export function generateRandomCidr(): number {
  return Math.floor(Math.random() * 25) + 8 // /8 から /32
}

/**
 * ランダムな2進数表記IPアドレスを生成する
 */
export function generateRandomBinaryIp(): string {
  const ip = generateRandomIpAddress()
  return ip.split('.').map(part => parseInt(part).toString(2).padStart(8, '0')).join('.')
}

/**
 * ネットワーク内の有効なホストIPアドレスを生成する
 */
export function generateHostIpInNetwork(networkIp: string, cidr: number): string {
  const networkAddress = calculateNetworkAddress(networkIp, cidr)
  const broadcastAddress = calculateBroadcastAddress(networkIp, cidr)
  
  const networkParts = networkAddress.split('.').map(Number)
  const broadcastParts = broadcastAddress.split('.').map(Number)
  
  // ネットワークアドレスとブロードキャストアドレスの間でランダムなIPを生成
  let hostIp: string
  let attempts = 0
  const maxAttempts = 1000
  
  do {
    const hostParts = networkParts.map((part, index) => {
      const range = broadcastParts[index] - part
      if (range === 0) return part
      return part + Math.floor(Math.random() * (range + 1))
    })
    hostIp = hostParts.join('.')
    attempts++
    
    // 無限ループを防ぐため、十分な試行回数に達したらフォールバック
    if (attempts >= maxAttempts) {
      // 最後のオクテットを1つ増やしてみる（ブロードキャストアドレスでない限り）
      const fallbackParts = [...networkParts]
      if (fallbackParts[3] < broadcastParts[3] - 1) {
        fallbackParts[3] = fallbackParts[3] + 1
      } else if (fallbackParts[2] < broadcastParts[2]) {
        fallbackParts[2] = fallbackParts[2] + 1
        fallbackParts[3] = 0
      }
      hostIp = fallbackParts.join('.')
      break
    }
  } while ((hostIp === networkAddress || hostIp === broadcastAddress) && attempts < maxAttempts)
  
  return hostIp
}

/**
 * 配列をシャッフルする
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 間違った選択肢を生成する
 */
function generateWrongChoices(correctAnswer: string, type: 'ip' | 'binary' | 'number'): string[] {
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
    const fallbackChoice = `fallback-${wrongChoices.length}-${Date.now()}`
    wrongChoices.push(fallbackChoice)
  }
  
  return wrongChoices
}

/**
 * クイズ問題を生成する
 */
export function generateQuizQuestion(type: QuestionType): QuizQuestion {
  switch (type) {
    case QuestionType.BINARY_IP_CONVERSION: {
      // IP → 二進数変換のみ
      const ip = generateRandomIpAddress()
      const binary = ipToBinary(ip)
      const wrongChoices = generateWrongChoices(binary, 'binary')
      const allChoices = shuffleArray([binary, ...wrongChoices])
      const correctAnswer = allChoices.indexOf(binary)
      return {
        type,
        question: `IPアドレス ${ip} を2進数表記に変換してください`,
        choices: allChoices,
        correctAnswer,
        explanation: `${ip} の2進数表記は ${binary} です`
      }
    }
    
    case QuestionType.CIDR_TO_SUBNET: {
      const cidr = generateRandomCidr()
      const subnet = cidrToSubnetMask(cidr)
      const wrongChoices: string[] = []
      let attempts = 0
      
      // 重複しない間違い選択肢を生成
      while (wrongChoices.length < 3 && attempts < 100) {
        const wrongSubnet = generateRandomSubnetMask()
        if (wrongSubnet !== subnet && !wrongChoices.includes(wrongSubnet)) {
          wrongChoices.push(wrongSubnet)
        }
        attempts++
      }
      
      // フォールバック: 十分な選択肢が生成できない場合
      while (wrongChoices.length < 3) {
        const fallbackCidr = generateRandomCidr()
        const fallbackSubnet = cidrToSubnetMask(fallbackCidr)
        if (fallbackSubnet !== subnet && !wrongChoices.includes(fallbackSubnet)) {
          wrongChoices.push(fallbackSubnet)
        }
      }
      
      const allChoices = shuffleArray([subnet, ...wrongChoices])
      const correctAnswer = allChoices.indexOf(subnet)
      
      return {
        type,
        question: `CIDR /${cidr} のサブネットマスクを選択してください`,
        choices: allChoices,
        correctAnswer,
        explanation: `/${cidr} のサブネットマスクは ${subnet} です`
      }
    }
    
    case QuestionType.SUBNET_TO_CIDR: {
      const cidr = generateRandomCidr()
      const subnet = cidrToSubnetMask(cidr)
      const wrongChoices: string[] = []
      let attempts = 0
      
      while (wrongChoices.length < 3 && attempts < 100) {
        const wrongCidr = generateRandomCidr()
        const wrongCidrStr = `/${wrongCidr}`
        if (wrongCidr !== cidr && !wrongChoices.includes(wrongCidrStr)) {
          wrongChoices.push(wrongCidrStr)
        }
        attempts++
      }
      
      const allChoices = shuffleArray([`/${cidr}`, ...wrongChoices])
      const correctAnswer = allChoices.indexOf(`/${cidr}`)
      
      return {
        type,
        question: `サブネットマスク ${subnet} のCIDR表記を選択してください`,
        choices: allChoices,
        correctAnswer,
        explanation: `${subnet} のCIDR表記は /${cidr} です`
      }
    }
    
    case QuestionType.NETWORK_ADDRESS: {
      const ip = generateRandomIpAddress()
      const cidr = generateRandomCidr()
      const networkAddress = calculateNetworkAddress(ip, cidr)
      const wrongChoices = generateWrongChoices(networkAddress, 'ip')
      const allChoices = shuffleArray([networkAddress, ...wrongChoices])
      const correctAnswer = allChoices.indexOf(networkAddress)
      
      return {
        type,
        question: `IPアドレス ${ip}/${cidr} のネットワークアドレスを選択してください`,
        choices: allChoices,
        correctAnswer,
        explanation: `${ip}/${cidr} のネットワークアドレスは ${networkAddress} です`
      }
    }
    
    case QuestionType.BROADCAST_ADDRESS: {
      const ip = generateRandomIpAddress()
      const cidr = generateRandomCidr()
      const broadcastAddress = calculateBroadcastAddress(ip, cidr)
      const wrongChoices = generateWrongChoices(broadcastAddress, 'ip')
      const allChoices = shuffleArray([broadcastAddress, ...wrongChoices])
      const correctAnswer = allChoices.indexOf(broadcastAddress)
      
      return {
        type,
        question: `IPアドレス ${ip}/${cidr} のブロードキャストアドレスを選択してください`,
        choices: allChoices,
        correctAnswer,
        explanation: `${ip}/${cidr} のブロードキャストアドレスは ${broadcastAddress} です`
      }
    }
    
    case QuestionType.HOST_COUNT: {
      const cidr = generateRandomCidr()
      const hostCount = calculateHostCount(cidr)
      const wrongChoices = generateWrongChoices(hostCount.toString(), 'number')
      const allChoices = shuffleArray([hostCount.toString(), ...wrongChoices])
      const correctAnswer = allChoices.indexOf(hostCount.toString())
      
      return {
        type,
        question: `CIDR /${cidr} のサブネットで利用可能なホスト数を選択してください`,
        choices: allChoices,
        correctAnswer,
        explanation: `/${cidr} のサブネットで利用可能なホスト数は ${hostCount} です`
      }
    }
    
    case QuestionType.HOST_IN_NETWORK: {
      const networkIp = generateRandomIpAddress()
      const cidr = generateRandomCidr()
      const networkAddress = calculateNetworkAddress(networkIp, cidr)
      const broadcastAddress = calculateBroadcastAddress(networkIp, cidr)
      const validHost = generateHostIpInNetwork(networkIp, cidr)
      
      // 正解は有効なホストアドレス
      // 間違いの選択肢：ネットワークアドレス、ブロードキャストアドレス、他のネットワークのIP
      const wrongChoices: string[] = [networkAddress, broadcastAddress]
      let attempts = 0
      
      // 3つ目の間違い選択肢を生成（正解と重複しないように）
      while (wrongChoices.length < 3 && attempts < 100) {
        const randomIp = generateRandomIpAddress()
        if (randomIp !== validHost && !wrongChoices.includes(randomIp)) {
          wrongChoices.push(randomIp)
        }
        attempts++
      }
      
      const allChoices = shuffleArray([validHost, ...wrongChoices])
      const correctAnswer = allChoices.indexOf(validHost)
      
      return {
        type,
        question: `ネットワーク ${networkAddress}/${cidr} に属する有効なホストアドレスを選択してください`,
        choices: allChoices,
        correctAnswer,
        explanation: `${validHost} は ネットワーク ${networkAddress}/${cidr} に属する有効なホストアドレスです。ネットワークアドレス(${networkAddress})とブロードキャストアドレス(${broadcastAddress})は使用できません。`
      };
    }
    
    case QuestionType.LONGEST_MATCH: {
      const targetIp = generateRandomIpAddress()
      const { correctNetwork, correctCidr, otherNetworks, includeDefaultRoute } = generateLongestMatchNetworks(targetIp)
      
      // 正解の選択肢
      const correctChoice = `${correctNetwork}/${correctCidr}`
      
      // 他の選択肢を作成
      const wrongChoices = otherNetworks.map(({ network, cidr }) => `${network}/${cidr}`)
      
      const allChoices = shuffleArray([correctChoice, ...wrongChoices])
      const correctAnswer = allChoices.indexOf(correctChoice)
      
      // ルーティングテーブル風の説明を作成
      const allNetworks = [
        { network: correctNetwork, cidr: correctCidr, isCorrect: true },
        ...otherNetworks.map(({ network, cidr }) => ({ network, cidr, isCorrect: false }))
      ]
      
      const routingTableText = allNetworks
        .map(({ network, cidr, isCorrect }) => {
          const belongsTo = ipBelongsToNetwork(targetIp, network, cidr) ? "○" : "×"
          const label = isCorrect ? "(最長マッチ)" : ""
          return `  ${network}/${cidr} → ${belongsTo} ${label}`
        })
        .join('\n')
      
      // デフォルトルートが含まれる場合の説明を調整
      let explanationText: string
      if (includeDefaultRoute && correctCidr === 0) {
        explanationText = `IPアドレス ${targetIp} のルーティング判定：\n${routingTableText}\n\n他のネットワークにマッチしないため、デフォルトルート ${correctChoice} が選択されます。`
      } else {
        explanationText = `IPアドレス ${targetIp} のルーティング判定：\n${routingTableText}\n\nルーティングでは最も具体的な（CIDR値が最も大きい）マッチするネットワークが選択されるため、${correctChoice} が正解です。`
      }
      
      return {
        type,
        question: `IPアドレス ${targetIp} のパケットをルーティングする際、以下の選択肢の中から最長マッチ（longest match）するネットワークアドレスを選択してください`,
        choices: allChoices,
        correctAnswer,
        explanation: explanationText
      };
    }
    
    default:
      throw new Error(`Unknown question type: ${type}`);
  }
}
