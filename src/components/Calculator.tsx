'use client'

import { useState } from 'react'
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

interface CalculatorProps {
  isPopup?: boolean
}

export default function Calculator({ isPopup = false }: CalculatorProps) {
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
          // エラーの場合は 'なし' のまま
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

  const clearAll = () => {
    setIpInput('')
    setBinaryInput('')
    setCidrInput('')
    setSubnetInput('')
    setSubnetIp('')
    setSubnetCidr('')
    setSubnetResults(null)
  }

  const containerClass = isPopup 
    ? "h-full overflow-y-auto bg-white dark:bg-gray-800" 
    : ""

  return (
    <div className={containerClass}>
      <div className={`${isPopup ? 'p-4' : ''}`}>
        {/* モード切り替えタブ */}
        <div className="mb-6">
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setMode('converter')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'converter'
                  ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              変換ツール
            </button>
            <button
              onClick={() => setMode('subnet')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'subnet'
                  ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              サブネット計算
            </button>
          </div>
        </div>

        {mode === 'converter' && (
          <div className="space-y-6">
            {/* IP ⇔ 2進数変換 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow dark:shadow-gray-900/30">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                IP ⇔ 2進数変換
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      IPアドレス
                    </label>
                    <input
                      type="text"
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value)}
                      placeholder="192.168.1.1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <button
                    onClick={handleIpToBinary}
                    className="bg-orange-600 dark:bg-orange-700 text-white px-4 py-2 rounded-md hover:bg-orange-700 dark:hover:bg-orange-800 font-medium"
                  >
                    2進数に変換
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      2進数
                    </label>
                    <input
                      type="text"
                      value={binaryInput}
                      onChange={(e) => setBinaryInput(e.target.value)}
                      placeholder="11000000.10101000.00000001.00000001"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                    />
                  </div>
                  <button
                    onClick={handleBinaryToIp}
                    className="bg-orange-600 dark:bg-orange-700 text-white px-4 py-2 rounded-md hover:bg-orange-700 dark:hover:bg-orange-800 font-medium"
                  >
                    IPに変換
                  </button>
                </div>
              </div>
            </div>

            {/* CIDR ⇔ サブネットマスク変換 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow dark:shadow-gray-900/30">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                CIDR ⇔ サブネットマスク変換
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CIDR表記
                    </label>
                    <input
                      type="number"
                      value={cidrInput}
                      onChange={(e) => setCidrInput(e.target.value)}
                      placeholder="24"
                      min="0"
                      max="32"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <button
                    onClick={handleCidrToSubnet}
                    className="bg-orange-600 dark:bg-orange-700 text-white px-4 py-2 rounded-md hover:bg-orange-700 dark:hover:bg-orange-800 font-medium"
                  >
                    マスクに変換
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      サブネットマスク
                    </label>
                    <input
                      type="text"
                      value={subnetInput}
                      onChange={(e) => setSubnetInput(e.target.value)}
                      placeholder="255.255.255.0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <button
                    onClick={handleSubnetToCidr}
                    className="bg-orange-600 dark:bg-orange-700 text-white px-4 py-2 rounded-md hover:bg-orange-700 dark:hover:bg-orange-800 font-medium"
                  >
                    CIDRに変換
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'subnet' && (
          <div className="space-y-6">
            {/* サブネット計算 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow dark:shadow-gray-900/30">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                サブネット情報計算
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      IPアドレス
                    </label>
                    <input
                      type="text"
                      value={subnetIp}
                      onChange={(e) => setSubnetIp(e.target.value)}
                      placeholder="192.168.1.100"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CIDR
                    </label>
                    <input
                      type="number"
                      value={subnetCidr}
                      onChange={(e) => setSubnetCidr(e.target.value)}
                      placeholder="24"
                      min="0"
                      max="32"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <button
                  onClick={calculateSubnet}
                  className="w-full bg-orange-600 dark:bg-orange-700 text-white py-3 rounded-md hover:bg-orange-700 dark:hover:bg-orange-800 font-semibold"
                >
                  サブネット情報を計算
                </button>
              </div>

              {/* 計算結果 */}
              {subnetResults && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">計算結果</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">ネットワークアドレス:</span>
                        <div className="font-mono text-gray-800 dark:text-gray-100">{subnetResults.network}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">ブロードキャストアドレス:</span>
                        <div className="font-mono text-gray-800 dark:text-gray-100">{subnetResults.broadcast}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">最小ホストアドレス:</span>
                        <div className="font-mono text-gray-800 dark:text-gray-100">{subnetResults.minHost}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">最大ホストアドレス:</span>
                        <div className="font-mono text-gray-800 dark:text-gray-100">{subnetResults.maxHost}</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-600 dark:text-gray-300">利用可能ホスト数:</span>
                      <span className="font-mono text-lg font-bold text-orange-600 dark:text-orange-400 ml-2">
                        {subnetResults.hostCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* クリアボタン */}
        <div className="mt-6">
          <button
            onClick={clearAll}
            className="w-full bg-gray-600 dark:bg-gray-500 text-white py-3 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 font-semibold"
          >
            すべてクリア
          </button>
        </div>
      </div>
    </div>
  )
}
