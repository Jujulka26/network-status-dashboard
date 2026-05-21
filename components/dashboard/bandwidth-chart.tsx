"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { BandwidthHistory } from "@/lib/network-data"

interface BandwidthChartProps {
  data: BandwidthHistory[]
}

export function BandwidthChart({ data }: BandwidthChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Network Bandwidth (24h)</CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">Download</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-chart-2" />
              <span className="text-muted-foreground">Upload</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.7 0.15 175)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.7 0.15 175)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.18 250)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.18 250)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 250)" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 10 }} 
                axisLine={{ stroke: 'oklch(0.25 0.01 250)' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value} Mbps`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(0.15 0.01 250)',
                  border: '1px solid oklch(0.25 0.01 250)',
                  borderRadius: '8px',
                  color: 'oklch(0.97 0 0)'
                }}
                labelStyle={{ color: 'oklch(0.97 0 0)' }}
              />
              <Area 
                type="monotone" 
                dataKey="download" 
                stroke="oklch(0.7 0.15 175)" 
                fill="url(#downloadGradient)" 
                strokeWidth={2}
                name="Download"
              />
              <Area 
                type="monotone" 
                dataKey="upload" 
                stroke="oklch(0.65 0.18 250)" 
                fill="url(#uploadGradient)" 
                strokeWidth={2}
                name="Upload"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
