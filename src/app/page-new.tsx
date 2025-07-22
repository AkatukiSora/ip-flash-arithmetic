'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            IP Flash Arithmetic
          </h1>
          <p className="text-gray-600 text-sm">
            IPアドレス関連の計算を<br/>
            フラッシュ演算形式で練習しよう
          </p>
        </header>

        {/* メインメニュー */}
        <div className="space-y-4">
          <Link 
            href="/quiz"
            className="block w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-center shadow-lg active:bg-blue-700 transition-colors"
          >
            <div className="text-lg">🚀 問題に挑戦</div>
            <div className="text-sm opacity-90">IPアドレス変換・計算問題</div>
          </Link>

          <Link 
            href="/practice"
            className="block w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-center shadow-lg active:bg-green-700 transition-colors"
          >
            <div className="text-lg">📚 練習モード</div>
            <div className="text-sm opacity-90">解説付きで学習</div>
          </Link>

          <Link 
            href="/ranking"
            className="block w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-center shadow-lg active:bg-purple-700 transition-colors"
          >
            <div className="text-lg">🏆 ランキング</div>
            <div className="text-sm opacity-90">スコアランキングを見る</div>
          </Link>

          <Link 
            href="/calculator"
            className="block w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-semibold text-center shadow-lg active:bg-orange-700 transition-colors"
          >
            <div className="text-lg">🔢 計算機</div>
            <div className="text-sm opacity-90">IP・サブネット計算ツール</div>
          </Link>
        </div>

        {/* フッター */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Practice makes perfect! 💪</p>
          <p className="mt-2">対応項目：IP変換・サブネット計算・CIDR・集約</p>
        </footer>
      </div>
    </div>
  )
}
