'use client'

import { usePathname } from 'next/navigation'
import { Layout } from 'antd'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

const { Content } = Layout

const AUTH_ROUTES = ['/']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 240 }}>
        <Header />
        <Content style={{ background: '#fdfaf7' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}