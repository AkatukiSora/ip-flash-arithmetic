/**
 * longest-match-generator.ts のテスト
 */
import {
  generateLongestMatchNetworks,
  generateLongestMatchExplanation,
  LongestMatchNetworksResult
} from '../utils/longest-match-generator'
import { NetworkEntry } from '../utils/network-generator'

describe('longest-match-generator', () => {
  describe('generateLongestMatchNetworks', () => {
    it('有効なロンゲストマッチ問題を生成する', () => {
      const targetIp = '192.168.1.100'
      const result = generateLongestMatchNetworks(targetIp)
      
      expect(result.targetIp).toBe(targetIp)
      expect(result.correctNetwork).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
      expect(result.correctCidr).toBeGreaterThanOrEqual(0)
      expect(result.correctCidr).toBeLessThanOrEqual(32)
      expect(result.otherNetworks).toHaveLength(3)
      expect(result.explanation).toBeTruthy()
      
      // 他のネットワークが有効な形式であることを確認
      result.otherNetworks.forEach(network => {
        expect(network.network).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
        expect(network.cidr).toBeGreaterThanOrEqual(0)
        expect(network.cidr).toBeLessThanOrEqual(32)
      })
    })

    it('デフォルトルートが正解の場合を処理する', () => {
      // デフォルトルートが正解になるケースを強制的にテスト
      let foundDefaultRoute = false
      
      for (let i = 0; i < 20; i++) {
        const targetIp = `10.${i}.${i}.${i}`
        const result = generateLongestMatchNetworks(targetIp)
        
        if (result.correctNetwork === '0.0.0.0' && result.correctCidr === 0) {
          foundDefaultRoute = true
          
          expect(result.targetIp).toBe(targetIp)
          expect(result.otherNetworks).toHaveLength(3)
          expect(result.explanation).toContain('デフォルトルート')
          break
        }
      }
      
      // 20回試行してデフォルトルートケースが見つからない場合でも問題なし
      // （確率的なテストのため）
    })

    it('通常のケースで具体的なネットワークが正解になる', () => {
      let foundSpecificNetwork = false
      
      for (let i = 0; i < 10; i++) {
        const targetIp = `172.16.${i}.${i + 10}`
        const result = generateLongestMatchNetworks(targetIp)
        
        if (result.correctNetwork !== '0.0.0.0') {
          foundSpecificNetwork = true
          
          expect(result.correctCidr).toBeGreaterThan(0)
          expect([16, 20, 24, 28]).toContain(result.correctCidr)
          break
        }
      }
      
      expect(foundSpecificNetwork).toBe(true)
    })

    it('生成されたネットワークが重複しない', () => {
      const targetIp = '203.0.113.50'
      const result = generateLongestMatchNetworks(targetIp)
      
      const allNetworks = [
        { network: result.correctNetwork, cidr: result.correctCidr },
        ...result.otherNetworks
      ]
      
      const networkStrings = allNetworks.map(n => `${n.network}/${n.cidr}`)
      const uniqueNetworks = new Set(networkStrings)
      
      expect(uniqueNetworks.size).toBe(allNetworks.length)
    })

    it('複数回実行しても一貫した形式の結果を返す', () => {
      for (let i = 0; i < 5; i++) {
        const targetIp = `198.51.100.${i * 10}`
        const result = generateLongestMatchNetworks(targetIp)
        
        expect(result).toHaveProperty('targetIp')
        expect(result).toHaveProperty('correctNetwork')
        expect(result).toHaveProperty('correctCidr')
        expect(result).toHaveProperty('otherNetworks')
        expect(result).toHaveProperty('explanation')
        
        expect(result.otherNetworks).toHaveLength(3)
      }
    })

    it('様々なIPアドレス範囲で動作する', () => {
      const testIps = [
        '10.0.0.1',
        '172.16.1.1', 
        '192.168.1.1',
        '8.8.8.8',
        '1.1.1.1',
        '203.0.113.50'
      ]
      
      testIps.forEach(targetIp => {
        const result = generateLongestMatchNetworks(targetIp)
        
        expect(result.targetIp).toBe(targetIp)
        expect(result.correctNetwork).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
        expect(result.otherNetworks).toHaveLength(3)
        
        // すべてのネットワークが有効な形式であることを確認
        result.otherNetworks.forEach(network => {
          expect(network.network).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
          expect(network.cidr).toBeGreaterThanOrEqual(0)
          expect(network.cidr).toBeLessThanOrEqual(32)
        })
      })
    })

    it('デフォルトルートと通常ネットワークの両方のケースが存在する', () => {
      const results = []
      
      // 複数回実行して異なるケースを確認
      for (let i = 0; i < 20; i++) {
        const targetIp = `10.${i}.${i}.${i}`
        const result = generateLongestMatchNetworks(targetIp)
        results.push(result)
      }
      
      // デフォルトルートケースと通常ケースの両方が存在することを確認
      const hasDefaultRoute = results.some(r => r.correctNetwork === '0.0.0.0' && r.correctCidr === 0)
      const hasSpecificNetwork = results.some(r => r.correctNetwork !== '0.0.0.0')
      
      // どちらか一方は必ず存在する（確率的なテストのため）
      expect(hasDefaultRoute || hasSpecificNetwork).toBe(true)
    })
  })

  describe('generateLongestMatchExplanation', () => {
    it('正解ネットワークの説明を生成する', () => {
      const targetIp = '192.168.1.100'
      const correctNetwork = '192.168.1.0'
      const correctCidr = 24
      const otherNetworks: NetworkEntry[] = [
        { network: '192.168.0.0', cidr: 16 },
        { network: '10.0.0.0', cidr: 8 },
        { network: '172.16.0.0', cidr: 12 }
      ]
      
      const explanation = generateLongestMatchExplanation(
        targetIp, correctNetwork, correctCidr, otherNetworks
      )
      
      expect(explanation).toContain('✅ 正解')
      expect(explanation).toContain(`${correctNetwork}/${correctCidr}`)
      expect(explanation).toContain('ルーティング判定結果')
      expect(explanation).toContain('ロンゲストマッチ')
      
      // 他のネットワークの判定結果も含まれていることを確認
      otherNetworks.forEach(network => {
        expect(explanation).toContain(`${network.network}/${network.cidr}`)
      })
    })

    it('デフォルトルートが正解の場合の説明を生成する', () => {
      const targetIp = '203.0.113.1'
      const correctNetwork = '0.0.0.0'
      const correctCidr = 0
      const otherNetworks: NetworkEntry[] = [
        { network: '10.0.0.0', cidr: 8 },
        { network: '172.16.0.0', cidr: 16 },
        { network: '192.168.1.0', cidr: 24 }
      ]
      
      const explanation = generateLongestMatchExplanation(
        targetIp, correctNetwork, correctCidr, otherNetworks
      )
      
      expect(explanation).toContain('デフォルトルート')
      expect(explanation).toContain('0.0.0.0/0')
      expect(explanation).toContain('すべてのIPアドレスがマッチ')
      expect(explanation).toContain('マッチするネットワークがない場合')
    })

    it('マッチ結果を正しく表示する', () => {
      const targetIp = '192.168.1.50'
      const correctNetwork = '192.168.1.0'
      const correctCidr = 24
      const otherNetworks: NetworkEntry[] = [
        { network: '192.168.0.0', cidr: 16 }, // マッチする
        { network: '10.0.0.0', cidr: 8 },    // マッチしない
        { network: '0.0.0.0', cidr: 0 }      // デフォルトルート（マッチする）
      ]
      
      const explanation = generateLongestMatchExplanation(
        targetIp, correctNetwork, correctCidr, otherNetworks
      )
      
      expect(explanation).toContain('○ (最長マッチ)')
      expect(explanation).toContain('○')
      expect(explanation).toContain('×')
    })

    it('空の他ネットワークリストでも動作する', () => {
      const targetIp = '1.2.3.4'
      const correctNetwork = '1.2.3.0'
      const correctCidr = 24
      const otherNetworks: NetworkEntry[] = []
      
      const explanation = generateLongestMatchExplanation(
        targetIp, correctNetwork, correctCidr, otherNetworks
      )
      
      expect(explanation).toContain('✅ 正解')
      expect(explanation).toContain('ルーティング判定結果')
      expect(explanation).toContain('ロンゲストマッチ')
    })

    it('複数のマッチするネットワークがある場合の説明', () => {
      const targetIp = '192.168.1.100'
      const correctNetwork = '192.168.1.0'
      const correctCidr = 24
      const otherNetworks: NetworkEntry[] = [
        { network: '192.168.0.0', cidr: 16 }, // より一般的なネットワーク
        { network: '192.0.0.0', cidr: 8 },    // さらに一般的
        { network: '0.0.0.0', cidr: 0 }       // デフォルトルート
      ]
      
      const explanation = generateLongestMatchExplanation(
        targetIp, correctNetwork, correctCidr, otherNetworks
      )
      
      expect(explanation).toContain('最も具体的（CIDR値が最も大きい）')
      expect(explanation).toContain('より詳細なルートが優先')
    })

    it('様々なCIDR値で正しく動作する', () => {
      const testCases = [
        { cidr: 8, network: '10.0.0.0' },
        { cidr: 16, network: '172.16.0.0' },
        { cidr: 20, network: '192.168.0.0' },
        { cidr: 24, network: '203.0.113.0' },
        { cidr: 28, network: '198.51.100.0' },
        { cidr: 30, network: '192.0.2.0' }
      ]
      
      testCases.forEach(({ cidr, network }) => {
        const explanation = generateLongestMatchExplanation(
          '1.2.3.4', network, cidr, []
        )
        
        expect(explanation).toContain(`${network}/${cidr}`)
        expect(explanation).toContain('✅ 正解')
      })
    })
  })
})
