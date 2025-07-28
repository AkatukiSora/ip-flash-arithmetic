/**
 * host-generator.ts のテスト
 */
import { generateHostIpInNetwork } from '../utils/host-generator'

describe('host-generator', () => {
  describe('generateHostIpInNetwork', () => {
    it('/24ネットワーク内の有効なホストIPを生成する', () => {
      const networkIp = '192.168.1.0'
      const cidr = 24
      
      const hostIp = generateHostIpInNetwork(networkIp, cidr)
      const parts = hostIp.split('.').map(Number)
      
      expect(parts).toHaveLength(4)
      expect(parts[0]).toBe(192)
      expect(parts[1]).toBe(168)
      expect(parts[2]).toBe(1)
      expect(parts[3]).toBeGreaterThan(0) // ネットワークアドレスではない
      expect(parts[3]).toBeLessThan(255)  // ブロードキャストアドレスではない
    })

    it('/16ネットワーク内の有効なホストIPを生成する', () => {
      const networkIp = '172.16.0.0'
      const cidr = 16
      
      const hostIp = generateHostIpInNetwork(networkIp, cidr)
      const parts = hostIp.split('.').map(Number)
      
      expect(parts).toHaveLength(4)
      expect(parts[0]).toBe(172)
      expect(parts[1]).toBe(16)
      
      // ネットワークアドレス (172.16.0.0) とブロードキャストアドレス (172.16.255.255) 以外
      if (parts[2] === 0 && parts[3] === 0) {
        // ネットワークアドレスの場合（まれにあり得る）
        expect(false).toBe(true) // この条件は発生すべきではない
      }
      if (parts[2] === 255 && parts[3] === 255) {
        // ブロードキャストアドレスの場合（まれにあり得る）
        expect(false).toBe(true) // この条件は発生すべきではない
      }
    })

    it('/8ネットワーク内の有効なホストIPを生成する', () => {
      const networkIp = '10.0.0.0'
      const cidr = 8
      
      const hostIp = generateHostIpInNetwork(networkIp, cidr)
      const parts = hostIp.split('.').map(Number)
      
      expect(parts).toHaveLength(4)
      expect(parts[0]).toBe(10)
      
      // ネットワークアドレス (10.0.0.0) とブロードキャストアドレス (10.255.255.255) 以外
      const isNetworkAddress = parts[1] === 0 && parts[2] === 0 && parts[3] === 0
      const isBroadcastAddress = parts[1] === 255 && parts[2] === 255 && parts[3] === 255
      
      expect(isNetworkAddress).toBe(false)
      expect(isBroadcastAddress).toBe(false)
    })

    it('/30ネットワーク内の有効なホストIPを生成する（2つのホストのみ）', () => {
      const networkIp = '192.168.1.0'
      const cidr = 30
      
      const hostIp = generateHostIpInNetwork(networkIp, cidr)
      const parts = hostIp.split('.').map(Number)
      
      expect(parts).toHaveLength(4)
      expect(parts[0]).toBe(192)
      expect(parts[1]).toBe(168)
      expect(parts[2]).toBe(1)
      
      // /30の場合、最後のオクテットは1または2のみ有効
      expect([1, 2]).toContain(parts[3])
    })

    it('/29ネットワーク内の有効なホストIPを生成する（6つのホスト）', () => {
      const networkIp = '203.0.113.8'
      const cidr = 29
      
      const hostIp = generateHostIpInNetwork(networkIp, cidr)
      const parts = hostIp.split('.').map(Number)
      
      expect(parts).toHaveLength(4)
      expect(parts[0]).toBe(203)
      expect(parts[1]).toBe(0)
      expect(parts[2]).toBe(113)
      
      // /29の場合、最後のオクテットは9, 10, 11, 12, 13, 14のみ有効
      expect(parts[3]).toBeGreaterThanOrEqual(9)
      expect(parts[3]).toBeLessThanOrEqual(14)
      expect(parts[3]).not.toBe(8)  // ネットワークアドレス
      expect(parts[3]).not.toBe(15) // ブロードキャストアドレス
    })

    it('複数回実行して一貫した結果を得る', () => {
      const networkIp = '198.51.100.0'
      const cidr = 25
      
      for (let i = 0; i < 10; i++) {
        const hostIp = generateHostIpInNetwork(networkIp, cidr)
        const parts = hostIp.split('.').map(Number)
        
        expect(parts[0]).toBe(198)
        expect(parts[1]).toBe(51)
        expect(parts[2]).toBe(100)
        
        // /25の場合、最後のオクテットは1-126の範囲
        expect(parts[3]).toBeGreaterThan(0)    // ネットワークアドレスではない
        expect(parts[3]).toBeLessThan(127)     // ブロードキャストアドレスではない
      }
    })

    it('極端に小さなネットワーク（/31）でも動作する', () => {
      const networkIp = '192.0.2.0'
      const cidr = 31
      
      // /31は通常point-to-pointリンクで使用され、ホストアドレスは2つ
      const hostIp = generateHostIpInNetwork(networkIp, cidr)
      const parts = hostIp.split('.').map(Number)
      
      expect(parts).toHaveLength(4)
      expect(parts[0]).toBe(192)
      expect(parts[1]).toBe(0)
      expect(parts[2]).toBe(2)
      
      // /31の場合、最後のオクテットは0または1
      expect([0, 1]).toContain(parts[3])
    })

    it('様々なネットワークアドレスで動作する', () => {
      const testCases = [
        { networkIp: '1.1.1.0', cidr: 24 },
        { networkIp: '127.0.0.0', cidr: 8 },
        { networkIp: '169.254.0.0', cidr: 16 },
        { networkIp: '224.0.0.0', cidr: 4 }
      ]
      
      testCases.forEach(({ networkIp, cidr }) => {
        const hostIp = generateHostIpInNetwork(networkIp, cidr)
        const parts = hostIp.split('.').map(Number)
        
        expect(parts).toHaveLength(4)
        parts.forEach(part => {
          expect(part).toBeGreaterThanOrEqual(0)
          expect(part).toBeLessThanOrEqual(255)
        })
        
        expect(hostIp).not.toBe(networkIp) // ネットワークアドレスと同じではない
      })
    })

    it('フォールバック処理が適切に動作する', () => {
      // 非常に小さなネットワークでフォールバック処理をテスト
      const networkIp = '192.168.1.252'
      const cidr = 30
      
      const hostIp = generateHostIpInNetwork(networkIp, cidr)
      
      expect(hostIp).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
      expect(hostIp).not.toBe('192.168.1.252') // ネットワークアドレス
      expect(hostIp).not.toBe('192.168.1.255') // ブロードキャストアドレス
    })

    it('ランダム性を確認する', () => {
      const networkIp = '10.1.1.0'
      const cidr = 24
      const results = new Set()
      
      // 20回実行して複数の異なる結果を得ることを確認
      for (let i = 0; i < 20; i++) {
        const hostIp = generateHostIpInNetwork(networkIp, cidr)
        results.add(hostIp)
      }
      
      // 少なくとも5つ以上の異なるIPアドレスが生成されることを期待
      expect(results.size).toBeGreaterThanOrEqual(5)
    })
  })
})
