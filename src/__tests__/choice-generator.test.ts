/**
 * choice-generator.ts のテスト
 */
import {
  shuffleArray,
  generateRandomBinaryIp,
  generateRandomCidr,
  generateRandomSubnetMask,
  generateWrongChoices,
  generateUniqueSubnetChoices,
  generateUniqueCidrChoices,
  shuffleChoices
} from '../utils/choice-generator'

describe('choice-generator', () => {
  describe('shuffleArray', () => {
    it('配列をシャッフルして同じ長さを保つ', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffleArray(original)
      
      expect(shuffled).toHaveLength(original.length)
      expect(shuffled).toEqual(expect.arrayContaining(original))
      expect(original).toEqual([1, 2, 3, 4, 5]) // 元の配列が変更されていないことを確認
    })

    it('空配列を処理できる', () => {
      const result = shuffleArray([])
      expect(result).toEqual([])
    })

    it('単一要素の配列を処理できる', () => {
      const result = shuffleArray([42])
      expect(result).toEqual([42])
    })
  })

  describe('generateRandomBinaryIp', () => {
    it('有効な2進数IPアドレスを生成する', () => {
      const binaryIp = generateRandomBinaryIp()
      const parts = binaryIp.split('.')
      
      expect(parts).toHaveLength(4)
      parts.forEach(part => {
        expect(part).toMatch(/^[01]{8}$/) // 8桁の2進数
        const decimal = parseInt(part, 2)
        expect(decimal).toBeGreaterThanOrEqual(0)
        expect(decimal).toBeLessThanOrEqual(255)
      })
    })
  })

  describe('generateRandomCidr', () => {
    it('/8から/32の範囲でCIDRを生成する', () => {
      for (let i = 0; i < 100; i++) {
        const cidr = generateRandomCidr()
        expect(cidr).toBeGreaterThanOrEqual(8)
        expect(cidr).toBeLessThanOrEqual(32)
      }
    })
  })

  describe('generateRandomSubnetMask', () => {
    it('有効なサブネットマスクを生成する', () => {
      const mask = generateRandomSubnetMask()
      const parts = mask.split('.')
      
      expect(parts).toHaveLength(4)
      
      // 有効なサブネットマスクの値をチェック
      const validOctets = [0, 128, 192, 224, 240, 248, 252, 254, 255]
      parts.forEach(part => {
        const octet = parseInt(part)
        expect(validOctets).toContain(octet)
      })
    })
  })

  describe('generateWrongChoices', () => {
    it('IP形式の間違った選択肢を3つ生成する', () => {
      const correctAnswer = '192.168.1.1'
      const wrongChoices = generateWrongChoices(correctAnswer, 'ip')
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctAnswer)
        expect(choice).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
      })
    })

    it('binary形式の間違った選択肢を3つ生成する', () => {
      const correctAnswer = '11000000.10101000.00000001.00000001'
      const wrongChoices = generateWrongChoices(correctAnswer, 'binary')
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctAnswer)
        expect(choice).toMatch(/^[01]{8}\.[01]{8}\.[01]{8}\.[01]{8}$/)
      })
    })

    it('number形式の間違った選択肢を3つ生成する', () => {
      const correctAnswer = '42'
      const wrongChoices = generateWrongChoices(correctAnswer, 'number')
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctAnswer)
        expect(parseInt(choice, 10)).toBeGreaterThanOrEqual(0)
      })
    })

    it('numberで正の数から負の数に変動する場合', () => {
      const correctAnswer = '5'
      const wrongChoices = generateWrongChoices(correctAnswer, 'number')
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctAnswer)
        const num = parseInt(choice, 10)
        expect(num).toBeGreaterThanOrEqual(0) // Math.max(0, ...) のため
      })
    })

    it('デフォルト分岐のテスト', () => {
      const correctAnswer = 'test'
      const wrongChoices = generateWrongChoices(correctAnswer, 'unknown' as any)
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctAnswer)
      })
    })

    it('フォールバック処理で確実に3つの選択肢を生成する', () => {
      // 非常に特殊な正解でフォールバック処理を発生させる
      const correctAnswer = 'unique-test-answer-12345'
      const wrongChoices = generateWrongChoices(correctAnswer, 'ip')
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctAnswer)
      })
    })

    it('特殊な正解でも確実に3つの選択肢を生成する', () => {
      const correctAnswer = 'unique-test-answer-12345'
      const wrongChoices = generateWrongChoices(correctAnswer, 'ip')
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctAnswer)
      })
    })
  })

  describe('generateUniqueSubnetChoices', () => {
    it('重複しないサブネットマスクの選択肢を3つ生成する', () => {
      const correctSubnet = '255.255.255.0'
      const wrongChoices = generateUniqueSubnetChoices(correctSubnet)
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctSubnet)
        // 有効なサブネットマスク形式であることを確認
        expect(choice).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
      })
      
      // 重複チェック
      const uniqueChoices = new Set(wrongChoices)
      expect(uniqueChoices.size).toBe(3)
    })

    it('様々なサブネットマスクで動作する', () => {
      const testMasks = [
        '255.255.255.255',
        '255.0.0.0',
        '255.255.254.0',
        '224.0.0.0'
      ]
      
      testMasks.forEach(correctSubnet => {
        const wrongChoices = generateUniqueSubnetChoices(correctSubnet)
        
        expect(wrongChoices).toHaveLength(3)
        wrongChoices.forEach(choice => {
          expect(choice).not.toBe(correctSubnet)
        })
      })
    })
  })

  describe('generateUniqueCidrChoices', () => {
    it('重複しないCIDRの選択肢を3つ生成する', () => {
      const correctCidr = 24
      const wrongChoices = generateUniqueCidrChoices(correctCidr)
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).toMatch(/^\/\d+$/)
        const cidr = parseInt(choice.substring(1))
        expect(cidr).not.toBe(correctCidr)
        expect(cidr).toBeGreaterThanOrEqual(8)
        expect(cidr).toBeLessThanOrEqual(32)
      })
      
      // 重複チェック
      const uniqueChoices = new Set(wrongChoices)
      expect(uniqueChoices.size).toBe(3)
    })

    it('様々なCIDR値で動作する', () => {
      const testCidrs = [8, 16, 24, 30, 32]
      
      testCidrs.forEach(correctCidr => {
        const wrongChoices = generateUniqueCidrChoices(correctCidr)
        
        expect(wrongChoices).toHaveLength(3)
        wrongChoices.forEach(choice => {
          const cidr = parseInt(choice.substring(1))
          expect(cidr).not.toBe(correctCidr)
        })
      })
    })

    it('100回の試行後にフォールバック処理が動作する', () => {
      // 極端なケースで強制的にフォールバック処理をテスト
      const correctCidr = 8
      const wrongChoices = generateUniqueCidrChoices(correctCidr)
      
      expect(wrongChoices).toHaveLength(3)
      
      // フォールバック処理で生成されたCIDRが有効な範囲内であることを確認
      wrongChoices.forEach(choice => {
        const cidr = parseInt(choice.substring(1))
        expect(cidr).toBeGreaterThan(0)
        expect(cidr).toBeLessThanOrEqual(40) // フォールバック処理で生成される範囲
      })
    })
  })

  describe('shuffleChoices', () => {
    it('正解と間違い選択肢をシャッフルして4つの選択肢を返す', () => {
      const correctAnswer = '192.168.1.0'
      const wrongChoices = ['10.0.0.0', '172.16.0.0', '203.0.113.0']
      
      const result = shuffleChoices(correctAnswer, wrongChoices)
      
      expect(result.choices).toHaveLength(4)
      expect(result.choices).toContain(correctAnswer)
      expect(result.correctIndex).toBeGreaterThanOrEqual(0)
      expect(result.correctIndex).toBeLessThan(4)
      expect(result.choices[result.correctIndex]).toBe(correctAnswer)
      
      // 間違い選択肢がすべて含まれていることを確認
      wrongChoices.forEach(choice => {
        expect(result.choices).toContain(choice)
      })
    })

    it('間違い選択肢が不足している場合も4つの選択肢を生成', () => {
      const correctAnswer = '192.168.1.0'
      const wrongChoices = ['10.0.0.0'] // 1つしかない
      
      const result = shuffleChoices(correctAnswer, wrongChoices)
      
      expect(result.choices).toHaveLength(4)
      expect(result.choices).toContain(correctAnswer)
      expect(result.correctIndex).toBeGreaterThanOrEqual(0)
      expect(result.correctIndex).toBeLessThan(4)
    })

    it('ネットワーク形式のフォールバック処理', () => {
      const correctAnswer = '192.168.1.0/24'
      const wrongChoices: string[] = []
      
      const result = shuffleChoices(correctAnswer, wrongChoices, 'network')
      
      expect(result.choices).toHaveLength(4)
      expect(result.choices).toContain(correctAnswer)
      
      // ネットワーク形式の選択肢が生成されることを確認
      const networkFormatChoices = result.choices.filter(choice => 
        choice !== correctAnswer && choice.includes('/')
      )
      expect(networkFormatChoices.length).toBeGreaterThan(0)
    })

    it('空の間違い選択肢配列でも動作する', () => {
      const correctAnswer = 'test-answer'
      const wrongChoices: string[] = []
      
      const result = shuffleChoices(correctAnswer, wrongChoices)
      
      expect(result.choices).toHaveLength(4)
      expect(result.choices).toContain(correctAnswer)
      expect(result.correctIndex).toBeGreaterThanOrEqual(0)
      expect(result.correctIndex).toBeLessThan(4)
    })

    it('間違い選択肢が3つを超える場合は最初の3つを使用する', () => {
      const correctAnswer = 'correct'
      const wrongChoices = ['wrong1', 'wrong2', 'wrong3', 'wrong4', 'wrong5']
      
      const result = shuffleChoices(correctAnswer, wrongChoices)
      
      expect(result.choices).toHaveLength(4)
      expect(result.choices).toContain(correctAnswer)
      
      // 最初の3つの間違い選択肢のいずれかが含まれていることを確認
      const usedWrongChoices = result.choices.filter(choice => choice !== correctAnswer)
      usedWrongChoices.forEach(choice => {
        expect(['wrong1', 'wrong2', 'wrong3']).toContain(choice)
      })
    })

    it('フォールバック処理で強制的に追加される処理をテスト', () => {
      const correctAnswer = 'test-answer'
      const wrongChoices: string[] = []
      
      // maxAttemptsに達した場合のフォールバック処理をテスト
      const result = shuffleChoices(correctAnswer, wrongChoices)
      
      expect(result.choices).toHaveLength(4)
      expect(result.choices).toContain(correctAnswer)
      
      // フォールバック選択肢が生成されることを確認
      const fallbackChoices = result.choices.filter(choice => 
        choice !== correctAnswer && choice.includes('fallback')
      )
      expect(fallbackChoices.length).toBeGreaterThan(0)
    })

    it('ネットワーク形式での複数回のリトライ処理をテスト', () => {
      const correctAnswer = '10.0.0.0/8'
      const wrongChoices: string[] = []
      
      const result = shuffleChoices(correctAnswer, wrongChoices, 'network')
      
      expect(result.choices).toHaveLength(4)
      expect(result.choices).toContain(correctAnswer)
      
      // ネットワーク形式の選択肢が生成されることを確認
      result.choices.forEach(choice => {
        if (choice !== correctAnswer) {
          expect(choice).toMatch(/\d+\.\d+\.\d+\.\d+\/\d+/)
        }
      })
    })
  })

  // エッジケースをテストする追加のdescribe
  describe('エッジケースとフォールバック処理', () => {
    it('generateWrongChoicesで最大試行回数に達した場合のフォールバック', () => {
      // 非常に特殊な正解で重複しにくい状況を作る
      const correctAnswer = 'very-unique-answer-123456789'
      const wrongChoices = generateWrongChoices(correctAnswer, 'ip')
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctAnswer)
      })
    })

    it('generateUniqueSubnetChoicesのフォールバック処理', () => {
      // 特殊なサブネットマスクでフォールバック処理をテスト
      const correctSubnet = 'unique-subnet-mask'
      const wrongChoices = generateUniqueSubnetChoices(correctSubnet)
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctSubnet)
      })
    })

    it('generateWrongChoicesで重複時の強制追加処理', () => {
      // 既存の選択肢と重複する可能性が高い状況を作る
      const correctAnswer = '192.168.1.1'
      
      // Math.randomをモックして重複を発生させる
      const originalRandom = Math.random
      let callCount = 0
      Math.random = jest.fn(() => {
        callCount++
        // 特定の呼び出しで同じ値を返すようにして重複を発生させる
        if (callCount % 10 === 0) return 0.5
        return originalRandom()
      })
      
      const wrongChoices = generateWrongChoices(correctAnswer, 'ip')
      
      expect(wrongChoices).toHaveLength(3)
      wrongChoices.forEach(choice => {
        expect(choice).not.toBe(correctAnswer)
      })
      
      // Math.randomを元に戻す
      Math.random = originalRandom
    })
  })
})
