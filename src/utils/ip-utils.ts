/**
 * IPアドレスを2進数表記に変換する
 */
export function ipToBinary(ip: string): string {
  if (!isValidIpAddress(ip)) {
    throw new Error('Invalid IP address')
  }
  return ip.split('.')
    .map(part => parseInt(part, 10).toString(2).padStart(8, '0'))
    .join('.')
}
/**
 * IPアドレス関連のユーティリティ関数
 */

/**
 * IPアドレスが有効な形式かを検証する
 * 先頭ゼロを含む形式（例: 192.168.00.005）も許容する
 */
export function isValidIpAddress(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  
  return parts.every(part => {
    const num = parseInt(part, 10)
    return !isNaN(num) && num >= 0 && num <= 255
  })
}

/**
 * 2進数表記をIPアドレスに変換する
 */
export function binaryToIp(binary: string): string {
  const parts = binary.split('.')
  
  if (parts.length !== 4 || !parts.every(part => /^[01]{8}$/.test(part))) {
    throw new Error('Invalid binary format')
  }
  
  return parts
    .map(part => parseInt(part, 2).toString())
    .join('.')
}

/**
 * CIDR表記をサブネットマスクに変換する
 */
export function cidrToSubnetMask(cidr: number): string {
  if (cidr < 0 || cidr > 32) {
    throw new Error('Invalid CIDR value')
  }
  if (cidr === 0) {
    return '0.0.0.0';
  }
  const mask = 0xffffffff << (32 - cidr)
  return [
    (mask >>> 24) & 0xff,
    (mask >>> 16) & 0xff,
    (mask >>> 8) & 0xff,
    mask & 0xff
  ].join('.')
}

/**
 * サブネットマスクをCIDR表記に変換する
 */
export function subnetMaskToCidr(mask: string): number {
  if (!isValidIpAddress(mask)) {
    throw new Error('Invalid subnet mask')
  }
  
  const parts = mask.split('.').map(part => parseInt(part, 10))
  const binary = parts
    .map(part => part.toString(2).padStart(8, '0'))
    .join('')
  
  // サブネットマスクは連続する1の後に連続する0でなければならない
  const match = binary.match(/^(1*)(0*)$/)
  if (!match || match[1].length + match[2].length !== 32) {
    throw new Error('Invalid subnet mask')
  }
  
  return match[1].length
}

/**
 * 指定されたIPアドレスがネットワークに属するかどうかを判定する
 */
export function ipBelongsToNetwork(ip: string, networkIp: string, cidr: number): boolean {
  const ipParts = ip.split('.').map(Number)
  const networkParts = networkIp.split('.').map(Number)
  
  // CIDRからサブネットマスクを計算
  const hostBits = 32 - cidr
  let mask = 0xFFFFFFFF << hostBits
  mask = mask >>> 0 // 符号なし32ビット整数に変換
  
  // IPアドレスとネットワークアドレスを32ビット整数に変換
  const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3]
  const networkInt = (networkParts[0] << 24) + (networkParts[1] << 16) + (networkParts[2] << 8) + networkParts[3]
  
  // マスクを適用してネットワーク部を比較
  return (ipInt & mask) === (networkInt & mask)
}
