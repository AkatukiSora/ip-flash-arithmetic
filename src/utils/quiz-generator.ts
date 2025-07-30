/**
 * 問題生成のユーティリティ関数
 */
import { ipToBinary, cidrToSubnetMask } from './ip-utils'
import { calculateNetworkAddress, calculateBroadcastAddress, calculateHostCount } from './subnet-utils'
import { generateRandomIpAddress } from './network-generator'
import { generateLongestMatchNetworks, generateLongestMatchExplanation } from './longest-match-generator'
import { generateHostIpInNetwork } from './host-generator'
import { 
  generateRandomCidr, 
  generateWrongChoices,
  generateUniqueSubnetChoices,
  generateUniqueCidrChoices,
  shuffleChoices
} from './choice-generator'

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
 * クイズ問題を生成する
 */
export function generateQuizQuestion(type: QuestionType): QuizQuestion {
  switch (type) {
    case QuestionType.BINARY_IP_CONVERSION: {
      // IP → 二進数変換のみ
      const ip = generateRandomIpAddress()
      const binary = ipToBinary(ip)
      const wrongChoices = generateWrongChoices(binary, 'binary')
      const { choices: allChoices, correctIndex } = shuffleChoices(binary, wrongChoices)
      
      return {
        type,
        question: `IPアドレス ${ip} を2進数表記に変換してください`,
        choices: allChoices,
        correctAnswer: correctIndex,
        explanation: `💡 計算方法：\n各オクテット（8ビット）を2進数に変換します。\n例：192 = 128+64 = 11000000\n\n${ip} の2進数表記は ${binary} です`
      }
    }
    
    case QuestionType.CIDR_TO_SUBNET: {
      const cidr = generateRandomCidr()
      const subnet = cidrToSubnetMask(cidr)
      const wrongChoices = generateUniqueSubnetChoices(subnet)
      const { choices: allChoices, correctIndex } = shuffleChoices(subnet, wrongChoices)
      
      return {
        type,
        question: `CIDR /${cidr} のサブネットマスクを選択してください`,
        choices: allChoices,
        correctAnswer: correctIndex,
        explanation: `💡 変換ルール：\nCIDR値分だけ左から1で埋め、残りを0にします。\n/${cidr} = ${cidr}個の1 + ${32-cidr}個の0\n\n/${cidr} のサブネットマスクは ${subnet} です`
      }
    }
    
    case QuestionType.SUBNET_TO_CIDR: {
      const cidr = generateRandomCidr()
      const subnet = cidrToSubnetMask(cidr)
      const wrongChoices = generateUniqueCidrChoices(cidr)
      const { choices: allChoices, correctIndex } = shuffleChoices(`/${cidr}`, wrongChoices)
      
      return {
        type,
        question: `サブネットマスク ${subnet} のCIDR表記を選択してください`,
        choices: allChoices,
        correctAnswer: correctIndex,
        explanation: `💡 計算方法：\nサブネットマスクの連続する1の個数を数えます。\n${subnet} = ${cidr}個の連続する1 = /${cidr}\n\n${subnet} のCIDR表記は /${cidr} です`
      }
    }
    
    case QuestionType.NETWORK_ADDRESS: {
      const ip = generateRandomIpAddress()
      const cidr = generateRandomCidr()
      const networkAddress = calculateNetworkAddress(ip, cidr)
      const wrongChoices = generateWrongChoices(networkAddress, 'ip')
      const { choices: allChoices, correctIndex } = shuffleChoices(networkAddress, wrongChoices)
      
      return {
        type,
        question: `IPアドレス ${ip}/${cidr} のネットワークアドレスを選択してください`,
        choices: allChoices,
        correctAnswer: correctIndex,
        explanation: `💡 計算手順：\n1. IPアドレスとサブネットマスクでAND演算\n2. ホスト部のビットを全て0にする\n3. ネットワーク部のみが残る\n\n${ip}/${cidr} のネットワークアドレスは ${networkAddress} です`
      }
    }
    
    case QuestionType.BROADCAST_ADDRESS: {
      const ip = generateRandomIpAddress()
      const cidr = generateRandomCidr()
      const broadcastAddress = calculateBroadcastAddress(ip, cidr)
      const wrongChoices = generateWrongChoices(broadcastAddress, 'ip')
      const { choices: allChoices, correctIndex } = shuffleChoices(broadcastAddress, wrongChoices)
      
      return {
        type,
        question: `IPアドレス ${ip}/${cidr} のブロードキャストアドレスを選択してください`,
        choices: allChoices,
        correctAnswer: correctIndex,
        explanation: `✅ 正解：${ip}/${cidr} のブロードキャストアドレスは ${broadcastAddress} です\n\n💡 計算手順：\n1. ネットワークアドレスを求める\n2. ホスト部のビットを全て1にする\n3. そのネットワーク内の最後のアドレス`
      }
    }
    
    case QuestionType.HOST_COUNT: {
      const cidr = generateRandomCidr()
      const hostCount = calculateHostCount(cidr)
      const wrongChoices = generateWrongChoices(hostCount.toString(), 'number')
      const { choices: allChoices, correctIndex } = shuffleChoices(hostCount.toString(), wrongChoices)
      
      return {
        type,
        question: `CIDR /${cidr} のサブネットで利用可能なホスト数を選択してください`,
        choices: allChoices,
        correctAnswer: correctIndex,
        explanation: `✅ 正解：/${cidr} のサブネットで利用可能なホスト数は ${hostCount} です\n\n💡 計算公式：\n• ホストビット数 = 32 - ${cidr} = ${32-cidr}ビット\n• 利用可能なホスト数 = 2^${32-cidr} - 2 = ${hostCount}\n• -2の理由：ネットワークアドレスとブロードキャストを除く`
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
      
      const { choices: allChoices, correctIndex } = shuffleChoices(validHost, wrongChoices)
      
      return {
        type,
        question: `ネットワーク ${networkAddress}/${cidr} に属する有効なホストアドレスを選択してください`,
        choices: allChoices,
        correctAnswer: correctIndex,
        explanation: `✅ 正解：${validHost} は ネットワーク ${networkAddress}/${cidr} に属する有効なホストアドレスです。\n\n💡 ポイント：\n• ネットワークアドレス（${networkAddress}）は使用不可\n• ブロードキャストアドレス（${broadcastAddress}）は使用不可\n• それ以外のアドレスがホストに割り当て可能`
      }
    }
    
    case QuestionType.LONGEST_MATCH: {
      const targetIp = generateRandomIpAddress()
      const { correctNetwork, correctCidr, otherNetworks } = generateLongestMatchNetworks(targetIp)
      
      // 正解の選択肢
      const correctChoice = `${correctNetwork}/${correctCidr}`
      
      // 他の選択肢を作成（最大3個まで）
      const wrongChoices = otherNetworks.slice(0, 3).map(({ network, cidr }) => `${network}/${cidr}`)
      
      const { choices: allChoices, correctIndex } = shuffleChoices(correctChoice, wrongChoices, 'network')
      
      // 実際の選択肢から説明文用のネットワーク情報を作成
      const finalOtherNetworks = allChoices
        .filter(choice => choice !== correctChoice)
        .map(choice => {
          const [network, cidr] = choice.split('/')
          return { network, cidr: parseInt(cidr) }
        })
      
      const explanationText = generateLongestMatchExplanation(
        targetIp, correctNetwork, correctCidr, finalOtherNetworks
      )
      
      return {
        type,
        question: `IPアドレス ${targetIp} のパケットをルーティングする際、以下の選択肢の中から最長マッチ（longest match）するネットワークアドレスを選択してください`,
        choices: allChoices,
        correctAnswer: correctIndex,
        explanation: explanationText
      }
    }
    
    default:
      throw new Error(`Unknown question type: ${type}`)
  }
}
