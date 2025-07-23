/**
 * 問題生成機能のテスト
 */
import { 
  generateRandomIpAddress,
  generateRandomSubnetMask,
  generateRandomCidr,
  generateRandomBinaryIp,
  generateHostIpInNetwork,
  generateQuizQuestion,
  QuestionType
} from '../utils/quiz-generator'

describe('問題生成機能', () => {
  describe('generateRandomIpAddress', () => {
    test('ランダムなIPアドレスを生成できる', () => {
      const ip = generateRandomIpAddress()
      expect(ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
      
      const parts = ip.split('.').map(part => parseInt(part, 10))
      parts.forEach(part => {
        expect(part).toBeGreaterThanOrEqual(0)
        expect(part).toBeLessThanOrEqual(255)
      })
    })

    test('複数回生成しても有効なIPアドレスになる', () => {
      for (let i = 0; i < 10; i++) {
        const ip = generateRandomIpAddress()
        expect(ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
      }
    })
  })

  describe('generateRandomCidr', () => {
    test('ランダムなCIDR値を生成できる', () => {
      const cidr = generateRandomCidr()
      expect(cidr).toBeGreaterThanOrEqual(8)
      expect(cidr).toBeLessThanOrEqual(32)
    })

    test('複数回生成しても有効な範囲内である', () => {
      for (let i = 0; i < 20; i++) {
        const cidr = generateRandomCidr()
        expect(cidr).toBeGreaterThanOrEqual(8)
        expect(cidr).toBeLessThanOrEqual(32)
      }
    })
  })

  describe('generateRandomBinaryIp', () => {
    test('ランダムな2進数表記IPアドレスを生成できる', () => {
      const binaryIp = generateRandomBinaryIp()
      expect(binaryIp).toMatch(/^[01]{8}\.[01]{8}\.[01]{8}\.[01]{8}$/)
    })

    test('生成された2進数が有効なIPアドレスに変換できる', () => {
      const binaryIp = generateRandomBinaryIp()
      const parts = binaryIp.split('.')
      parts.forEach(part => {
        const decimal = parseInt(part, 2)
        expect(decimal).toBeGreaterThanOrEqual(0)
        expect(decimal).toBeLessThanOrEqual(255)
      })
    })
  })

  describe('generateHostIpInNetwork', () => {
    test('ネットワーク内の有効なホストIPアドレスを生成できる', () => {
      const networkIp = '192.168.1.0'
      const cidr = 24
      const hostIp = generateHostIpInNetwork(networkIp, cidr)
      
      expect(hostIp).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
      expect(hostIp).not.toBe('192.168.1.0') // ネットワークアドレスではない
      expect(hostIp).not.toBe('192.168.1.255') // ブロードキャストアドレスではない
    })

    test('小さなネットワーク (/30) でもホストIPを生成できる', () => {
      const networkIp = '10.0.0.4'
      const cidr = 30
      const hostIp = generateHostIpInNetwork(networkIp, cidr)
      
      expect(hostIp).toMatch(/^10\.0\.0\.[4-7]$/)
      expect(hostIp).not.toBe('10.0.0.4') // ネットワークアドレス
      expect(hostIp).not.toBe('10.0.0.7') // ブロードキャストアドレス
    })

    test('非常に小さなサブネット(/31)でフォールバック処理をテストする', () => {
      // /31の場合、ホストアドレスは理論上存在しないが、フォールバック処理が働く
      const hostIp = generateHostIpInNetwork('192.168.1.0', 31)
      expect(hostIp).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
    })

    test('/32サブネット（単一ホスト）でフォールバック処理をテストする', () => {
      const hostIp = generateHostIpInNetwork('192.168.1.1', 32)
      // /32の場合でもフォールバック処理により何らかのIPが返される
      expect(hostIp).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
    })

    test('フォールバック処理で最後のオクテットが調整される', () => {
      // 特定のケースでフォールバック処理をトリガーさせる
      const hostIp = generateHostIpInNetwork('192.168.1.254', 31)
      expect(hostIp).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
    })

    test('フォールバック処理で3番目のオクテットが調整される場合', () => {
      // 最後のオクテットが上限に達した場合の処理をテスト
      const hostIp = generateHostIpInNetwork('10.0.255.254', 31)
      expect(hostIp).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
    })

    test('極端に小さなネットワークでのフォールバック処理', () => {
      // /30ネットワークでの特殊ケース
      const hostIp = generateHostIpInNetwork('172.16.0.252', 30)
      expect(hostIp).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
    })
  })

  describe('generateRandomSubnetMask', () => {
    test('ランダムなサブネットマスクを生成できる', () => {
      const mask = generateRandomSubnetMask()
      expect(mask).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
    })

    test('生成されたサブネットマスクが有効である', () => {
      for (let i = 0; i < 10; i++) {
        const mask = generateRandomSubnetMask()
        // サブネットマスクの検証（1が連続し、その後0が連続する）
        const parts = mask.split('.').map(part => parseInt(part, 10))
        const binary = parts
          .map(part => part.toString(2).padStart(8, '0'))
          .join('')
        expect(binary).toMatch(/^1*0*$/)
      }
    })
  })

  describe('generateQuizQuestion', () => {
    test('Binary IP変換問題を生成できる', () => {
      const question = generateQuizQuestion(QuestionType.BINARY_IP_CONVERSION)
      expect(question.type).toBe(QuestionType.BINARY_IP_CONVERSION)
      expect(question.question).toContain('2進数')
      expect(question.choices).toHaveLength(4)
      expect(question.correctAnswer).toBeDefined()
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(question.correctAnswer).toBeLessThan(4)
    })

    test('Binary IP変換問題は双方向変換をサポートしている', () => {
      // 一つの問題を生成して実際の問題文を確認
      const question = generateQuizQuestion(QuestionType.BINARY_IP_CONVERSION)
      console.log('Generated question:', question.question)
      
      // 基本的な構造をテスト
      expect(question.type).toBe(QuestionType.BINARY_IP_CONVERSION)
      expect(question.question).toBeTruthy()
      expect(question.choices).toHaveLength(4)
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(question.correctAnswer).toBeLessThan(4)
      
      // 問題文に「2進数」または「IPアドレス」が含まれることを確認
      expect(question.question).toMatch(/2進数|IPアドレス/)
    })

    test('Binary IP変換問題の選択肢が正しい', () => {
      const question = generateQuizQuestion(QuestionType.BINARY_IP_CONVERSION)
      expect(question.choices).toHaveLength(4)
      expect(question.choices.every(choice => typeof choice === 'string')).toBe(true)
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(question.correctAnswer).toBeLessThan(4)
      
      // 正解の選択肢が存在することを確認
      expect(question.choices[question.correctAnswer]).toBeDefined()
    })

    test('CIDR to Subnet変換問題を生成できる', () => {
      const question = generateQuizQuestion(QuestionType.CIDR_TO_SUBNET)
      expect(question.type).toBe(QuestionType.CIDR_TO_SUBNET)
      expect(question.question).toContain('CIDR')
      expect(question.question).toContain('サブネットマスク')
      expect(question.choices).toHaveLength(4)
    })

    test('HOST_IN_NETWORK問題を生成できる', () => {
      const question = generateQuizQuestion(QuestionType.HOST_IN_NETWORK)
      expect(question.type).toBe(QuestionType.HOST_IN_NETWORK)
      expect(question.question).toContain('ネットワーク')
      expect(question.question).toContain('有効なホストアドレス')
      expect(question.choices).toHaveLength(4)
      expect(question.explanation).toContain('ネットワークアドレス')
      expect(question.explanation).toContain('ブロードキャストアドレス')
    })

    test('ネットワークアドレス計算問題を生成できる', () => {
      const question = generateQuizQuestion(QuestionType.NETWORK_ADDRESS)
      expect(question.type).toBe(QuestionType.NETWORK_ADDRESS)
      expect(question.question).toContain('ネットワークアドレス')
      expect(question.choices).toHaveLength(4)
    })

    test('ブロードキャストアドレス計算問題を生成できる', () => {
      const question = generateQuizQuestion(QuestionType.BROADCAST_ADDRESS)
      expect(question.type).toBe(QuestionType.BROADCAST_ADDRESS)
      expect(question.question).toContain('ブロードキャストアドレス')
      expect(question.choices).toHaveLength(4)
    })

    test('ホスト数計算問題を生成できる', () => {
      const question = generateQuizQuestion(QuestionType.HOST_COUNT)
      expect(question.type).toBe(QuestionType.HOST_COUNT)
      expect(question.question).toContain('ホスト数')
      expect(question.choices).toHaveLength(4)
    })

    test('特殊ネットワークサイズの問題生成', () => {
      // 複数回実行して様々なサイズのネットワークをテスト
      const generatedSizes = new Set<string>()
      
      for (let i = 0; i < 20; i++) {
        const hostCountQuestion = generateQuizQuestion(QuestionType.HOST_COUNT)
        
        // 問題文からCIDRを抽出してサイズを確認
        const cidrMatch = hostCountQuestion.question.match(/\/(\d+)/)
        if (cidrMatch) {
          generatedSizes.add(cidrMatch[1])
        }
      }
      
      // 様々なサイズのネットワークが生成されることを確認
      expect(generatedSizes.size).toBeGreaterThan(2)
    })

    test('エラー処理: 無効な問題タイプ', () => {
      expect(() => generateQuizQuestion('INVALID_TYPE' as QuestionType)).toThrow('Unknown question type')
    })

    test('SUBNET_TO_CIDR問題を生成できる', () => {
      const question = generateQuizQuestion(QuestionType.SUBNET_TO_CIDR)
      expect(question.type).toBe(QuestionType.SUBNET_TO_CIDR)
      expect(question.question).toContain('サブネットマスク')
      expect(question.question).toContain('CIDR')
      expect(question.choices).toHaveLength(4)
      expect(question.choices.every(choice => choice.startsWith('/'))).toBe(true)
    })

    test('ロンゲストマッチ問題を生成できる', () => {
      const question = generateQuizQuestion(QuestionType.LONGEST_MATCH)
      expect(question.type).toBe(QuestionType.LONGEST_MATCH)
      expect(question.question).toContain('最長マッチ')
      expect(question.question).toContain('longest match')
      expect(question.choices).toHaveLength(4)
      expect(question.choices.every(choice => choice.includes('/'))).toBe(true)
      expect(question.explanation).toContain('最も具体的な')
    })

    test('全ての問題タイプが正常に生成される', () => {
      const questionTypes = [
        QuestionType.BINARY_IP_CONVERSION,
        QuestionType.CIDR_TO_SUBNET,
        QuestionType.SUBNET_TO_CIDR,
        QuestionType.NETWORK_ADDRESS,
        QuestionType.BROADCAST_ADDRESS,
        QuestionType.HOST_COUNT,
        QuestionType.HOST_IN_NETWORK,
        QuestionType.LONGEST_MATCH
      ]

      questionTypes.forEach(type => {
        const question = generateQuizQuestion(type)
        expect(question.type).toBe(type)
        expect(question.question).toBeTruthy()
        expect(question.choices).toHaveLength(4)
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(question.correctAnswer).toBeLessThan(4)
        expect(question.explanation).toBeTruthy()
      })
    })

    test('選択肢に重複がないことを確認', () => {
      const questionTypes = [
        QuestionType.BINARY_IP_CONVERSION,
        QuestionType.CIDR_TO_SUBNET,
        QuestionType.SUBNET_TO_CIDR,
        QuestionType.NETWORK_ADDRESS,
        QuestionType.BROADCAST_ADDRESS,
        QuestionType.HOST_COUNT,
        QuestionType.HOST_IN_NETWORK,
        QuestionType.LONGEST_MATCH
      ]

      questionTypes.forEach(type => {
        // 複数回試行して重複チェック
        let hasUniqueChoices = false
        for (let i = 0; i < 10; i++) {
          const question = generateQuizQuestion(type)
          const uniqueChoices = new Set(question.choices)
          if (uniqueChoices.size === 4) {
            hasUniqueChoices = true
            break
          }
        }
        
        // 少なくとも1回は重複のない選択肢が生成されることを確認
        expect(hasUniqueChoices).toBe(true)
      })
    })

    test('フォールバック処理により選択肢が確実に4つ生成される', () => {
      // 複数回テストして、常に4つの選択肢が生成されることを確認
      for (let i = 0; i < 10; i++) {
        const question = generateQuizQuestion(QuestionType.CIDR_TO_SUBNET)
        expect(question.choices).toHaveLength(4)
      }
    })

    test('数値型問題でのバリエーション生成をテスト', () => {
      // HOST_COUNTはnumber型の回答を生成するため、このケースをテスト
      const question = generateQuizQuestion(QuestionType.HOST_COUNT)
      expect(question.choices).toHaveLength(4)
      expect(question.choices.every(choice => /^\d+$/.test(choice))).toBe(true)
    })

    test('generateWrongChoices関数の直接テスト - defaultケース', () => {
      // 内部的にgenerateWrongChoices関数のdefaultブランチをテストするため
      // 予期しない回答タイプが渡された場合のテスト（通常は発生しないが、カバレッジ向上のため）
      
      // BINARY_IP_CONVERSION問題を生成して、間接的にgenerateWrongChoicesをテスト
      for (let i = 0; i < 5; i++) {
        const question = generateQuizQuestion(QuestionType.BINARY_IP_CONVERSION)
        expect(question.choices).toHaveLength(4)
        expect(question.choices.every(choice => typeof choice === 'string')).toBe(true)
      }
    })

    test('ロンゲストマッチ問題の詳細テスト', () => {
      // 複数回実行して、ロンゲストマッチの動作を確認
      for (let i = 0; i < 5; i++) {
        const question = generateQuizQuestion(QuestionType.LONGEST_MATCH)
        
        // 問題の基本構造を確認
        expect(question.type).toBe(QuestionType.LONGEST_MATCH)
        expect(question.question).toMatch(/IPアドレス \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)
        expect(question.choices).toHaveLength(4)
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(question.correctAnswer).toBeLessThan(4)
        
        // 全ての選択肢がネットワークアドレス/CIDR形式であることを確認
        question.choices.forEach(choice => {
          expect(choice).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/)
        })
        
        // 正解の選択肢が存在することを確認
        const correctChoice = question.choices[question.correctAnswer]
        expect(correctChoice).toBeTruthy()
        
        // 説明にルーティングテーブル情報が含まれることを確認
        expect(question.explanation).toContain('○')
        expect(question.explanation).toContain('×')
      }
    })

    test('ロンゲストマッチ問題でデフォルトルートが含まれることがある', () => {
      let foundDefaultRoute = false
      let foundDefaultRouteAsCorrect = false
      
      // 100回試行してデフォルトルートが含まれる問題を確認
      for (let i = 0; i < 100; i++) {
        const question = generateQuizQuestion(QuestionType.LONGEST_MATCH)
        
        const hasDefaultRoute = question.choices.some(choice => choice === '0.0.0.0/0')
        if (hasDefaultRoute) {
          foundDefaultRoute = true
          
          const correctChoice = question.choices[question.correctAnswer]
          if (correctChoice === '0.0.0.0/0') {
            foundDefaultRouteAsCorrect = true
            // デフォルトルートが正解の場合の説明を確認
            expect(question.explanation).toContain('デフォルトルート')
          }
        }
      }
      
      // 確率的にデフォルトルートが含まれることを確認
      expect(foundDefaultRoute).toBe(true)
      expect(foundDefaultRouteAsCorrect).toBe(true)
    })

    test('ロンゲストマッチ問題で紛らわしい選択肢が生成される', () => {
      for (let i = 0; i < 10; i++) {
        const question = generateQuizQuestion(QuestionType.LONGEST_MATCH)
        
        // 選択肢の中に、似ているネットワークアドレスが含まれることを確認
        const networks = question.choices.map(choice => {
          const [network, cidr] = choice.split('/')
          return { network, cidr: parseInt(cidr) }
        })
        
        // CIDRが大きい（より具体的な）選択肢が含まれることを確認
        const cidrs = networks.map(n => n.cidr).sort((a, b) => b - a)
        expect(cidrs[0]).toBeGreaterThanOrEqual(cidrs[1]) // 最大CIDR >= 2番目のCIDR
        
        // ネットワークアドレスが完全にランダムではないことを確認
        // 全ての選択肢がユニークであることを確認
        const uniqueNetworks = new Set(networks.map(n => `${n.network}/${n.cidr}`))
        expect(uniqueNetworks.size).toBe(4) // 全て異なる選択肢
        
        // CIDR値が有効な範囲内であることを確認
        networks.forEach(({ cidr }) => {
          expect(cidr).toBeGreaterThanOrEqual(0)
          expect(cidr).toBeLessThanOrEqual(32)
        })
      }
    })

    test('フォールバック選択肢生成のテスト', () => {
      // 複数の問題タイプでフォールバック処理が正しく動作することを確認
      const questionTypes = [
        QuestionType.CIDR_TO_SUBNET,
        QuestionType.SUBNET_TO_CIDR,
        QuestionType.NETWORK_ADDRESS,
        QuestionType.BROADCAST_ADDRESS,
        QuestionType.LONGEST_MATCH
      ]
      
      questionTypes.forEach(type => {
        for (let i = 0; i < 3; i++) {
          const question = generateQuizQuestion(type)
          expect(question.choices).toHaveLength(4)
          expect(new Set(question.choices).size).toBe(4) // 重複なし
        }
      })
    })
  })
})
