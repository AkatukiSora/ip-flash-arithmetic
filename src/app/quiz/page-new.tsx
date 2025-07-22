'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateQuizQuestion, QuestionType, type QuizQuestion } from '@/utils/quiz-generator'

const QUESTION_TYPES = [
  { type: QuestionType.BINARY_IP_CONVERSION, label: '2進数⇄IP変換' },
  { type: QuestionType.CIDR_TO_SUBNET, label: 'CIDR→サブネット' },
  { type: QuestionType.SUBNET_TO_CIDR, label: 'サブネット→CIDR' },
  { type: QuestionType.NETWORK_ADDRESS, label: 'ネットワークアドレス' },
  { type: QuestionType.BROADCAST_ADDRESS, label: 'ブロードキャスト' },
  { type: QuestionType.HOST_COUNT, label: 'ホスト数計算' },
  { type: QuestionType.HOST_IN_NETWORK, label: 'ホストアドレス選択' },
]

type GameMode = 'setup' | 'playing' | 'finished'

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
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  
  // 結果表示用
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [nickname, setNickname] = useState('')

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
    setShowScoreDialog(false)
    generateNewQuestion()
  }

  const resetToSetup = () => {
    setGameMode('setup')
    setSelectedTypes([])
    setScore(0)
    setQuestionCount(0)
    setCurrentQuestion(null)
    setShowScoreDialog(false)
  }

  const finishGame = () => {
    setGameMode('finished')
    if (questionCount >= 5) {
      setShowScoreDialog(true)
    }
  }

  const saveScore = async () => {
    if (!nickname.trim()) return

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname.trim(),
          score,
          accuracy,
          totalQuestions: questionCount,
        }),
      })

      if (response.ok) {
        setShowScoreDialog(false)
        window.location.href = '/ranking'
      } else {
        alert('スコアの保存に失敗しました')
      }
    } catch (error) {
      console.error('Error saving score:', error)
      alert('スコアの保存に失敗しました')
    }
  }

  const accuracy = questionCount > 0 ? Math.round((score / questionCount) * 100) : 0

  // セットアップ画面
  if (gameMode === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
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
                    <div className="font-mono text-sm">
                      {String.fromCharCode(65 + index)}. {choice}
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
        </div>
      </div>
    )
  }

  // 読み込み中
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center text-gray-800 dark:text-gray-100">読み込み中...</div>
      </div>
    </div>
  )
}
