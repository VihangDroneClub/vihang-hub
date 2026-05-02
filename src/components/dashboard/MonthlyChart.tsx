'use client'

import { GlassCard } from '@/components/shared/GlassCard'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { Shimmer } from '@/components/shared/skeletons/Shimmer'
import { Activity } from 'lucide-react'

interface ChartData {
  month: string
  [key: string]: string | number
}

// Map mission colors to CSS variables
const COLORS = [
  'var(--mission-tesseract)',
  'var(--mission-avinya)',
  'var(--mission-other)',
  'var(--accent-cyan)',
  '#ec4899'
]

export function MonthlyChart({ data, missionNames }: { data: ChartData[], missionNames: string[] }) {
  return (
    <GlassCard className="col-span-1 lg:col-span-5 animate-fade-in" padding="none">
      <div className="p-6 border-b border-[var(--border-glass)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-heading text-sm font-bold tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-cyan)]" />
          Mission Telemetry
        </h3>
        
        <div className="flex flex-wrap items-center gap-4">
          {missionNames.map((name, i) => (
            <div key={name} className="flex items-center gap-1.5">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ 
                  backgroundColor: COLORS[i % COLORS.length],
                  boxShadow: `0 0 6px ${COLORS[i % COLORS.length]}`
                }} 
              />
              <span className="mono text-[10px] text-[var(--text-secondary)] uppercase tracking-tight">{name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-6 pb-2">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid 
                vertical={false} 
                stroke="var(--border-glass)" 
                strokeDasharray="3 3" 
              />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-space-mono)' }}
                dy={10}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-space-mono)' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-elevated)', 
                  borderColor: 'var(--border-glass)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)',
                  backdropFilter: 'var(--blur-glass)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ 
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase'
                }}
                labelStyle={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: 'var(--accent-cyan)'
                }}
              />
              {missionNames.map((name, index) => (
                <Bar
                  key={name}
                  dataKey={name}
                  fill={COLORS[index % COLORS.length]}
                  radius={[2, 2, 0, 0]}
                  barSize={missionNames.length > 2 ? 15 : 25}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  )
}

export function MonthlyChartSkeleton() {
  return (
    <GlassCard className="col-span-1 lg:col-span-5" padding="none">
      <div className="p-6 border-b border-[var(--border-glass)] flex items-center justify-between">
        <Shimmer className="h-5 w-40 rounded-sm" />
        <div className="flex gap-4">
          <Shimmer className="h-4 w-20 rounded-sm" />
          <Shimmer className="h-4 w-20 rounded-sm" />
        </div>
      </div>
      <div className="p-6">
        <Shimmer className="h-[350px] w-full rounded-lg" />
      </div>
    </GlassCard>
  )
}

