'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button, Typography, message } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'

const { Text } = Typography

const PAGE_TITLES: Record<string, { title: string; desc: string }> = {
  '/dashboard': { title: 'Dashboard', desc: 'Ringkasan data & campaign minggu ini' },
  '/customer': { title: 'Customers', desc: 'Kelola data pelanggan kamu' },
  '/promo': { title: 'Promo Ideas ✨', desc: 'Generate promo dengan AI' },
  '/chat': { title: 'Mimi AI', desc: 'Tanya apa saja tentang customer kamu' },
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()

  const page = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? { title: 'Kopi Kita', desc: '' }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch {
      messageApi.error('Gagal logout')
    }
  }

  return (
    <>
      {contextHolder}
      <header style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'white',
        borderBottom: '1px solid #f0e6da',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div>
          <Text strong style={{ color: '#3d2314', fontSize: 16, display: 'block', lineHeight: 1.3 }}>
            {page.title}
          </Text>
          {page.desc && (
            <Text style={{ color: '#a07858', fontSize: 12 }}>{page.desc}</Text>
          )}
        </div>

        <Button
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{
            borderRadius: 8,
            borderColor: '#f0e6da',
            color: '#a07858',
            fontSize: 13,
          }}
        >
          Logout
        </Button>
      </header>
    </>
  )
}