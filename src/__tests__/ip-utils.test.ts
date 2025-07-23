/**
 * IPアドレス関連のユーティリティ関数のテスト
 */
import { 
  isValidIpAddress, 
  binaryToIp, 
  ipToBinary,
  cidrToSubnetMask,
  subnetMaskToCidr 
} from '../utils/ip-utils'

describe('IPアドレス変換機能', () => {
  describe('isValidIpAddress', () => {
    test('有効なIPアドレスを検証できる', () => {
      expect(isValidIpAddress('192.168.1.1')).toBe(true)
      expect(isValidIpAddress('255.255.255.255')).toBe(true)
      expect(isValidIpAddress('0.0.0.0')).toBe(true)
      expect(isValidIpAddress('10.0.0.1')).toBe(true)
    })

    test('無効なIPアドレスを検証できる', () => {
      expect(isValidIpAddress('256.1.1.1')).toBe(false)
      expect(isValidIpAddress('192.168.1')).toBe(false)
      expect(isValidIpAddress('192.168.1.1.1')).toBe(false)
      expect(isValidIpAddress('abc.def.ghi.jkl')).toBe(false)
      expect(isValidIpAddress('')).toBe(false)
    })

    test('先頭ゼロ付きのIPアドレスを許容する', () => {
      expect(isValidIpAddress('192.168.001.005')).toBe(true)
      expect(isValidIpAddress('010.000.000.001')).toBe(true)
      expect(isValidIpAddress('255.255.255.255')).toBe(true)
      expect(isValidIpAddress('00.00.00.00')).toBe(true)
      expect(isValidIpAddress('192.168.00.005')).toBe(true)
    })

    test('先頭ゼロでも範囲外の値は無効とする', () => {
      expect(isValidIpAddress('256.168.001.005')).toBe(false)
      expect(isValidIpAddress('192.999.001.005')).toBe(false)
      expect(isValidIpAddress('192.168.001.300')).toBe(false)
    })
  })

  describe('binaryToIp', () => {
    test('2進数表記をIPアドレスに変換できる', () => {
      expect(binaryToIp('11000000.10101000.00000001.00000001')).toBe('192.168.1.1')
      expect(binaryToIp('11111111.11111111.11111111.11111111')).toBe('255.255.255.255')
      expect(binaryToIp('00000000.00000000.00000000.00000000')).toBe('0.0.0.0')
    })

    test('無効な2進数表記の場合はエラーを投げる', () => {
      expect(() => binaryToIp('11111111.11111111.11111111')).toThrow('Invalid binary format')
    })
  })

  describe('ipToBinary', () => {
    test('IPアドレスを2進数表記に変換できる', () => {
      expect(ipToBinary('192.168.1.1')).toBe('11000000.10101000.00000001.00000001')
      expect(ipToBinary('255.255.255.255')).toBe('11111111.11111111.11111111.11111111')
      expect(ipToBinary('0.0.0.0')).toBe('00000000.00000000.00000000.00000000')
      expect(ipToBinary('10.0.0.1')).toBe('00001010.00000000.00000000.00000001')
    })

    test('無効なIPアドレスの場合はエラーを投げる', () => {
      expect(() => ipToBinary('256.1.1.1')).toThrow('Invalid IP address')
      expect(() => ipToBinary('192.168.1')).toThrow('Invalid IP address')
      expect(() => ipToBinary('abc.def.ghi.jkl')).toThrow('Invalid IP address')
    })

    test('先頭ゼロ付きIPアドレスも正しく変換できる', () => {
      expect(ipToBinary('192.168.001.005')).toBe('11000000.10101000.00000001.00000101')
      expect(ipToBinary('010.000.000.001')).toBe('00001010.00000000.00000000.00000001')
      expect(ipToBinary('192.168.00.005')).toBe('11000000.10101000.00000000.00000101')
      expect(ipToBinary('00.00.00.00')).toBe('00000000.00000000.00000000.00000000')
    })

    test('binaryToIpとipToBinaryは相互変換可能', () => {
      const testIps = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '255.255.255.0']
      testIps.forEach(ip => {
        const binary = ipToBinary(ip)
        const convertedBack = binaryToIp(binary)
        expect(convertedBack).toBe(ip)
      })
    })
  })

  describe('cidrToSubnetMask', () => {
    test('CIDR表記をサブネットマスクに変換できる', () => {
      expect(cidrToSubnetMask(24)).toBe('255.255.255.0')
      expect(cidrToSubnetMask(16)).toBe('255.255.0.0')
      expect(cidrToSubnetMask(8)).toBe('255.0.0.0')
      expect(cidrToSubnetMask(30)).toBe('255.255.255.252')
    })

    test('無効なCIDR値の場合はエラーを投げる', () => {
      expect(() => cidrToSubnetMask(33)).toThrow('Invalid CIDR value')
      expect(() => cidrToSubnetMask(-1)).toThrow('Invalid CIDR value')
    })
  })

  describe('subnetMaskToCidr', () => {
    test('サブネットマスクをCIDR表記に変換できる', () => {
      expect(subnetMaskToCidr('255.255.255.0')).toBe(24)
      expect(subnetMaskToCidr('255.255.0.0')).toBe(16)
      expect(subnetMaskToCidr('255.0.0.0')).toBe(8)
      expect(subnetMaskToCidr('255.255.255.252')).toBe(30)
    })

    test('無効なサブネットマスクの場合はエラーを投げる', () => {
      expect(() => subnetMaskToCidr('255.255.255.1')).toThrow('Invalid subnet mask')
    })

    test('特殊ケース: 極端な値の処理', () => {
      // 最小のサブネットマスク /0
      expect(subnetMaskToCidr('0.0.0.0')).toBe(0)
      
      // 最大のサブネットマスク /32  
      expect(subnetMaskToCidr('255.255.255.255')).toBe(32)
      
      // ポイントツーポイント /31
      expect(subnetMaskToCidr('255.255.255.254')).toBe(31)
    })
  })

  describe('特殊ケースの統合テスト', () => {
    test('CIDR境界値テスト', () => {
      // 境界値 /0, /32
      expect(cidrToSubnetMask(0)).toBe('0.0.0.0')
      expect(cidrToSubnetMask(32)).toBe('255.255.255.255')
      
      // 相互変換の確認
      expect(subnetMaskToCidr(cidrToSubnetMask(0))).toBe(0)
      expect(subnetMaskToCidr(cidrToSubnetMask(32))).toBe(32)
    })

    test('典型的なクラスフルネットワーク', () => {
      // クラスA /8
      expect(cidrToSubnetMask(8)).toBe('255.0.0.0')
      expect(subnetMaskToCidr('255.0.0.0')).toBe(8)
      
      // クラスB /16  
      expect(cidrToSubnetMask(16)).toBe('255.255.0.0')
      expect(subnetMaskToCidr('255.255.0.0')).toBe(16)
      
      // クラスC /24
      expect(cidrToSubnetMask(24)).toBe('255.255.255.0')
      expect(subnetMaskToCidr('255.255.255.0')).toBe(24)
    })

    test('VLSMでよく使われるサブネット', () => {
      // /30 (ポイントツーポイント用)
      expect(cidrToSubnetMask(30)).toBe('255.255.255.252')
      expect(subnetMaskToCidr('255.255.255.252')).toBe(30)
      
      // /29 (小規模LAN用)
      expect(cidrToSubnetMask(29)).toBe('255.255.255.248')
      expect(subnetMaskToCidr('255.255.255.248')).toBe(29)
      
      // /27 (中規模セグメント用)
      expect(cidrToSubnetMask(27)).toBe('255.255.255.224')
      expect(subnetMaskToCidr('255.255.255.224')).toBe(27)
    })
  })
})
