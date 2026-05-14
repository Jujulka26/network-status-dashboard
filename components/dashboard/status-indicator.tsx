import { cn } from '@/lib/utils'
import type { NetworkStatus } from '@/lib/network-types'

interface StatusIndicatorProps {
  status: NetworkStatus
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  optimal: {
    label: 'Optimal',
    dotClass: 'bg-status-optimal',
    bgClass: 'bg-status-optimal-bg',
    textClass: 'text-status-optimal',
  },
  warning: {
    label: 'Warning',
    dotClass: 'bg-status-warning',
    bgClass: 'bg-status-warning-bg',
    textClass: 'text-status-warning',
  },
  critical: {
    label: 'Critical',
    dotClass: 'bg-status-critical',
    bgClass: 'bg-status-critical-bg',
    textClass: 'text-status-critical',
  },
  offline: {
    label: 'Offline',
    dotClass: 'bg-status-offline',
    bgClass: 'bg-status-offline-bg',
    textClass: 'text-status-offline',
  },
}

const sizeConfig = {
  sm: { dot: 'h-1.5 w-1.5', text: 'text-xs', padding: 'px-1.5 py-0.5' },
  md: { dot: 'h-2 w-2', text: 'text-xs', padding: 'px-2 py-1' },
  lg: { dot: 'h-2.5 w-2.5', text: 'text-sm', padding: 'px-3 py-1.5' },
}

export function StatusIndicator({ status, showLabel = true, size = 'md' }: StatusIndicatorProps) {
  const config = statusConfig[status]
  const sizes = sizeConfig[size]
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
        config.bgClass,
        config.textClass,
        sizes.padding
      )}
    >
      <span
        className={cn(
          'rounded-full animate-pulse',
          config.dotClass,
          sizes.dot
        )}
      />
      {showLabel && <span className={sizes.text}>{config.label}</span>}
    </span>
  )
}
