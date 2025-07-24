/**
 * ホストIP生成ユーティリティ
 */
import { calculateNetworkAddress, calculateBroadcastAddress } from './subnet-utils'

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
