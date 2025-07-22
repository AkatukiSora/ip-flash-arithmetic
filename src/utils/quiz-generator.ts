/**
 * 問題生成のユーティリティ関数
 */
import { binaryToIp, ipToBinary, cidrToSubnetMask, subnetMaskToCidr, isValidIpAddress } from './ip-utils'
import { calculateNetworkAddress, calculateBroadcastAddress, calculateHostCount } from './subnet-utils'

export enum QuestionType {
  BINARY_IP_CONVERSION = 'BINARY_IP_CONVERSION',
  CIDR_TO_SUBNET = 'CIDR_TO_SUBNET',
  SUBNET_TO_CIDR = 'SUBNET_TO_CIDR',
  NETWORK_ADDRESS = 'NETWORK_ADDRESS',
  BROADCAST_ADDRESS = 'BROADCAST_ADDRESS',
  HOST_COUNT = 'HOST_COUNT',
  HOST_IN_NETWORK = 'HOST_IN_NETWORK'
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
  do {
    const hostParts = networkParts.map((part, index) => {
      const range = broadcastParts[index] - part
      if (range === 0) return part
      return part + Math.floor(Math.random() * (range + 1))
    })
    hostIp = hostParts.join('.')
    attempts++
  } while ((hostIp === networkAddress || hostIp === broadcastAddress) && attempts < 100)
  
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
  
  while (wrongChoices.length < 3) {
    let wrongChoice: string
    
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
  
  return wrongChoices
}

/**
 * クイズ問題を生成する
 */
export function generateQuizQuestion(type: QuestionType): QuizQuestion {
  switch (type) {
    case QuestionType.BINARY_IP_CONVERSION: {
      // どちらの方向かランダムで決定
      const direction = Math.random() < 0.5 ? 'BINARY_TO_IP' : 'IP_TO_BINARY'
      if (direction === 'BINARY_TO_IP') {
        const ip = generateRandomIpAddress()
        const binary = ipToBinary(ip)
        const wrongChoices = generateWrongChoices(ip, 'ip')
        const allChoices = shuffleArray([ip, ...wrongChoices])
        const correctAnswer = allChoices.indexOf(ip)
        return {
          type,
          question: `2進数表記 ${binary} をIPアドレスに変換してください`,
          choices: allChoices,
          correctAnswer,
          explanation: `${binary} のIPアドレスは ${ip} です`
        }
      } else {
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
    }
    
    case QuestionType.CIDR_TO_SUBNET: {
      const cidr = generateRandomCidr()
      const subnet = cidrToSubnetMask(cidr)
      const wrongChoices = [generateRandomSubnetMask(), generateRandomSubnetMask(), generateRandomSubnetMask()]
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
      const wrongChoices = Array.from({ length: 3 }, () => {
        let wrongCidr = generateRandomCidr()
        while (wrongCidr === cidr) {
          wrongCidr = generateRandomCidr()
        }
        return `/${wrongCidr}`
      })
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
      const wrongChoices = [
        networkAddress,
        broadcastAddress,
        generateRandomIpAddress()
      ]
      
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

    case QuestionType.BINARY_IP_CONVERSION: {
      // ランダムに双方向変換を選択（0: IP→2進数、1: 2進数→IP）
      const conversionDirection = Math.floor(Math.random() * 2);
      
      if (conversionDirection === 0) {
        // IP → 2進数変換
        const ip = generateRandomIpAddress();
        const binaryResult = ipToBinary(ip);
        
        // 選択肢生成（正解 + 間違い）
        const wrongChoices = Array.from(new Set([
          binaryResult.split('.').map((byte: string, index: number) => 
            index === 0 ? (parseInt(byte, 2) ^ 1).toString(2).padStart(8, '0') + '.' + binaryResult.split('.').slice(1).join('.')
            : binaryResult.split('.').slice(0, index).join('.') + '.' + (parseInt(byte, 2) ^ 1).toString(2).padStart(8, '0') + '.' + binaryResult.split('.').slice(index + 1).join('.')
          ).join('.'),
          binaryResult.split('.').map((byte: string) => 
            (parseInt(byte, 2) ^ 128).toString(2).padStart(8, '0')
          ).join('.'),
          binaryResult.split('.').map((byte: string) => 
            (parseInt(byte, 2) ^ 64).toString(2).padStart(8, '0')
          ).join('.')
        ])).slice(0, 3);
        
        const allChoices = shuffleArray([binaryResult, ...wrongChoices]);
        const correctAnswer = allChoices.indexOf(binaryResult);
        
        return {
          question: `IPアドレス ${ip} を2進数で表現してください`,
          choices: allChoices,
          correctAnswer,
          type: QuestionType.BINARY_IP_CONVERSION,
          explanation: `${ip}を2進数で表現すると${binaryResult}です。`
        };
      } else {
        // 2進数 → IP変換
        const ip = generateRandomIpAddress();
        const binaryResult = ipToBinary(ip);
        
        // 選択肢生成（正解 + 間違い）
        const wrongChoices = Array.from(new Set([
          ip.split('.').map((octet: string, index: number) => 
            index === 0 ? (parseInt(octet) ^ 1).toString() + '.' + ip.split('.').slice(1).join('.')
            : ip.split('.').slice(0, index).join('.') + '.' + (parseInt(octet) ^ 1).toString() + '.' + ip.split('.').slice(index + 1).join('.')
          ).join('.'),
          ip.split('.').map((octet: string) => (parseInt(octet) ^ 128).toString()).join('.'),
          ip.split('.').map((octet: string) => (parseInt(octet) ^ 64).toString()).join('.')
        ].filter(choice => isValidIpAddress(choice)))).slice(0, 3);
        
        const allChoices = shuffleArray([ip, ...wrongChoices]);
        const correctAnswer = allChoices.indexOf(ip);
        
        return {
          question: `2進数 ${binaryResult} を10進数のIPアドレスで表現してください`,
          choices: allChoices,
          correctAnswer,
          type: QuestionType.BINARY_IP_CONVERSION,
          explanation: `${binaryResult}を10進数で表現すると${ip}です。`
        };
      }
    }
    
    default:
      throw new Error(`Unknown question type: ${type}`);
  }
}
