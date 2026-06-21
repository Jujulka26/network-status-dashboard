"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { BandwidthHistory } from "@/lib/network-data"
import { useDashboardPreferences } from "./dashboard-preferences"

interface BandwidthChartProps {
  data: BandwidthHistory[]
}

const DOWNLOAD_COLOR = "oklch(0.7 0.15 175)"
const UPLOAD_COLOR = "oklch(0.65 0.18 250)"

export function BandwidthChart({ data }: BandwidthChartProps) {
  const { t } = useDashboardPreferences()
  const maxBandwidth = Math.max(
    1000,
    Math.ceil(Math.max(...data.flatMap((point) => [point.download, point.upload]), 0) / 250) * 250
  )

  return (
    <Card className="h-full bg-card border-border">
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
      <CardContent className="pt-2">
        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 18, left: 4, bottom: 8 }}>
              <defs>
                <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DOWNLOAD_COLOR} stopOpacity={0.32} />
                  <stop offset="95%" stopColor={DOWNLOAD_COLOR} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={UPLOAD_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={UPLOAD_COLOR} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 250 / 0.4)" vertical={false} />
              <XAxis
                dataKey="time"
                interval="preserveStartEnd"
                minTickGap={28}
                tick={{ fill: "oklch(0.55 0 0)", fontSize: 11 }}
                axisLine={{ stroke: "oklch(0.25 0.01 250 / 0.55)" }}
                tickLine={false}
              />
              <YAxis
                width={74}
                domain={[0, maxBandwidth]}
                tickCount={8}
                allowDecimals={false}
                tick={{ fill: "oklch(0.55 0 0)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value} Mbps`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.15 0.01 250)",
                  border: "1px solid oklch(0.25 0.01 250)",
                  borderRadius: "8px",
                  color: "oklch(0.97 0 0)",
                }}
                labelStyle={{ color: "oklch(0.97 0 0)" }}
              />
              <Area
                type="monotone"
                dataKey="download"
                stroke={DOWNLOAD_COLOR}
                fill="url(#downloadGradient)"
                strokeWidth={3}
                name={t("download")}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="upload"
                stroke={UPLOAD_COLOR}
                fill="url(#uploadGradient)"
                strokeWidth={3}
                name={t("upload")}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
