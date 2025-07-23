'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateQuizQuestion, QuestionType, type QuizQuestion } from '@/utils/quiz-generator'
import Calculator from '@/components/Calculator'

const QUESTION_TYPES = [
  { type: QuestionType.BINARY_IP_CONVERSION, label: 'IP→2進数変換' },
  { type: QuestionType.CIDR_TO_SUBNET, label: 'CIDR→サブネット' },
  { type: QuestionType.SUBNET_TO_CIDR, label: 'サブネット→CIDR' },
  { type: QuestionType.NETWORK_ADDRESS, label: 'ネットワークアドレス' },
  { type: QuestionType.BROADCAST_ADDRESS, label: 'ブロードキャスト' },
  { type: QuestionType.HOST_COUNT, label: 'ホスト数計算' },
  { type: QuestionType.HOST_IN_NETWORK, label: 'ホストアドレス選択' },
  { type: QuestionType.LONGEST_MATCH, label: 'ロンゲストマッチ' },
]

type GameMode = 'setup' | 'playing' | 'finished'

// 長いテキスト（二進数など）を適切に表示するためのヘルパー関数
const formatLongText = (text: string): React.ReactElement => {
  // 二進数表記の場合（ピリオドで区切られた8桁の数字）
  if (text.includes('.') && text.split('.').every(part => /^[01]{1,8}$/.test(part))) {
    const parts = text.split('.')
    return (
      <span className="block break-words">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && <span className="text-gray-400">.</span>}
            {(index + 1) % 2 === 0 && index < parts.length - 1 && <br />}
          </span>
        ))}
      </span>
    )
  }
  return <span>{text}</span>
}

