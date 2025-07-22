'use client'

import { useState, useEffect } from 'react'
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

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    QuestionType.BINARY_IP_CONVERSION,
    QuestionType.NETWORK_ADDRESS
  ])
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionType>(QuestionType.BINARY_IP_CONVERSION)
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [nickname, setNickname] = useState('')
  const [isGameFinished, setIsGameFinished] = useState(false)

  const generateNewQuestion = () => {
    const question = generateQuizQuestion(currentQuestionType)
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
  }

  const handleNextQuestion = () => {
    generateNewQuestion()
  }

  const toggleQuestionType = (type: QuestionType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        // 最低1つは選択されている必要がある
        if (prev.length === 1) return prev
        return prev.filter(t => t !== type)
      } else {
        return [...prev, type]
      }
    })
  }

  const resetQuiz = () => {
    setScore(0)
    setQuestionCount(0)
    setIsGameFinished(false)
    setShowScoreDialog(false)
    generateNewQuestion()
  }

  const finishGame = () => {
    setIsGameFinished(true)
    if (questionCount >= 5) { // 5問以上でスコア保存可能
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
        // ランキングページに遷移
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

  useEffect(() => {
    generateNewQuestion()
  }, [currentQuestionType])

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center text-gray-800 dark:text-gray-100">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/" 
              className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2"
            >
              ← 戻る
            </Link>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">クイズモード</h1>
            <button 
              onClick={resetQuiz}
              className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              リセット
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow dark:shadow-gray-900/30">
            <div className="flex justify-between text-sm mb-2 text-gray-800 dark:text-gray-100">
              <span>スコア: {score}/{questionCount}</span>
              <span>正答率: {accuracy}%</span>
            </div>
            
            <div className="mb-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">問題タイプ:</div>
              <select 
                name="questionType"
                value={currentQuestionType}
                onChange={(e) => setCurrentQuestionType(e.target.value as QuestionType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {QUESTION_TYPES.map(({ type, label }) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <div className="text-xs text-gray-600 mb-2">出題範囲 (従来):</div>
              <div className="flex flex-wrap gap-2">
                {QUESTION_TYPES.map(({ type, label }) => (
                  <button
                    key={type}
                    onClick={() => toggleQuestionType(type)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      selectedTypes.includes(type)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* 問題表示 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg dark:shadow-gray-900/30 mb-6">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
            問題 {questionCount + 1}
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
            {currentQuestion.question}
          </h2>

          {/* 選択肢 */}
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

          {/* 結果表示 */}
          {showAnswer && (
            <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <div className={`text-center font-bold text-lg mb-3 ${
                  isCorrect ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isCorrect ? '🎉 正解！' : '❌ 不正解'}
                </div>
                
                {currentQuestion.explanation && (
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mb-4">
                    <div className="font-semibold mb-1">解説:</div>
                    {currentQuestion.explanation}
                  </div>
                )}

                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-2"
                >
                  次の問題
                </button>
                
                {questionCount >= 5 && (
                  <button
                    onClick={finishGame}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                  >
                    結果を保存してランキングへ
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* スコア保存ダイアログ */}
        {showScoreDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                🎉 お疲れさまでした！
              </h3>
              
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {score}点 / {questionCount}問
                </div>
                <div className="text-gray-600">
                  正答率: {accuracy}%
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ニックネーム（ランキング表示用）
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ニックネームを入力"
                  maxLength={20}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowScoreDialog(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={saveScore}
                  disabled={!nickname.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
