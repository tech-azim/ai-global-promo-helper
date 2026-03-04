'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Form, Input, Button, Typography, message } from 'antd'
import { CoffeeOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      messageApi.success(`Selamat datang, ${json.user.name}! ☕`)
      router.push('/dashboard')
    } catch (err: any) {
      messageApi.error(err.message ?? 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {contextHolder}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fdf6ec 0%, #f5e6d0 50%, #ede0d4 100%)',
          padding: '0 16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #6f4e37, #a0522d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(111,78,55,0.3)',
              }}
            >
              <CoffeeOutlined style={{ color: '#fff', fontSize: 28 }} />
            </div>
            <Title level={2} style={{ margin: 0, color: '#3d2314', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Kopi Kita
            </Title>
            <Text style={{ color: '#8b6147', fontSize: 13 }}>
              Smart CRM · AI Promo Helper
            </Text>
          </div>

          {/* Card */}
          <Card
            style={{
              borderRadius: 20,
              boxShadow: '0 20px 60px rgba(111,78,55,0.12)',
              border: '1px solid rgba(111,78,55,0.1)',
              background: '#fffaf6',
            }}
            styles={{ body: { padding: '32px 32px 24px' } }}
          >
            <Title level={4} style={{ margin: '0 0 4px', color: '#3d2314' }}>
              Welcome back ✨
            </Title>
            <Text style={{ color: '#8b6147', fontSize: 13, display: 'block', marginBottom: 28 }}>
              Sign in to your account
            </Text>

            <Form
              layout="vertical"
              initialValues={{ email: 'mimi@kopikita.id', password: 'kopikita123' }}
              onFinish={handleLogin}
              requiredMark={false}
            >
              <Form.Item
                label={<span style={{ color: '#3d2314', fontWeight: 600, fontSize: 13 }}>Email</span>}
                name="email"
                rules={[{ required: true, message: 'Isi email dulu!' }, { type: 'email', message: 'Format email tidak valid' }]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#a0522d' }} />}
                  placeholder="mimi@kopikita.id"
                  size="large"
                  style={{ borderRadius: 10, borderColor: '#e8d5c4' }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: '#3d2314', fontWeight: 600, fontSize: 13 }}>Password</span>}
                name="password"
                rules={[{ required: true, message: 'Isi password dulu!' }]}
                style={{ marginBottom: 24 }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#a0522d' }} />}
                  placeholder="••••••••"
                  size="large"
                  style={{ borderRadius: 10, borderColor: '#e8d5c4' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  style={{
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #6f4e37, #a0522d)',
                    border: 'none',
                    height: 46,
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: '0 4px 16px rgba(111,78,55,0.35)',
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign in ☕'}
                </Button>
              </Form.Item>
            </Form>

            {/* Demo credentials */}
            <div
              style={{
                background: 'rgba(111,78,55,0.06)',
                borderRadius: 10,
                padding: '12px 16px',
                textAlign: 'center',
              }}
            >
              <Text style={{ color: '#8b6147', fontSize: 11, display: 'block' }}>Demo Credentials</Text>
              <Text style={{ color: '#3d2314', fontWeight: 600, fontSize: 13 }}>
                mimi@kopikita.id / kopikita123
              </Text>
            </div>
          </Card>

          <Text
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: 24,
              color: '#a07858',
              fontSize: 12,
            }}
          >
            Building smarter coffee shop marketing 🚀
          </Text>
        </div>
      </div>
    </>
  )
}