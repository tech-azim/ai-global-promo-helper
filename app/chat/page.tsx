'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, Input, Typography, message, Spin } from 'antd'
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  TeamOutlined,
} from '@ant-design/icons'

const { Text, Title } = Typography

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  relevantCustomers?: number
}

const SUGGESTED_QUESTIONS = [
  'Siapa customer yang suka sweet drinks?',
  'Customer mana yang cocok untuk promo oat milk?',
  'Berapa customer yang suka matcha?',
  'Rekomendasikan promo untuk pelanggan pagi hari',
]

export default function ChatPage() {
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<any>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg: ChatMessage = { role: 'user', content: msg }
    setHistory(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: history.map(h => ({ role: h.role, content: h.content })),
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: json.answer,
          relevantCustomers: json.relevantCustomers,
        },
      ])
    } catch (err: any) {
      messageApi.error(err.message ?? 'Gagal mengirim pesan')
      setHistory(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {contextHolder}
      <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ padding: '24px 0 16px', borderBottom: '1px solid #f0e6da', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #6f4e37, #a0522d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', flexShrink: 0 }}>
              <RobotOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#3d2314', fontWeight: 800 }}>Mimi AI</Title>
              <Text style={{ fontSize: 12, color: '#a07858' }}>Tanya apa saja tentang customer kamu</Text>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 12px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <Text style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Online</Text>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Empty state */}
          {history.length === 0 && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>☕</div>
              <Title level={4} style={{ color: '#3d2314', margin: '0 0 8px' }}>Halo, saya Mimi!</Title>
              <Text style={{ color: '#a07858', textAlign: 'center', display: 'block', marginBottom: 32, maxWidth: 360 }}>
                Saya bisa bantu kamu analisis data customer dan kasih rekomendasi promo yang tepat sasaran.
              </Text>

              {/* Suggested questions */}
              <div style={{ width: '100%', maxWidth: 480 }}>
                <Text style={{ fontSize: 12, color: '#a07858', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 12, textAlign: 'center' }}>
                  Coba tanya
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        background: '#fdf6ec',
                        border: '1px solid #f0e6da',
                        borderRadius: 12,
                        padding: '12px 16px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: '#5a3a28',
                        fontSize: 13,
                        fontWeight: 500,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.target as HTMLElement).style.background = '#f5ede4'
                        ;(e.target as HTMLElement).style.borderColor = '#e8d5c4'
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLElement).style.background = '#fdf6ec'
                        ;(e.target as HTMLElement).style.borderColor = '#f0e6da'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {history.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 10,
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: msg.role === 'user' ? '#e8d5c4' : 'linear-gradient(135deg, #6f4e37, #a0522d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: msg.role === 'user' ? '#6f4e37' : 'white',
                fontSize: 14,
                flexShrink: 0,
              }}>
                {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: '72%' }}>
                <div style={{
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #6f4e37, #a0522d)' : '#fff',
                  color: msg.role === 'user' ? 'white' : '#3d2314',
                  border: msg.role === 'user' ? 'none' : '1px solid #f0e6da',
                  borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                  padding: '12px 16px',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(111,78,55,0.08)' : '0 4px 12px rgba(111,78,55,0.25)',
                }}>
                  {msg.content}
                </div>

                {/* Relevant customers badge */}
                {msg.role === 'assistant' && msg.relevantCustomers !== undefined && msg.relevantCustomers > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <TeamOutlined style={{ fontSize: 11, color: '#a07858' }} />
                    <Text style={{ fontSize: 11, color: '#a07858' }}>
                      {msg.relevantCustomers} customer relevan ditemukan
                    </Text>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6f4e37, #a0522d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, flexShrink: 0 }}>
                <RobotOutlined />
              </div>
              <div style={{ background: '#fff', border: '1px solid #f0e6da', borderRadius: '4px 18px 18px 18px', padding: '14px 18px', boxShadow: '0 2px 8px rgba(111,78,55,0.08)' }}>
                <Spin size="small" />
                <Text style={{ fontSize: 13, color: '#a07858', marginLeft: 10 }}>Mimi sedang berpikir...</Text>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 0 24px', borderTop: '1px solid #f0e6da', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <Input.TextArea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya tentang customer kamu... (Enter untuk kirim)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{
                borderRadius: 14,
                borderColor: '#e8d5c4',
                fontSize: 14,
                padding: '12px 16px',
                resize: 'none',
                flex: 1,
              }}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                borderRadius: 14,
                background: input.trim() && !loading ? 'linear-gradient(135deg, #6f4e37, #a0522d)' : undefined,
                border: 'none',
                height: 46,
                width: 46,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: input.trim() && !loading ? '0 4px 12px rgba(111,78,55,0.3)' : 'none',
                flexShrink: 0,
              }}
            />
          </div>
          <Text style={{ fontSize: 11, color: '#c8a882', display: 'block', marginTop: 8, textAlign: 'center' }}>
            Shift+Enter untuk baris baru · AI menggunakan data customer real-time
          </Text>
        </div>

      </div>
    </>
  )
}