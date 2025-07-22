/**
 * サブネット計算機能のテスト
 */
import { 
  calculateNetworkAddress,
  calculateBroadcastAddress,
  calculateMinHostAddress,
  calculateMaxHostAddress,
  calculateHostCount
} from '../utils/subnet-utils'

describe('サブネット計算機能', () => {
  describe('calculateNetworkAddress', () => {
    test('IPアドレスとサブネットマスクからネットワークアドレスを計算できる', () => {
      expect(calculateNetworkAddress('192.168.1.100', '255.255.255.0')).toBe('192.168.1.0')
      expect(calculateNetworkAddress('10.0.0.50', '255.0.0.0')).toBe('10.0.0.0')
      expect(calculateNetworkAddress('172.16.10.1', '255.255.0.0')).toBe('172.16.0.0')
    })

    test('CIDRでの計算もできる', () => {
      expect(calculateNetworkAddress('192.168.1.100', 24)).toBe('192.168.1.0')
      expect(calculateNetworkAddress('10.0.0.50', 8)).toBe('10.0.0.0')
      expect(calculateNetworkAddress('172.16.10.1', 16)).toBe('172.16.0.0')
    })
  })

  describe('calculateBroadcastAddress', () => {
    test('IPアドレスとサブネットマスクからブロードキャストアドレスを計算できる', () => {
      expect(calculateBroadcastAddress('192.168.1.100', '255.255.255.0')).toBe('192.168.1.255')
      expect(calculateBroadcastAddress('10.0.0.50', '255.0.0.0')).toBe('10.255.255.255')
      expect(calculateBroadcastAddress('172.16.10.1', '255.255.0.0')).toBe('172.16.255.255')
    })

    test('CIDRでの計算もできる', () => {
      expect(calculateBroadcastAddress('192.168.1.100', 24)).toBe('192.168.1.255')
      expect(calculateBroadcastAddress('10.0.0.50', 8)).toBe('10.255.255.255')
      expect(calculateBroadcastAddress('172.16.10.1', 16)).toBe('172.16.255.255')
    })
  })

  describe('calculateMinHostAddress', () => {
    test('ネットワークアドレスから最小ホストアドレスを計算できる', () => {
      expect(calculateMinHostAddress('192.168.1.0')).toBe('192.168.1.1')
      expect(calculateMinHostAddress('10.0.0.0')).toBe('10.0.0.1')
      expect(calculateMinHostAddress('172.16.0.0')).toBe('172.16.0.1')
    })
  })

  describe('calculateMaxHostAddress', () => {
    test('ブロードキャストアドレスから最大ホストアドレスを計算できる', () => {
      expect(calculateMaxHostAddress('192.168.1.255')).toBe('192.168.1.254')
      expect(calculateMaxHostAddress('10.255.255.255')).toBe('10.255.255.254')
      expect(calculateMaxHostAddress('172.16.255.255')).toBe('172.16.255.254')
    })
  })

  describe('calculateHostCount', () => {
    test('サブネットマスクからホスト数を計算できる', () => {
      expect(calculateHostCount('255.255.255.0')).toBe(254) // /24 = 256 - 2
      expect(calculateHostCount('255.255.0.0')).toBe(65534) // /16 = 65536 - 2
      expect(calculateHostCount('255.255.255.252')).toBe(2) // /30 = 4 - 2
    })

    test('CIDRからホスト数を計算できる', () => {
      expect(calculateHostCount(24)).toBe(254) // /24 = 256 - 2
      expect(calculateHostCount(16)).toBe(65534) // /16 = 65536 - 2
      expect(calculateHostCount(30)).toBe(2) // /30 = 4 - 2
    })

    test('特殊ケース: CIDR /32 (ホストビット0)の場合ホスト数は0', () => {
      expect(calculateHostCount(32)).toBe(0) // /32 = 1 - 2 = -1 → 0
      expect(calculateHostCount('255.255.255.255')).toBe(0) // 同様
    })

    test('特殊ケース: CIDR /31 (ポイントツーポイント)の場合', () => {
      expect(calculateHostCount(31)).toBe(0) // /31 = 2 - 2 = 0
      expect(calculateHostCount('255.255.255.254')).toBe(0)
    })

    test('特殊ケース: 極端に大きなサブネット /0 (インターネット全体)', () => {
      expect(calculateHostCount(0)).toBe(4294967294) // /0 = 2^32 - 2
      expect(calculateHostCount('0.0.0.0')).toBe(4294967294)
    })
  })

  describe('特殊ケースの統合テスト', () => {
    test('CIDR /32: ネットワークとブロードキャストが同一', () => {
      const ip = '192.168.1.100'
      const cidr = 32
      
      const network = calculateNetworkAddress(ip, cidr)
      const broadcast = calculateBroadcastAddress(ip, cidr)
      const hostCount = calculateHostCount(cidr)
      
      expect(network).toBe('192.168.1.100')
      expect(broadcast).toBe('192.168.1.100')
      expect(hostCount).toBe(0)
    })

    test('CIDR /31: ポイントツーポイント接続', () => {
      const ip = '10.0.0.1'
      const cidr = 31
      
      const network = calculateNetworkAddress(ip, cidr)
      const broadcast = calculateBroadcastAddress(ip, cidr)
      const hostCount = calculateHostCount(cidr)
      
      expect(network).toBe('10.0.0.0')
      expect(broadcast).toBe('10.0.0.1')
      expect(hostCount).toBe(0)
    })

    test('CIDR /30: 最小の通常ネットワーク', () => {
      const ip = '172.16.0.5'
      const cidr = 30
      
      const network = calculateNetworkAddress(ip, cidr)
      const broadcast = calculateBroadcastAddress(ip, cidr)
      const minHost = calculateMinHostAddress(network)
      const maxHost = calculateMaxHostAddress(broadcast)
      const hostCount = calculateHostCount(cidr)
      
      expect(network).toBe('172.16.0.4')
      expect(broadcast).toBe('172.16.0.7')
      expect(minHost).toBe('172.16.0.5')
      expect(maxHost).toBe('172.16.0.6')
      expect(hostCount).toBe(2)
    })

    test('CIDR /8: 最大のクラスフルネットワーク', () => {
      const ip = '10.123.45.67'
      const cidr = 8
      
      const network = calculateNetworkAddress(ip, cidr)
      const broadcast = calculateBroadcastAddress(ip, cidr)
      const hostCount = calculateHostCount(cidr)
      
      expect(network).toBe('10.0.0.0')
      expect(broadcast).toBe('10.255.255.255')
      expect(hostCount).toBe(16777214) // 2^24 - 2
    })
  })
})
