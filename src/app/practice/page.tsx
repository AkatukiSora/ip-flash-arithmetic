'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateQuizQuestion, QuestionType, type QuizQuestion } from '@/utils/quiz-generator'

const PRACTICE_TOPICS = [
  {
    type: QuestionType.BINARY_IP_CONVERSION,
    title: '2進数 ⇄ IP変換',
    description: '2進数とIPアドレスの双方向変換練習',
    icon: '🔃'
  },
  {
    type: QuestionType.CIDR_TO_SUBNET,
    title: 'CIDR → サブネット',
    description: 'CIDR表記をサブネットマスクに変換する練習',
    icon: '📐'
  },
  {
    type: QuestionType.NETWORK_ADDRESS,
    title: 'ネットワークアドレス計算',
    description: 'IPアドレスとCIDRからネットワークアドレスを求める',
    icon: '🌐'
  },
  {
    type: QuestionType.BROADCAST_ADDRESS,
    title: 'ブロードキャストアドレス計算',
    description: 'IPアドレスとCIDRからブロードキャストアドレスを求める',
    icon: '📡'
  },
  {
    type: QuestionType.HOST_COUNT,
    title: 'ホスト数計算',
    description: 'サブネットで利用可能なホスト数を計算する',
    icon: '🔢'
  },
  {
    type: QuestionType.HOST_IN_NETWORK,
    title: 'ホストアドレス選択',
    description: 'ネットワークに属する有効なホストアドレスを選択する',
    icon: '🏠'
  }
]

type ViewMode = 'topics' | 'practice'

export default function PracticePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('topics')
  const [currentTopic, setCurrentTopic] = useState<QuestionType | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const startPractice = (type: QuestionType) => {
    setCurrentTopic(type)
    generateNewQuestion(type)
    setViewMode('practice')
  }

  const generateNewQuestion = (type?: QuestionType) => {
    const questionType = type || currentTopic!
    const question = generateQuizQuestion(questionType)
    setCurrentQuestion(question)
    setSelectedAnswer(null)
    setShowAnswer(false)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showAnswer) return
    setSelectedAnswer(answerIndex)
    setShowAnswer(true)
  }

  const backToTopics = () => {
    setViewMode('topics')
    setCurrentTopic(null)
    setCurrentQuestion(null)
  }

  const getCurrentTopicInfo = () => {
    return PRACTICE_TOPICS.find(topic => topic.type === currentTopic)
  }

  if (viewMode === 'topics') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-green-900 p-4">
        <div className="max-w-md mx-auto">
          {/* ヘッダー */}
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Link 
                href="/" 
                className="text-green-600 dark:text-green-400 font-medium flex items-center gap-2"
              >
                ← 戻る
              </Link>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">📚 練習モード</h1>
              <div></div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow dark:shadow-gray-900/30">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                項目別に解説付きで学習できます<br/>
                自分のペースで練習しましょう
              </p>
            </div>
          </header>

          {/* 練習項目一覧 */}
          <div className="space-y-3">
            {PRACTICE_TOPICS.map((topic) => (
              <button
                key={topic.type}
                onClick={() => startPractice(topic.type)}
                className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 shadow dark:shadow-gray-900/30 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{topic.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {topic.description}
                    </p>
                  </div>
                  <div className="text-gray-400">→</div>
                </div>
              </button>
            ))}
          </div>

          {/* フッター */}
          <footer className="mt-8 text-center">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 mb-3">
                基礎をマスターしたら
              </p>
              <Link 
                href="/quiz"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                🚀 クイズに挑戦
              </Link>
            </div>
          </footer>
        </div>
      </div>
    )
  }

  // 練習モード
  const topicInfo = getCurrentTopicInfo()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={backToTopics}
              className="text-green-600 font-medium flex items-center gap-2"
            >
              ← 練習項目
            </button>
            <div className="text-center">
              <div className="text-xl">{topicInfo?.icon}</div>
              <div className="text-sm font-medium text-gray-800">
                {topicInfo?.title}
              </div>
            </div>
            <button 
              onClick={() => generateNewQuestion()}
              className="text-sm bg-green-100 px-3 py-1 rounded text-green-700 hover:bg-green-200 transition-colors"
            >
              新しい問題
            </button>
          </div>
          
          {/* 問題タイプ選択 */}
          <div className="bg-white rounded-lg p-4 shadow mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              問題タイプ選択:
            </label>
            <select 
              name="questionType"
              value={currentTopic || ''}
              onChange={(e) => {
                const newType = e.target.value as QuestionType
                setCurrentTopic(newType)
                generateNewQuestion(newType)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {PRACTICE_TOPICS.map(topic => (
                <option key={topic.type} value={topic.type}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>
        </header>

        {currentQuestion && (
          <div className="space-y-6">
            {/* 問題表示 */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                {currentQuestion.question}
              </h2>

              {/* 選択肢 */}
              <div className="space-y-3">
                {currentQuestion.choices.map((choice, index) => {
                  let buttonClass = 'w-full p-4 text-left rounded-lg border-2 transition-all '
                  
                  if (!showAnswer) {
                    buttonClass += 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  } else {
                    if (index === currentQuestion.correctAnswer) {
                      buttonClass += 'border-green-500 bg-green-100 text-green-800'
                    } else if (index === selectedAnswer) {
                      buttonClass += 'border-red-500 bg-red-100 text-red-800'
                    } else {
                      buttonClass += 'border-gray-200 bg-gray-50 text-gray-600'
                    }
                  }

                  return (
                    <button
                      key={`practice-choice-${index}`}
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
            </div>

            {/* 解説表示 */}
            {showAnswer && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className={`text-center font-bold text-lg mb-4 ${
                  selectedAnswer === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswer ? '🎉 正解！' : '📚 学習しよう'}
                </div>
                
                {currentQuestion.explanation && (
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700 mb-4">
                    <div className="font-semibold mb-2">💡 解説:</div>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => generateNewQuestion()}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    次の問題
                  </button>
                  <button
                    onClick={backToTopics}
                    className="px-6 py-3 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    項目選択
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
