'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Layout, Menu, Typography } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  ThunderboltOutlined,
  MessageOutlined,
} from '@ant-design/icons'

const { Sider } = Layout
const { Text } = Typography

const NAV_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/customer', icon: <UserOutlined />, label: 'Customers' },
  { key: '/promo', icon: <ThunderboltOutlined />, label: 'Promo Ideas' },
  { key: '/chat', icon: <MessageOutlined />, label: 'Mimi AI' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const activeKey = NAV_ITEMS.find(
    (item) => pathname === item.key || pathname.startsWith(item.key + '/')
  )?.key ?? '/dashboard'

  return (
    <Sider
      width={240}
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, #2c1a0e 0%, #3d2314 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #C8873A, #a0522d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            ☕
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>Kopi Kita</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>AI Promo Helper</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        style={{
          background: 'transparent',
          border: 'none',
          flex: 1,
          padding: '12px 8px',
        }}
        items={NAV_ITEMS.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: <Link href={item.key}>{item.label}</Link>,
        }))}
        theme="dark"
      />

      {/* User footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #C8873A, #a0522d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0,
          }}>
            M
          </div>
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, display: 'block', lineHeight: 1.2 }}>Mimi</Text>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>mimi@kopikita.id</Text>
          </div>
        </div>
      </div>
    </Sider>
  )
}