export default function QuizPage() {
  // ゲーム状態
  const [gameMode, setGameMode] = useState<GameMode>('setup')
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([])
  const [totalQuestions, setTotalQuestions] = useState(10)
  
  // クイズ実行中の状態
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  
  // 計算機ポップアップの状態
  const [showCalculator, setShowCalculator] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const generateNewQuestion = () => {
    if (selectedTypes.length === 0) return
    
    const randomType = selectedTypes[Math.floor(Math.random() * selectedTypes.length)]
    const question = generateQuizQuestion(randomType)
    setCurrentQuestion(question)
    setSelectedAnswer(null)
    setShowAnswer(false)
    setIsCorrect(null)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showAnswer) return
    
    setSelectedAnswer(answerIndex)
    setShowAnswer(true)
    setQuestionCount(prev => prev + 1)
    
    const correct = answerIndex === currentQuestion?.correctAnswer
    setIsCorrect(correct)
    
    if (correct) {
      setScore(prev => prev + 1)
    }
    
    if (questionCount + 1 >= totalQuestions) {
      setTimeout(() => {
        finishGame()
      }, 2000)
    }
  }

  const handleNextQuestion = () => {
    if (questionCount >= totalQuestions) {
      finishGame()
    } else {
      generateNewQuestion()
    }
  }

  const toggleQuestionType = (type: QuestionType) => {
    if (gameMode !== 'setup') return
    
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type)
      } else {
        return [...prev, type]
      }
    })
  }

  const startQuiz = () => {
    if (selectedTypes.length === 0) return
    
    setGameMode('playing')
    setScore(0)
    setQuestionCount(0)
    generateNewQuestion()
  }

  const resetToSetup = () => {
    setGameMode('setup')
    setSelectedTypes([])
    setScore(0)
    setQuestionCount(0)
    setCurrentQuestion(null)
  }

  const finishGame = () => {
    setGameMode('finished')
  }

  const accuracy = questionCount > 0 ? Math.round((score / questionCount) * 100) : 0

  // セットアップ画面
  if (gameMode === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4">
        <div className="max-w-md mx-auto">
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Link 
                href="/" 
                className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2"
              >
                ← 戻る
              </Link>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">クイズ設定</h1>
              <div></div>
            </div>
          </header>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow dark:shadow-gray-900/30 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">出題範囲を選択</h2>
            <div className="space-y-2">
              {QUESTION_TYPES.map(({ type, label }) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleQuestionType(type)}
                    className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow dark:shadow-gray-900/30 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">問題数を選択</h2>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20].map(num => (
                <button
                  key={num}
                  onClick={() => setTotalQuestions(num)}
                  className={`py-2 rounded-lg transition-colors ${
                    totalQuestions === num
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {num}問
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={selectedTypes.length === 0}
            className={`w-full py-4 rounded-lg font-semibold transition-colors ${
              selectedTypes.length > 0
                ? 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            クイズを開始する ({selectedTypes.length}種類 / {totalQuestions}問)
          </button>
        </div>
      </div>
    )
  }

  // クイズ実行中の画面
  if (gameMode === 'playing' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4">
        <div className="max-w-md mx-auto">
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={resetToSetup}
                className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2"
              >
                ← 設定に戻る
              </button>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">クイズモード</h1>
              <button 
                onClick={finishGame}
                className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                終了
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow dark:shadow-gray-900/30">
              <div className="flex justify-between text-sm mb-2 text-gray-800 dark:text-gray-100">
                <span>問題: {questionCount}/{totalQuestions}</span>
                <span>正答率: {accuracy}%</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(questionCount / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </header>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg dark:shadow-gray-900/30 mb-6">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              問題 {questionCount + 1}
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.choices.map((choice, index) => {
                let buttonClass = 'w-full p-4 text-left rounded-lg border-2 transition-all '
                
                if (!showAnswer) {
                  buttonClass += 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                } else {
                  if (index === currentQuestion.correctAnswer) {
                    buttonClass += 'border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  } else if (index === selectedAnswer) {
                    buttonClass += 'border-red-500 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  } else {
                    buttonClass += 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                }

                return (
                  <button
                    key={index}
                    data-testid={`choice-${index}`}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                    disabled={showAnswer}
                  >
                    <div className={`font-mono ${choice.includes('.') && choice.split('.').some(part => part.length > 3) ? 'text-xs' : 'text-sm'}`}>
                      {String.fromCharCode(65 + index)}. {formatLongText(choice)}
                    </div>
                  </button>
                )
              })}
            </div>

            {showAnswer && (
              <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className={`text-center font-semibold mb-2 ${
                  isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isCorrect ? '✅ 正解!' : '❌ 不正解'}
                </div>
                
                {currentQuestion.explanation && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <strong>解説:</strong> {currentQuestion.explanation}
                  </div>
                )}

                {questionCount < totalQuestions ? (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                  >
                    次の問題へ ({questionCount}/{totalQuestions})
                  </button>
                ) : (
                  <button
                    onClick={finishGame}
                    className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
                  >
                    結果を見る
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* 計算機ポップアップボタン（右下固定） */}
          <button
            onClick={() => setShowCalculator(true)}
            className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition-colors z-40"
            title="計算機を開く"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>

          {/* 計算機ポップアップモーダル */}
          {showCalculator && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">計算機</h3>
                  <button
                    onClick={() => setShowCalculator(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="h-[70vh]">
                  <Calculator isPopup={true} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 結果表示画面
  if (gameMode === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4">
        <div className="max-w-md mx-auto">
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={resetToSetup}
                className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2"
              >
                ← 最初から
              </button>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">クイズ結果</h1>
              <Link 
                href="/"
                className="text-blue-600 dark:text-blue-400 font-medium"
              >
                ホーム
              </Link>
            </div>
          </header>

          {/* 結果表示 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg dark:shadow-gray-900/30 mb-6 text-center">
            <div className="mb-4">
              <div className="text-4xl mb-2">
                {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '📚'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                お疲れさまでした！
              </h2>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {score}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    正解数
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    正答率
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {score} / {totalQuestions} 問正解
                </div>
              </div>
            </div>

            {/* 評価メッセージ */}
            <div className="mb-6">
              <div className="text-gray-600 dark:text-gray-300">
                {accuracy >= 90 && "素晴らしい！完璧な理解です！"}
                {accuracy >= 80 && accuracy < 90 && "とても良くできました！"}
                {accuracy >= 60 && accuracy < 80 && "良い結果です。もう少し練習してみましょう。"}
                {accuracy < 60 && "練習を重ねて理解を深めましょう。"}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="space-y-3">
              <button
                onClick={resetToSetup}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                もう一度挑戦する
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/practice"
                  className="bg-green-600 dark:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-800 transition-colors text-center"
                >
                  練習モード
                </Link>
                <Link 
                  href="/calculator"
                  className="bg-orange-600 dark:bg-orange-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors text-center"
                >
                  計算機
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 読み込み中
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center text-gray-800 dark:text-gray-100">読み込み中...</div>
      </div>
    </div>
  )
}
