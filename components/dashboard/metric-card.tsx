import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend,
  trendValue,
  className 
}: MetricCardProps) {
  return (
    <Card className={cn('border-0 shadow-sm hover:shadow-md transition-shadow duration-300', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </div>
            {trend && trendValue && (
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={cn(
                    'font-medium',
                    trend === 'up' && 'text-status-optimal',
                    trend === 'down' && 'text-status-critical',
                    trend === 'stable' && 'text-muted-foreground'
                  )}
                >
                  {trendValue}
                </span>
                <span className="text-muted-foreground">vs last hour</span>
              </div>
            )}
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
