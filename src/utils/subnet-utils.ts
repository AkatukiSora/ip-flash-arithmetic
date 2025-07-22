/**
 * サブネット計算のユーティリティ関数
 */
import { isValidIpAddress, cidrToSubnetMask } from './ip-utils'

/**
 * IPアドレスとサブネットマスクからネットワークアドレスを計算する
 */
export function calculateNetworkAddress(ip: string, subnet: string | number): string {
  if (!isValidIpAddress(ip)) {
    throw new Error('Invalid IP address')
  }
  
  let subnetMask: string
  if (typeof subnet === 'number') {
    subnetMask = cidrToSubnetMask(subnet)
  } else {
    if (!isValidIpAddress(subnet)) {
      throw new Error('Invalid subnet mask')
    }
    subnetMask = subnet
  }
  
  const ipParts = ip.split('.').map(part => parseInt(part, 10))
  const maskParts = subnetMask.split('.').map(part => parseInt(part, 10))
  
  const networkParts = ipParts.map((ipPart, index) => ipPart & maskParts[index])
  
  return networkParts.join('.')
}

/**
 * IPアドレスとサブネットマスクからブロードキャストアドレスを計算する
 */
export function calculateBroadcastAddress(ip: string, subnet: string | number): string {
  if (!isValidIpAddress(ip)) {
    throw new Error('Invalid IP address')
  }
  
  let subnetMask: string
  if (typeof subnet === 'number') {
    subnetMask = cidrToSubnetMask(subnet)
  } else {
    if (!isValidIpAddress(subnet)) {
      throw new Error('Invalid subnet mask')
    }
    subnetMask = subnet
  }
  
  const ipParts = ip.split('.').map(part => parseInt(part, 10))
  const maskParts = subnetMask.split('.').map(part => parseInt(part, 10))
  
  const broadcastParts = ipParts.map((ipPart, index) => {
    const hostBits = 255 - maskParts[index]
    return (ipPart & maskParts[index]) | hostBits
  })
  
  return broadcastParts.join('.')
}

/**
 * ネットワークアドレスから最小ホストアドレスを計算する
 */
export function calculateMinHostAddress(networkAddress: string): string {
  if (!isValidIpAddress(networkAddress)) {
    throw new Error('Invalid network address')
  }
  
  const parts = networkAddress.split('.').map(part => parseInt(part, 10))
  
  // 最後のオクテットに1を加算
  parts[3] += 1
  
  return parts.join('.')
}

/**
 * ブロードキャストアドレスから最大ホストアドレスを計算する
 */
export function calculateMaxHostAddress(broadcastAddress: string): string {
  if (!isValidIpAddress(broadcastAddress)) {
    throw new Error('Invalid broadcast address')
  }
  
  const parts = broadcastAddress.split('.').map(part => parseInt(part, 10))
  
  // 最後のオクテットから1を減算
  parts[3] -= 1
  
  return parts.join('.')
}

/**
 * サブネットマスクまたはCIDRからホスト数を計算する
 */
export function calculateHostCount(subnet: string | number): number {
  let hostBits: number
  
  if (typeof subnet === 'number') {
    if (subnet < 0 || subnet > 32) {
      throw new Error('Invalid CIDR value')
    }
    hostBits = 32 - subnet
  } else {
    if (!isValidIpAddress(subnet)) {
      throw new Error('Invalid subnet mask')
    }
    
    const maskParts = subnet.split('.').map(part => parseInt(part, 10))
    const binary = maskParts
      .map(part => part.toString(2).padStart(8, '0'))
      .join('')
    
    const match = binary.match(/^(1*)(0*)$/)
    if (!match || match[1].length + match[2].length !== 32) {
      throw new Error('Invalid subnet mask')
    }
    
    hostBits = match[2].length
  }
  
  // 利用可能ホスト数 = 2^hostBits - 2 (ネットワークアドレスとブロードキャストアドレスを除く)
  if (hostBits <= 1) return 0
  const count = Math.pow(2, hostBits) - 2
  return count < 0 ? 0 : count
}
