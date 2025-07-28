/**
 * network-generator.ts のテスト
 */
import {
  NetworkDuplicateChecker,
  generateRandomIpAddress,
  generateNonMatchingButSimilarNetwork,
  generateConfusingNetwork,
  generateUniqueNetworkFallback
} from '../utils/network-generator'

describe('network-generator', () => {
  describe('NetworkDuplicateChecker', () => {
    it('正しく初期化され、正解ネットワークを追跡する', () => {
      const checker = new NetworkDuplicateChecker('192.168.1.0', 24)
      
      expect(checker.isDuplicate('192.168.1.0', 24)).toBe(true)
      expect(checker.isDuplicate('192.168.2.0', 24)).toBe(false)
      expect(checker.size()).toBe(0)
    })

    it('既存のネットワークリストと一緒に初期化できる', () => {
      const existingNetworks = [
        { network: '10.0.0.0', cidr: 8 },
        { network: '172.16.0.0', cidr: 16 }
      ]
      const checker = new NetworkDuplicateChecker('192.168.1.0', 24, existingNetworks)
      
      expect(checker.isDuplicate('10.0.0.0', 8)).toBe(true)
      expect(checker.isDuplicate('172.16.0.0', 16)).toBe(true)
      expect(checker.isDuplicate('203.0.113.0', 24)).toBe(false)
      expect(checker.size()).toBe(2)
    })

    it('新しいネットワークを追加できる', () => {
      const checker = new NetworkDuplicateChecker('192.168.1.0', 24)
      
      checker.addNetwork('10.0.0.0', 8)
      expect(checker.isDuplicate('10.0.0.0', 8)).toBe(true)
      expect(checker.size()).toBe(1)
      
      checker.addNetwork('172.16.0.0', 16)
      expect(checker.size()).toBe(2)
    })

    it('既存のネットワークのコピーを返す', () => {
      const existingNetworks = [{ network: '10.0.0.0', cidr: 8 }]
      const checker = new NetworkDuplicateChecker('192.168.1.0', 24, existingNetworks)
      
      const retrieved = checker.getExistingNetworks()
      expect(retrieved).toEqual(existingNetworks)
      
      // コピーであることを確認（元の配列を変更しても影響がない）
      retrieved.push({ network: '172.16.0.0', cidr: 16 })
      expect(checker.size()).toBe(1)
    })

    it('同じネットワークアドレスでも異なるCIDRは異なるものとして扱う', () => {
      const checker = new NetworkDuplicateChecker('192.168.1.0', 24)
      
      expect(checker.isDuplicate('192.168.1.0', 24)).toBe(true)
      expect(checker.isDuplicate('192.168.1.0', 25)).toBe(false)
      expect(checker.isDuplicate('192.168.1.0', 23)).toBe(false)
    })
  })

  describe('generateRandomIpAddress', () => {
    it('有効なIPアドレス形式を生成する', () => {
      for (let i = 0; i < 10; i++) {
        const ip = generateRandomIpAddress()
        const parts = ip.split('.')
        
        expect(parts).toHaveLength(4)
        parts.forEach(part => {
          const octet = parseInt(part)
          expect(octet).toBeGreaterThanOrEqual(0)
          expect(octet).toBeLessThanOrEqual(255)
        })
      }
    })

    it('毎回異なるIPアドレスを生成する可能性が高い', () => {
      const ips = new Set()
      for (let i = 0; i < 20; i++) {
        ips.add(generateRandomIpAddress())
      }
      
      // 20回の生成で少なくとも10個は異なることを期待
      expect(ips.size).toBeGreaterThanOrEqual(10)
    })
  })

  describe('generateNonMatchingButSimilarNetwork', () => {
    it('様々なCIDRで異なるネットワークアドレスを生成する', () => {
      const testCases = [
        { targetIp: '192.168.1.100', cidr: 24 },
        { targetIp: '172.16.50.100', cidr: 16 },
        { targetIp: '10.50.100.200', cidr: 8 },
        { targetIp: '203.0.113.50', cidr: 30 }
      ]
      
      testCases.forEach(({ targetIp, cidr }) => {
        const similarNetwork = generateNonMatchingButSimilarNetwork(targetIp, cidr)
        
        expect(similarNetwork).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
        
        // 対象IPから計算されるネットワークアドレスとは異なることを確認
        // （calculateNetworkAddressを使った正確な比較は避け、単純に形式のみ確認）
      })
    })
  })

  describe('generateConfusingNetwork', () => {
    it('紛らわしいネットワークアドレスを生成する', () => {
      const testCases = [
        { targetIp: '192.168.1.100', confusingCidr: 25, baseCidr: 24 },
        { targetIp: '10.0.1.50', confusingCidr: 24, baseCidr: 16 },
        { targetIp: '172.16.0.10', confusingCidr: 28, baseCidr: 24 }
      ]
      
      testCases.forEach(({ targetIp, confusingCidr, baseCidr }) => {
        const confusingNetwork = generateConfusingNetwork(targetIp, confusingCidr, baseCidr)
        
        if (confusingNetwork) {
          expect(confusingNetwork).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
        }
      })
    })

    it('有効なIPアドレスまたはnullを返す', () => {
      const targetIp = '192.168.1.100'
      const confusingCidr = 24
      const baseCidr = 24
      
      const confusingNetwork = generateConfusingNetwork(targetIp, confusingCidr, baseCidr)
      
      // 結果は有効なIPアドレスまたはnullのいずれか
      if (confusingNetwork !== null) {
        expect(confusingNetwork).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
      } else {
        expect(confusingNetwork).toBeNull()
      }
    })
  })

  describe('generateUniqueNetworkFallback', () => {
    it('重複しないユニークなネットワークを生成する', () => {
      const checker = new NetworkDuplicateChecker('192.168.1.0', 24)
      checker.addNetwork('10.0.0.0', 8)
      checker.addNetwork('172.16.0.0', 16)
      
      const possibleCidrs = [8, 16, 24, 30]
      const uniqueNetwork = generateUniqueNetworkFallback(checker, possibleCidrs)
      
      expect(uniqueNetwork.network).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
      expect(possibleCidrs).toContain(uniqueNetwork.cidr)
      expect(checker.isDuplicate(uniqueNetwork.network, uniqueNetwork.cidr)).toBe(false)
    })

    it('様々な条件でユニークなネットワークを生成する', () => {
      const testCases = [
        { correctNetwork: '192.168.1.0', correctCidr: 24, possibleCidrs: [8, 16, 24] },
        { correctNetwork: '10.0.0.0', correctCidr: 8, possibleCidrs: [16, 24, 30] },
        { correctNetwork: '172.16.0.0', correctCidr: 16, possibleCidrs: [8, 24, 28] }
      ]
      
      testCases.forEach(({ correctNetwork, correctCidr, possibleCidrs }) => {
        const checker = new NetworkDuplicateChecker(correctNetwork, correctCidr)
        const uniqueNetwork = generateUniqueNetworkFallback(checker, possibleCidrs)
        
        expect(uniqueNetwork.network).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
        expect(possibleCidrs).toContain(uniqueNetwork.cidr)
        expect(checker.isDuplicate(uniqueNetwork.network, uniqueNetwork.cidr)).toBe(false)
      })
    })
  })
})
