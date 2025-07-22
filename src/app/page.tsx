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

        {/* フッター */}
        <footer className="mt-8 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg dark:shadow-gray-900/30">
            <p className="text-gray-600 dark:text-gray-300 text-xs mb-3">
              Links
            </p>
            <div className="flex justify-center space-x-6">
              <a
                href="https://x.com/_Sora_Engineer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-sm">Twitter</span>
              </a>
              <a
                href="https://github.com/AkatukiSora/ip-flash-arithmetic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm">GitHub</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
