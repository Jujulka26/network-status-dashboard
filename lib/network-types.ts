export type NetworkStatus = 'optimal' | 'warning' | 'critical' | 'offline'

export interface NetworkZone {
  id: string
  name: string
  floor: string
  status: NetworkStatus
  latency: number
  bandwidth: number
  connections: number
  maxConnections: number
  devices: number
  uptime: number
  lastUpdated: Date
}

export interface NetworkAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  zone: string
  timestamp: Date
}

export interface NetworkMetrics {
  totalDevices: number
  activeConnections: number
  avgLatency: number
  bandwidthUsage: number
  uptime: number
}
