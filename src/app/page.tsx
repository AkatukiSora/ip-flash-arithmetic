'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            IP Flush Arithmetic
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            IPアドレス計算の練習アプリ
          </p>
        </header>

        {/* ナビゲーション */}
        <nav className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/30 p-4">
            <div className="grid grid-cols-1 gap-3">
              <Link 
                href="/quiz"
                className="bg-orange-500 dark:bg-orange-600 text-white p-4 rounded-lg text-center font-semibold hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
              >
                🧠 クイズ
              </Link>
              
              <Link 
                href="/practice"
                className="bg-green-500 dark:bg-green-600 text-white p-4 rounded-lg text-center font-semibold hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
              >
                📚 練習
              </Link>
              
              <Link 
                href="/calculator"
                className="bg-blue-500 dark:bg-blue-600 text-white p-4 rounded-lg text-center font-semibold hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                🧮 計算機
              </Link>
            </div>
          </div>
        </nav>

        {/* アプリの説明 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg dark:shadow-gray-900/30 text-center text-gray-600 dark:text-gray-300 text-sm">
          <p className="mb-2">
            IPアドレス計算、サブネット計算、CIDR記法の変換など、<br/>
            ネットワーク技術に必要な基礎計算を楽しく学習できます。
          </p>
          <p>
            🎯 クイズでスコアに挑戦<br/>
            📚 練習で反復学習<br/>
            🧮 計算機で検証
          </p>
        </div>
      </div>
    </div>
  )
}
