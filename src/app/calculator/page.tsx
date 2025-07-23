'use client'

import Link from 'next/link'
import Calculator from '@/components/Calculator'

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-orange-900">
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/"
              className="text-orange-600 dark:text-orange-400 font-medium flex items-center gap-2"
            >
              ← ホーム
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              IP計算機
            </h1>
            <div className="w-16"></div>
          </div>
        </header>
        
        <Calculator />
      </div>
    </div>
  )
}
