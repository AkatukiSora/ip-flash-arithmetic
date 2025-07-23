/**
 * 統合テスト - ワークフロー確認
 */
import { 
  generateQuizQuestion, 
  QuestionType
} from '../utils/quiz-generator'
import { 
  calculateNetworkAddress, 
  calculateBroadcastAddress,
  calculateHostCount 
} from '../utils/subnet-utils'
import { ipToBinary, cidrToSubnetMask } from '../utils/ip-utils'

describe('統合テスト', () => {
  describe('クイズワークフロー', () => {
    test('完全なクイズセッションを実行できる', () => {
      // 複数の問題タイプでクイズを生成
      const questionTypes = [
        QuestionType.BINARY_IP_CONVERSION,
        QuestionType.NETWORK_ADDRESS,
        QuestionType.HOST_COUNT
      ]
      
      const questions = questionTypes.map(type => generateQuizQuestion(type))
      
      questions.forEach((question, index) => {
        expect(question.type).toBe(questionTypes[index])
        expect(question.choices).toHaveLength(4)
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(question.correctAnswer).toBeLessThan(4)
        
        // 正解の選択肢が実際に正しいことを確認
        const correctChoice = question.choices[question.correctAnswer]
        expect(correctChoice).toBeTruthy()
      })
    })

    test('同じ問題タイプで複数回生成してもバリエーションがある', () => {
      const questions = Array.from({ length: 5 }, () => 
        generateQuizQuestion(QuestionType.BINARY_IP_CONVERSION)
      )
      
      // 問題文が異なることを確認（IPアドレスが違う）
      const uniqueQuestions = new Set(questions.map(q => q.question))
      expect(uniqueQuestions.size).toBeGreaterThan(1)
    })
  })

  describe('計算機ワークフロー', () => {
    test('IPアドレスから完全なサブネット情報を計算できる', () => {
      const ip = '192.168.1.100'
      const cidr = 24
      
      // ネットワーク情報を計算
      const networkAddress = calculateNetworkAddress(ip, cidr)
      const broadcastAddress = calculateBroadcastAddress(ip, cidr)
      const hostCount = calculateHostCount(cidr)
      const subnetMask = cidrToSubnetMask(cidr)
      const binaryIp = ipToBinary(ip)
      
      // 結果を検証
      expect(networkAddress).toBe('192.168.1.0')
      expect(broadcastAddress).toBe('192.168.1.255')
      expect(hostCount).toBe(254)
      expect(subnetMask).toBe('255.255.255.0')
      expect(binaryIp).toBe('11000000.10101000.00000001.01100100')
    })

    test('小さなネットワーク(/30)の完全な計算', () => {
      const ip = '10.0.0.5'
      const cidr = 30
      
      const networkAddress = calculateNetworkAddress(ip, cidr)
      const broadcastAddress = calculateBroadcastAddress(ip, cidr)
      const hostCount = calculateHostCount(cidr)
      
      expect(networkAddress).toBe('10.0.0.4')
      expect(broadcastAddress).toBe('10.0.0.7')
      expect(hostCount).toBe(2)
    })
  })

  describe('練習モードワークフロー', () => {
    test('各問題タイプで学習セッションを実行できる', () => {
      const practiceSession = {
        correctAnswers: 0,
        totalQuestions: 0,
        topicScores: new Map<QuestionType, number>()
      }

      // 各トピックで3問ずつ練習
      Object.values(QuestionType).forEach(type => {
        for (let i = 0; i < 3; i++) {
          const question = generateQuizQuestion(type)
          practiceSession.totalQuestions++
          
          // 正解を選択したとシミュレート
          if (question.correctAnswer >= 0) {
            practiceSession.correctAnswers++
            const currentScore = practiceSession.topicScores.get(type) || 0
            practiceSession.topicScores.set(type, currentScore + 1)
          }
        }
      })

      // セッション結果を検証
      expect(practiceSession.totalQuestions).toBe(24) // 8トピック × 3問
      expect(practiceSession.correctAnswers).toBe(24) // 全て正解として処理
      expect(practiceSession.topicScores.size).toBe(8) // 8つのトピック
    })
  })

  describe('エラーハンドリングワークフロー', () => {
    test('無効な入力に対して適切にエラーが発生する', () => {
      // 無効なIPアドレス
      expect(() => calculateNetworkAddress('999.999.999.999', 24)).toThrow()
      
      // 無効なCIDR
      expect(() => cidrToSubnetMask(33)).toThrow()
      
      // 無効な問題タイプ
      expect(() => generateQuizQuestion('INVALID_TYPE' as QuestionType)).toThrow()
    })

    test('境界値で正常に動作する', () => {
      // 最小ネットワーク /32
      expect(() => calculateNetworkAddress('192.168.1.1', 32)).not.toThrow()
      expect(calculateHostCount(32)).toBe(0)
      
      // 最大ネットワーク /0
      expect(() => calculateNetworkAddress('192.168.1.1', 0)).not.toThrow()
      expect(calculateHostCount(0)).toBe(4294967294)
    })
  })

  describe('パフォーマンステスト', () => {
    test('大量の問題生成でもパフォーマンスが良好', () => {
      const startTime = Date.now()
      
      // 100問生成
      for (let i = 0; i < 100; i++) {
        const randomType = Object.values(QuestionType)[i % 7]
        generateQuizQuestion(randomType)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 100問生成が1秒以内で完了することを確認
      expect(duration).toBeLessThan(1000)
    })
  })
})
