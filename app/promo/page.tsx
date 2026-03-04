'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Badge, Skeleton, Typography, message, Divider } from 'antd'
import {
  ThunderboltOutlined,
  ReloadOutlined,
  CopyOutlined,
  CheckOutlined,
  UserOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { PromoCampaign } from '@/types'

const { Title, Text } = Typography

export default function PromoPage() {
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => { fetchCampaigns() }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/promo')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setCampaigns(json.data ?? [])
    } catch {
      messageApi.error('Gagal memuat promo')
    } finally {
      setLoading(false)
    }
  }

  const generatePromos = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/promo', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setCampaigns(json.data ?? [])
      messageApi.success('Promo berhasil digenerate ✨')
    } catch (err: any) {
      messageApi.error(err.message ?? 'Gagal generate promo')
    } finally {
      setGenerating(false)
    }
  }

  const copyMessage = async (campaign: PromoCampaign) => {
    await navigator.clipboard.writeText(campaign.message)
    setCopiedId(campaign.id)
    messageApi.success('Pesan disalin 📲')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      {contextHolder}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#3d2314', fontWeight: 800 }}>
              Promo Ideas ✨
            </Title>
            <Text style={{ color: '#a07858', fontSize: 13 }}>
              AI generate promo berdasarkan data customer kamu.
            </Text>
          </div>
          <Button
            type="primary"
            icon={generating ? <ReloadOutlined spin /> : <ThunderboltOutlined />}
            onClick={generatePromos}
            loading={generating}
            style={{
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6f4e37, #a0522d)',
              border: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(111,78,55,0.3)',
            }}
          >
            {generating ? 'Generating...' : 'Generate Promo'}
          </Button>
        </div>

        {/* Info Banner */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            background: '#fdf6ec',
            border: '1px solid #f0e6da',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 24,
          }}
        >
          <InfoCircleOutlined style={{ color: '#a0522d', fontSize: 16, marginTop: 2 }} />
          <Text style={{ fontSize: 13, color: '#8b6147' }}>
            AI menganalisis interest tags customer lalu menghasilkan tema promo, target segmen, dan pesan siap kirim.
          </Text>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <Card key={i} style={{ borderRadius: 16, border: '1px solid #f0e6da' }} styles={{ body: { padding: 24 } }}>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <Card
            style={{ borderRadius: 16, border: '1px solid #f0e6da', textAlign: 'center' }}
            styles={{ body: { padding: '64px 24px' } }}
          >
            <div style={{ fontSize: 40, color: '#c8a882', marginBottom: 16 }}>
              <ThunderboltOutlined />
            </div>
            <Title level={4} style={{ color: '#3d2314', marginBottom: 8 }}>
              Belum ada promo minggu ini
            </Title>
            <Text style={{ color: '#a07858', display: 'block', marginBottom: 24 }}>
              Generate promo AI berdasarkan data customer kamu
            </Text>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={generatePromos}
              style={{
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6f4e37, #a0522d)',
                border: 'none',
                fontWeight: 700,
              }}
            >
              Generate Sekarang ✨
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {campaigns.map((c, i) => (
              <Card
                key={c.id}
                style={{ borderRadius: 16, border: '1px solid #f0e6da', overflow: 'hidden' }}
                styles={{ body: { padding: 0 } }}
              >
                {/* Card top accent */}
                <div style={{ height: 4, background: 'linear-gradient(90deg, #6f4e37, #a0522d, #7C9A6E)' }} />

                <div style={{ padding: 24 }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <Badge
                        count={`Tema #${i + 1}`}
                        style={{
                          background: '#f5ede4',
                          color: '#6f4e37',
                          fontWeight: 700,
                          fontSize: 11,
                          borderRadius: 6,
                          padding: '0 10px',
                          boxShadow: 'none',
                          border: '1px solid #e8d5c4',
                          marginBottom: 8,
                          display: 'block',
                          width: 'fit-content',
                        }}
                      />
                      <Title level={4} style={{ margin: 0, color: '#3d2314' }}>{c.theme}</Title>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a07858', fontSize: 13 }}>
                      <UserOutlined />
                      <span>{c.target_count} customers</span>
                    </div>
                  </div>

                  {/* Target Segmen */}
                  <div style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#a07858', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                      Target Segmen
                    </Text>
                    <Text style={{ fontSize: 13, color: '#5a3a28', display: 'block', marginBottom: 10 }}>
                      {c.segment_description}
                    </Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {c.target_tags?.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: '#f5ede4',
                            color: '#6f4e37',
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                            padding: '3px 10px',
                            border: '1px solid #e8d5c4',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Divider style={{ margin: '0 0 20px', borderColor: '#f0e6da' }} />

                  {/* Kenapa Sekarang */}
                  <div style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#a07858', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                      Kenapa Sekarang
                    </Text>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                      <BulbOutlined style={{ color: '#a0522d', fontSize: 15, marginTop: 2 }} />
                      <Text style={{ fontSize: 13, color: '#5a3a28' }}>{c.why_now}</Text>
                    </div>
                    {c.best_time && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <ClockCircleOutlined style={{ color: '#a07858', fontSize: 12 }} />
                        <Text style={{ fontSize: 12, color: '#a07858' }}>{c.best_time}</Text>
                      </div>
                    )}
                  </div>

                  <Divider style={{ margin: '0 0 20px', borderColor: '#f0e6da' }} />

                  {/* Pesan Siap Kirim */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#a07858', fontWeight: 600 }}>
                        Pesan Siap Kirim
                      </Text>
                      <Button
                        size="small"
                        icon={copiedId === c.id ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                        onClick={() => copyMessage(c)}
                        style={{
                          borderRadius: 8,
                          borderColor: copiedId === c.id ? '#b7eb8f' : '#e8d5c4',
                          background: copiedId === c.id ? '#f6ffed' : '#fff',
                          color: copiedId === c.id ? '#52c41a' : '#6f4e37',
                          fontWeight: 600,
                        }}
                      >
                        {copiedId === c.id ? 'Disalin' : 'Copy'}
                      </Button>
                    </div>
                    <div
                      style={{
                        background: '#fdf6ec',
                        border: '1px solid #f0e6da',
                        borderRadius: 10,
                        padding: '14px 16px',
                        fontSize: 13,
                        color: '#3d2314',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {c.message}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}