/**
 * Calculatorコンポーネントのテスト
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Calculator from '../components/Calculator'

describe('Calculator Component', () => {
  describe('基本的なレンダリング', () => {
    test('デフォルトで変換ツールモードが表示される', () => {
      render(<Calculator />)
      
      expect(screen.getByText('変換ツール')).toBeInTheDocument()
      expect(screen.getByText('サブネット計算')).toBeInTheDocument()
      expect(screen.getByText('IP ⇔ 2進数変換')).toBeInTheDocument()
      expect(screen.getByText('CIDR ⇔ サブネットマスク変換')).toBeInTheDocument()
    })

    test('ポップアップモードで正しくレンダリングされる', () => {
      render(<Calculator isPopup={true} />)
      
      // ポップアップモードではヘッダーが表示されない
      expect(screen.queryByText('IP計算機')).not.toBeInTheDocument()
      expect(screen.getByText('変換ツール')).toBeInTheDocument()
    })
  })

  describe('モード切り替え', () => {
    test('サブネット計算モードに切り替えできる', () => {
      render(<Calculator />)
      
      fireEvent.click(screen.getByText('サブネット計算'))
      
      expect(screen.getByText('サブネット情報計算')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('192.168.1.100')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('24')).toBeInTheDocument()
    })
  })

  describe('IP ⇔ 2進数変換', () => {
    test('IPアドレスを2進数に変換できる', async () => {
      render(<Calculator />)
      
      const ipInput = screen.getByPlaceholderText('192.168.1.1')
      const convertButton = screen.getByText('2進数に変換')
      
      fireEvent.change(ipInput, { target: { value: '192.168.1.1' } })
      fireEvent.click(convertButton)
      
      await waitFor(() => {
        const binaryInput = screen.getByPlaceholderText('11000000.10101000.00000001.00000001')
        expect(binaryInput).toHaveValue('11000000.10101000.00000001.00000001')
      })
    })

    test('2進数をIPアドレスに変換できる', async () => {
      render(<Calculator />)
      
      const binaryInput = screen.getByPlaceholderText('11000000.10101000.00000001.00000001')
      const convertButton = screen.getByText('IPに変換')
      
      fireEvent.change(binaryInput, { target: { value: '11000000.10101000.00000001.00000001' } })
      fireEvent.click(convertButton)
      
      await waitFor(() => {
        const ipInput = screen.getByPlaceholderText('192.168.1.1')
        expect(ipInput).toHaveValue('192.168.1.1')
      })
    })

    test('無効なIPアドレスでエラーアラートが表示される', () => {
      render(<Calculator />)
      
      const ipInput = screen.getByPlaceholderText('192.168.1.1')
      const convertButton = screen.getByText('2進数に変換')
      
      // alertをモック
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
      
      fireEvent.change(ipInput, { target: { value: '999.999.999.999' } })
      fireEvent.click(convertButton)
      
      expect(alertSpy).toHaveBeenCalledWith('無効なIPアドレス形式です')
      
      alertSpy.mockRestore()
    })

    test('無効な2進数でエラーアラートが表示される', () => {
      render(<Calculator />)
      
      const binaryInput = screen.getByPlaceholderText('11000000.10101000.00000001.00000001')
      const convertButton = screen.getByText('IPに変換')
      
      // alertをモック
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
      
      fireEvent.change(binaryInput, { target: { value: 'invalid.binary.format.here' } })
      fireEvent.click(convertButton)
      
      expect(alertSpy).toHaveBeenCalledWith('無効な2進数形式です')
      
      alertSpy.mockRestore()
    })

    test('無効なCIDR値でエラーアラートが表示される', () => {
      render(<Calculator />)
      
      const cidrInput = screen.getByPlaceholderText('24')
      const convertButton = screen.getByText('マスクに変換')
      
      // alertをモック
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
      
      fireEvent.change(cidrInput, { target: { value: '99' } })
      fireEvent.click(convertButton)
      
      expect(alertSpy).toHaveBeenCalledWith('無効なCIDR値です')
      
      alertSpy.mockRestore()
    })

    test('無効なサブネットマスクでエラーアラートが表示される', () => {
      render(<Calculator />)
      
      const subnetInput = screen.getByPlaceholderText('255.255.255.0')
      const convertButton = screen.getByText('CIDRに変換')
      
      // alertをモック
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
      
      fireEvent.change(subnetInput, { target: { value: '255.255.255.1' } })
      fireEvent.click(convertButton)
      
      expect(alertSpy).toHaveBeenCalledWith('無効なサブネットマスクです')
      
      alertSpy.mockRestore()
    })
  })

  describe('CIDR ⇔ サブネットマスク変換', () => {
    test('CIDRをサブネットマスクに変換できる', async () => {
      render(<Calculator />)
      
      const cidrInput = screen.getByPlaceholderText('24')
      const convertButton = screen.getByText('マスクに変換')
      
      fireEvent.change(cidrInput, { target: { value: '24' } })
      fireEvent.click(convertButton)
      
      await waitFor(() => {
        const subnetInput = screen.getByPlaceholderText('255.255.255.0')
        expect(subnetInput).toHaveValue('255.255.255.0')
      })
    })

    test('サブネットマスクをCIDRに変換できる', async () => {
      render(<Calculator />)
      
      const subnetInput = screen.getByPlaceholderText('255.255.255.0')
      const convertButton = screen.getByText('CIDRに変換')
      
      fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
      fireEvent.click(convertButton)
      
      await waitFor(() => {
        const cidrInput = screen.getByPlaceholderText('24')
        expect(cidrInput).toHaveValue(24) // number型として比較
      })
    })
  })

  describe('サブネット計算', () => {
    test('サブネット情報を計算できる', async () => {
      render(<Calculator />)
      
      // サブネット計算モードに切り替え
      fireEvent.click(screen.getByText('サブネット計算'))
      
      const ipInput = screen.getByPlaceholderText('192.168.1.100')
      const cidrInput = screen.getByPlaceholderText('24')
      const calculateButton = screen.getByText('サブネット情報を計算')
      
      fireEvent.change(ipInput, { target: { value: '192.168.1.100' } })
      fireEvent.change(cidrInput, { target: { value: '24' } })
      fireEvent.click(calculateButton)
      
      await waitFor(() => {
        expect(screen.getByText('計算結果')).toBeInTheDocument()
        expect(screen.getByText('192.168.1.0')).toBeInTheDocument() // ネットワークアドレス
        expect(screen.getByText('192.168.1.255')).toBeInTheDocument() // ブロードキャストアドレス
      })
    })

    test('無効なIPアドレスでエラーアラートが表示される', () => {
      render(<Calculator />)
      
      // サブネット計算モードに切り替え
      fireEvent.click(screen.getByText('サブネット計算'))
      
      const ipInput = screen.getByPlaceholderText('192.168.1.100')
      const cidrInput = screen.getByPlaceholderText('24')
      const calculateButton = screen.getByText('サブネット情報を計算')
      
      // alertをモック
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
      
      fireEvent.change(ipInput, { target: { value: 'invalid' } })
      fireEvent.change(cidrInput, { target: { value: '24' } })
      fireEvent.click(calculateButton)
      
      expect(alertSpy).toHaveBeenCalledWith('無効なIPアドレスです')
      
      alertSpy.mockRestore()
    })

    test('無効なCIDR値でエラーアラートが表示される', () => {
      render(<Calculator />)
      
      // サブネット計算モードに切り替え
      fireEvent.click(screen.getByText('サブネット計算'))
      
      const ipInput = screen.getByPlaceholderText('192.168.1.100')
      const cidrInput = screen.getByPlaceholderText('24')
      const calculateButton = screen.getByText('サブネット情報を計算')
      
      // alertをモック
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
      
      fireEvent.change(ipInput, { target: { value: '192.168.1.100' } })
      fireEvent.change(cidrInput, { target: { value: '99' } })
      fireEvent.click(calculateButton)
      
      expect(alertSpy).toHaveBeenCalledWith('無効なCIDR値です（0-32）')
      
      alertSpy.mockRestore()
    })

    test('計算エラーが発生した場合のエラーアラート', () => {
      render(<Calculator />)
      
      // サブネット計算モードに切り替え
      fireEvent.click(screen.getByText('サブネット計算'))
      
      const ipInput = screen.getByPlaceholderText('192.168.1.100')
      const cidrInput = screen.getByPlaceholderText('24')
      const calculateButton = screen.getByText('サブネット情報を計算')
      
      // alertをモック
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
      
      fireEvent.change(ipInput, { target: { value: '192.168.1.100' } })
      fireEvent.change(cidrInput, { target: { value: '-1' } })
      fireEvent.click(calculateButton)
      
      expect(alertSpy).toHaveBeenCalledWith('無効なCIDR値です（0-32）')
      
      alertSpy.mockRestore()
    })
  })

  describe('すべてクリア機能', () => {
    test('すべてクリアボタンで入力値がリセットされる', () => {
      render(<Calculator />)
      
      // 入力値を設定
      const ipInput = screen.getByPlaceholderText('192.168.1.1')
      const binaryInput = screen.getByPlaceholderText('11000000.10101000.00000001.00000001')
      
      fireEvent.change(ipInput, { target: { value: '192.168.1.1' } })
      fireEvent.change(binaryInput, { target: { value: '11000000.10101000.00000001.00000001' } })
      
      // クリアボタンをクリック
      fireEvent.click(screen.getByText('すべてクリア'))
      
      // 入力値がクリアされていることを確認
      expect(ipInput).toHaveValue('')
      expect(binaryInput).toHaveValue('')
    })
  })
})
