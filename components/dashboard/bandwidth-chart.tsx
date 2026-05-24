"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { BandwidthHistory } from "@/lib/network-data"
import { useDashboardPreferences } from "./dashboard-preferences"

interface BandwidthChartProps {
  data: BandwidthHistory[]
}

const DOWNLOAD_COLOR = "oklch(0.7 0.15 175)"
const UPLOAD_COLOR = "oklch(0.65 0.18 250)"

export function BandwidthChart({ data }: BandwidthChartProps) {
  const { t } = useDashboardPreferences()

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("networkBandwidth24h")}</CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: DOWNLOAD_COLOR }} />
              <span className="text-muted-foreground">{t("download")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: UPLOAD_COLOR }} />
              <span className="text-muted-foreground">{t("upload")}</span>
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
                  <stop offset="5%" stopColor={DOWNLOAD_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={DOWNLOAD_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={UPLOAD_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={UPLOAD_COLOR} stopOpacity={0} />
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
                stroke={DOWNLOAD_COLOR} 
                fill="url(#downloadGradient)" 
                strokeWidth={2}
                name={t("download")}
              />
              <Area 
                type="monotone" 
                dataKey="upload" 
                stroke={UPLOAD_COLOR} 
                fill="url(#uploadGradient)" 
                strokeWidth={2}
                name={t("upload")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
