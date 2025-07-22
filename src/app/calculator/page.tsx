'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  isValidIpAddress, 
  binaryToIp, 
  ipToBinary,
  cidrToSubnetMask,
  subnetMaskToCidr 
} from '@/utils/ip-utils'
import { 
  calculateNetworkAddress,
  calculateBroadcastAddress,
  calculateMinHostAddress,
  calculateMaxHostAddress,
  calculateHostCount
} from '@/utils/subnet-utils'

type CalculatorMode = 'converter' | 'subnet'

export default function CalculatorPage() {
  const [mode, setMode] = useState<CalculatorMode>('converter')
  
  // 変換機能の状態
  const [ipInput, setIpInput] = useState('')
  const [binaryInput, setBinaryInput] = useState('')
  const [cidrInput, setCidrInput] = useState('')
  const [subnetInput, setSubnetInput] = useState('')
  
  // サブネット計算の状態
  const [subnetIp, setSubnetIp] = useState('')
  const [subnetCidr, setSubnetCidr] = useState('')
  const [subnetResults, setSubnetResults] = useState<{
    network: string
    broadcast: string
    minHost: string
    maxHost: string
    hostCount: number
  } | null>(null)

  const handleBinaryToIp = () => {
    try {
      setIpInput(binaryToIp(binaryInput))
    } catch {
      alert('無効な2進数形式です')
    }
  }

  const handleIpToBinary = () => {
    try {
      setBinaryInput(ipToBinary(ipInput))
    } catch {
      alert('無効なIPアドレス形式です')
    }
  }

  const handleCidrToSubnet = () => {
    try {
      const cidr = parseInt(cidrInput, 10)
      setSubnetInput(cidrToSubnetMask(cidr))
    } catch {
      alert('無効なCIDR値です')
    }
  }

  const handleSubnetToCidr = () => {
    try {
      setCidrInput(subnetMaskToCidr(subnetInput).toString())
    } catch {
      alert('無効なサブネットマスクです')
    }
  }

  const calculateSubnet = () => {
    try {
      if (!isValidIpAddress(subnetIp)) {
        alert('無効なIPアドレスです')
        return
      }
      
      const cidr = parseInt(subnetCidr, 10)
      if (isNaN(cidr) || cidr < 0 || cidr > 32) {
        alert('無効なCIDR値です（0-32）')
        return
      }

      const network = calculateNetworkAddress(subnetIp, cidr)
      const broadcast = calculateBroadcastAddress(subnetIp, cidr)
      const hostCount = calculateHostCount(cidr)
      
      let minHost: string = 'なし'
      let maxHost: string = 'なし'
      
      // /32の場合はホストアドレスが存在しない
      if (cidr < 32) {
        try {
          minHost = calculateMinHostAddress(network)
          maxHost = calculateMaxHostAddress(broadcast)
        } catch {
          // /31や/32の場合はホストアドレスが存在しない
          minHost = 'なし'
          maxHost = 'なし'
        }
      }

      setSubnetResults({
        network,
        broadcast,
        minHost,
        maxHost,
        hostCount
      })
    } catch {
      alert('計算エラーが発生しました')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/" 
              className="text-orange-600 dark:text-orange-400 font-medium flex items-center gap-2"
            >
              ← 戻る
            </Link>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">🔢 計算機</h1>
            <div></div>
          </div>
          
          {/* モード切り替え */}
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow dark:shadow-gray-900/30">
            <button
              onClick={() => setMode('converter')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'converter'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700'
              }`}
            >
              変換ツール
            </button>
            <button
              onClick={() => setMode('subnet')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'subnet'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700'
              }`}
            >
              サブネット計算
            </button>
          </div>
        </header>

        {mode === 'converter' ? (
          <div className="space-y-6">
            {/* IP ⇄ 2進数変換 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow dark:shadow-gray-900/30">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">IP ⇄ 2進数変換</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    2進数表記
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={binaryInput}
                      onChange={(e) => setBinaryInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xs overflow-x-auto"
                      placeholder="11000000.10101000.00000001.00000001"
                    />
                    <button
                      onClick={handleBinaryToIp}
                      className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
                      title="2進数 → IP"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IPアドレス
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="192.168.1.1"
                    />
                    <button
                      onClick={handleIpToBinary}
                      className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
                      title="IP → 2進数"
                    >
                      ↑
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CIDR ↔ Subnet Mask */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow dark:shadow-gray-900/30">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">CIDR ↔ サブネットマスク</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CIDR
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={cidrInput}
                      onChange={(e) => setCidrInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="24"
                      min="0"
                      max="32"
                    />
                    <button
                      onClick={handleCidrToSubnet}
                      className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    サブネットマスク
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={subnetInput}
                      onChange={(e) => setSubnetInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="255.255.255.0"
                    />
                    <button
                      onClick={handleSubnetToCidr}
                      className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
                    >
                      ↑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* サブネット計算 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow dark:shadow-gray-900/30">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">サブネット計算</h3>
              
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IPアドレス
                  </label>
                  <input
                    type="text"
                    name="ipAddress"
                    value={subnetIp}
                    onChange={(e) => setSubnetIp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="192.168.1.100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CIDR
                  </label>
                  <input
                    type="number"
                    name="cidr"
                    value={subnetCidr}
                    onChange={(e) => setSubnetCidr(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="24"
                    min="0"
                    max="32"
                  />
                </div>
                
                <button
                  onClick={calculateSubnet}
                  className="w-full bg-orange-500 dark:bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors font-semibold"
                >
                  計算
                </button>
              </div>

              {/* 計算結果 */}
              {subnetResults && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">計算結果</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">ネットワークアドレス:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{subnetResults.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">ブロードキャスト:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{subnetResults.broadcast}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">最小ホスト:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{subnetResults.minHost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">最大ホスト:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{subnetResults.maxHost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">利用可能ホスト数:</span>
                      <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                        {subnetResults.hostCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* フッター */}
        <footer className="mt-8 text-center">
          <Link 
            href="/quiz"
            className="inline-block bg-orange-600 dark:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors"
          >
            🚀 クイズで練習してみよう！
          </Link>
        </footer>
      </div>
    </div>
  )
}
