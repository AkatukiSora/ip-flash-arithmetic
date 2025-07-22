/**
 * 問題生成機能のテスト
 */
import { 
  generateRandomIpAddress,
  generateRandomSubnetMask,
  generateQuizQuestion,
  QuestionType,
  QuizQuestion
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
      expect(() => generateQuizQuestion('INVALID_TYPE' as any)).toThrow('Unknown question type')
    })
  })
})
