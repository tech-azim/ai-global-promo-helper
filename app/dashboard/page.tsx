'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Badge, Skeleton, Typography, message } from 'antd'
import {
  UserOutlined,
  UserAddOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  CopyOutlined,
  CheckOutlined,
  ReloadOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { DashboardData, DashboardStats, PromoCampaign } from '@/types'
import Link from 'next/link'

const { Title, Text } = Typography

const BAR_COLORS = ['#C8873A', '#6B4423', '#7C9A6E', '#8B6E4E', '#A0886D']

function StatCard({
  icon, label, value, sub, color = '#6f4e37',
}: {
  icon: React.ReactNode; label: string; value: number; sub: string; color?: string
}) {
  return (
    <Card style={{ borderRadius: 16, border: '1px solid #f0e6da' }} styles={{ body: { padding: 24 } }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 18, color }}>
        {icon}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#3d2314', lineHeight: 1 }}>{value}</div>
      <div style={{ fontWeight: 600, color: '#3d2314', marginTop: 4, fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#a07858', marginTop: 2 }}>{sub}</div>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card style={{ borderRadius: 16, border: '1px solid #f0e6da' }} styles={{ body: { padding: 24 } }}>
      <Skeleton.Avatar active shape="square" size={40} style={{ borderRadius: 10, marginBottom: 16 }} />
      <Skeleton active paragraph={{ rows: 2 }} title={{ width: 60 }} />
    </Card>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setStats(json.data)
    } catch {
      messageApi.error('Gagal memuat dashboard')
    } finally {
      setLoading(false)
    }
  }

  const copyMessage = async (campaign: PromoCampaign) => {
    await navigator.clipboard.writeText(campaign.message)
    setCopiedId(campaign.id)
    messageApi.success('Pesan disalin! 📲')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      {contextHolder}
      <div style={{ padding: 24, maxWidth: 1152, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#3d2314', fontWeight: 800 }}>Dashboard</Title>
            <Text style={{ color: '#a07858', fontSize: 13 }}>Selamat datang kembali, Mimi ☕ — {today}</Text>
          </div>
          <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchStats} loading={loading} style={{ borderRadius: 8, borderColor: '#e8d5c4', color: '#6f4e37' }}>
            Refresh
          </Button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {loading ? [1, 2, 3].map((i) => <StatCardSkeleton key={i} />) : (
            <>
              <StatCard icon={<UserOutlined />} label="Total Customer" value={stats?.total_customers ?? 0} sub="pelanggan terdaftar" color="#6f4e37" />
              <StatCard icon={<UserAddOutlined />} label="Customer Baru" value={stats?.new_customers_this_week ?? 0} sub="bergabung minggu ini" color="#a0522d" />
              <StatCard icon={<ThunderboltOutlined />} label="Aktif Campaign" value={stats?.this_week_campaigns?.length ?? 0} sub="promo berjalan minggu ini" color="#7C9A6E" />
            </>
          )}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

          {/* Top Interests */}
          <Card
            style={{ borderRadius: 16, border: '1px solid #f0e6da' }}
            styles={{ body: { padding: 24 } }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiseOutlined style={{ color: '#6f4e37' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#3d2314', fontSize: 15 }}>Top Interests</div>
                  <div style={{ fontWeight: 400, color: '#a07858', fontSize: 12 }}>Berdasarkan tags seluruh customer</div>
                </div>
              </div>
            }
          >
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1,2,3,4,5].map(i => <Skeleton key={i} active paragraph={{ rows: 1 }} title={{ width: '60%' }} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(stats?.top_interests ?? [])
                  .slice(0, 6)
                  .map((item: any, i: number) => {
                    const max = stats?.top_interests[0]?.count ?? 1
                    const pct = Math.round((item.count / max) * 100)
                    const color = BAR_COLORS[i % BAR_COLORS.length]
                    return (
                      <div key={item.tag}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                            <Text style={{ fontWeight: 600, fontSize: 13, color: '#3d2314', textTransform: 'capitalize' }}>{item.tag}</Text>
                          </div>
                          <Text style={{ fontSize: 12, color: '#a07858' }}>{item.count} customer</Text>
                        </div>
                        <div style={{ height: 10, borderRadius: 99, background: '#f0e6da', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: color, transition: 'width 0.7s ease' }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0e6da' }}>
              <Link href="/customers">
                <Button type="text" block icon={<ArrowRightOutlined />} style={{ color: '#6f4e37', fontWeight: 600 }}>
                  Lihat semua customer
                </Button>
              </Link>
            </div>
          </Card>

          {/* Campaign Sidebar */}
          <Card
            style={{ borderRadius: 16, border: '1px solid #f0e6da' }}
            styles={{ body: { padding: 24 } }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ThunderboltOutlined style={{ color: '#6f4e37' }} />
                  <span style={{ fontWeight: 700, color: '#3d2314', fontSize: 15 }}>Campaign Minggu Ini</span>
                </div>
                <Link href="/promo">
                  <Button type="link" size="small" style={{ color: '#6f4e37', padding: 0 }}>Semua →</Button>
                </Link>
              </div>
            }
          >
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3].map(i => <Skeleton key={i} active paragraph={{ rows: 3 }} />)}
              </div>
            ) : !stats?.this_week_campaigns.length ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: '#f5ede4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 22, color: '#6f4e37' }}>
                  <ThunderboltOutlined />
                </div>
                <Text style={{ fontWeight: 600, color: '#3d2314', display: 'block', marginBottom: 4 }}>Belum ada campaign</Text>
                <Text style={{ fontSize: 12, color: '#a07858', display: 'block', marginBottom: 16 }}>Generate promo dari data customer kamu</Text>
                <Link href="/promo">
                  <Button type="primary" size="small" icon={<ThunderboltOutlined />} style={{ borderRadius: 8, background: 'linear-gradient(135deg, #6f4e37, #a0522d)', border: 'none' }}>
                    Generate Promo
                  </Button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.this_week_campaigns.map((c: any, i: number) => (
                  <div key={c.id} style={{ padding: '14px 14px 14px 18px', borderRadius: 12, border: '1px solid #f0e6da', background: '#fdfaf7', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: BAR_COLORS[i % BAR_COLORS.length], borderRadius: '12px 0 0 12px' }} />
                    <Text style={{ fontWeight: 700, color: '#3d2314', fontSize: 13, display: 'block', marginBottom: 4 }}>{c.theme}</Text>
                    <Text style={{ fontSize: 12, color: '#8b6147', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 8 }}>
                      {c.message}
                    </Text>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {c.target_tags?.slice(0, 2).map((tag: any) => (
                          <Badge key={tag} count={tag} style={{ background: '#f5ede4', color: '#6f4e37', fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '0 8px', boxShadow: 'none', border: '1px solid #e8d5c4' }} />
                        ))}
                      </div>
                      <Button
                        size="small"
                        icon={copiedId === c.id ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                        onClick={() => copyMessage(c)}
                        style={{ borderRadius: 6, borderColor: '#e8d5c4', width: 28, height: 28, padding: 0 }}
                        title="Copy pesan"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </>
  )
}