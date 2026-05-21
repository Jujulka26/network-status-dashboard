"use client"

import { useState, useEffect } from "react"

// Types for network data
export interface Device {
  id: string
  name: string
  type: "access_point" | "switch" | "router" | "server"
  status: "healthy" | "warning" | "critical" | "offline"
  floor: number
  zone: string
  uptime: string
  clients?: number
  bandwidth?: { up: number; down: number }
  cpu?: number
  memory?: number
}

export interface FloorData {
  floor: number
  name: string
  devices: Device[]
  totalClients: number
  bandwidth: { up: number; down: number }
}

export interface Alert {
  id: string
  type: "critical" | "warning" | "info"
  message: string
  device: string
  timestamp: Date
  acknowledged: boolean
}

export interface BandwidthHistory {
  time: string
  upload: number
  download: number
}

// Mock data generator
export function generateMockData() {
  const floors: FloorData[] = [
    {
      floor: 1,
      name: "Ground Floor - Reception & Lobby",
      devices: [
        { id: "ap-101", name: "AP-Reception-01", type: "access_point", status: "healthy", floor: 1, zone: "Reception", uptime: "45d 12h", clients: 23, bandwidth: { up: 45, down: 120 } },
        { id: "ap-102", name: "AP-Lobby-01", type: "access_point", status: "healthy", floor: 1, zone: "Lobby", uptime: "45d 12h", clients: 18, bandwidth: { up: 30, down: 85 } },
        { id: "sw-101", name: "SW-G-Core-01", type: "switch", status: "healthy", floor: 1, zone: "Network Closet", uptime: "120d 5h", cpu: 25, memory: 42 },
      ],
      totalClients: 41,
      bandwidth: { up: 75, down: 205 }
    },
    {
      floor: 2,
      name: "Floor 2 - Open Office & Meeting Rooms",
      devices: [
        { id: "ap-201", name: "AP-Office-A1", type: "access_point", status: "healthy", floor: 2, zone: "Office Zone A", uptime: "30d 8h", clients: 45, bandwidth: { up: 150, down: 320 } },
        { id: "ap-202", name: "AP-Office-A2", type: "access_point", status: "warning", floor: 2, zone: "Office Zone A", uptime: "30d 8h", clients: 52, bandwidth: { up: 180, down: 380 } },
        { id: "ap-203", name: "AP-Meeting-01", type: "access_point", status: "healthy", floor: 2, zone: "Meeting Rooms", uptime: "30d 8h", clients: 12, bandwidth: { up: 60, down: 140 } },
        { id: "sw-201", name: "SW-2-Core-01", type: "switch", status: "healthy", floor: 2, zone: "Network Closet", uptime: "90d 2h", cpu: 35, memory: 55 },
      ],
      totalClients: 109,
      bandwidth: { up: 390, down: 840 }
    },
    {
      floor: 3,
      name: "Floor 3 - Executive & HR",
      devices: [
        { id: "ap-301", name: "AP-Exec-01", type: "access_point", status: "healthy", floor: 3, zone: "Executive Suite", uptime: "60d 4h", clients: 15, bandwidth: { up: 80, down: 200 } },
        { id: "ap-302", name: "AP-HR-01", type: "access_point", status: "healthy", floor: 3, zone: "HR Department", uptime: "60d 4h", clients: 20, bandwidth: { up: 70, down: 150 } },
        { id: "sw-301", name: "SW-3-Core-01", type: "switch", status: "healthy", floor: 3, zone: "Network Closet", uptime: "85d 11h", cpu: 20, memory: 38 },
      ],
      totalClients: 35,
      bandwidth: { up: 150, down: 350 }
    },
    {
      floor: 4,
      name: "Floor 4 - IT & Server Room",
      devices: [
        { id: "ap-401", name: "AP-IT-01", type: "access_point", status: "healthy", floor: 4, zone: "IT Department", uptime: "15d 22h", clients: 28, bandwidth: { up: 200, down: 450 } },
        { id: "sw-401", name: "SW-4-Core-01", type: "switch", status: "healthy", floor: 4, zone: "Network Closet", uptime: "200d 8h", cpu: 45, memory: 62 },
        { id: "rt-401", name: "RT-Main-01", type: "router", status: "healthy", floor: 4, zone: "Server Room", uptime: "200d 8h", cpu: 30, memory: 48 },
        { id: "srv-401", name: "SRV-DC-01", type: "server", status: "healthy", floor: 4, zone: "Server Room", uptime: "180d 15h", cpu: 55, memory: 72 },
        { id: "srv-402", name: "SRV-App-01", type: "server", status: "warning", floor: 4, zone: "Server Room", uptime: "180d 15h", cpu: 78, memory: 85 },
        { id: "srv-403", name: "SRV-File-01", type: "server", status: "healthy", floor: 4, zone: "Server Room", uptime: "180d 15h", cpu: 40, memory: 65 },
      ],
      totalClients: 28,
      bandwidth: { up: 200, down: 450 }
    },
  ]

  const alerts: Alert[] = [
    { id: "alert-1", type: "warning", message: "High client load detected on AP-Office-A2", device: "AP-Office-A2", timestamp: new Date(Date.now() - 5 * 60000), acknowledged: false },
    { id: "alert-2", type: "warning", message: "High CPU usage on SRV-App-01 (78%)", device: "SRV-App-01", timestamp: new Date(Date.now() - 15 * 60000), acknowledged: false },
    { id: "alert-3", type: "info", message: "Scheduled maintenance window in 2 hours", device: "System", timestamp: new Date(Date.now() - 30 * 60000), acknowledged: true },
    { id: "alert-4", type: "info", message: "Firmware update available for AP devices", device: "Multiple APs", timestamp: new Date(Date.now() - 60 * 60000), acknowledged: true },
  ]

  const bandwidthHistory: BandwidthHistory[] = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    upload: Math.floor(Math.random() * 400 + 300),
    download: Math.floor(Math.random() * 1200 + 800),
  }))

  return { floors, alerts, bandwidthHistory }
}

// Hook for live data simulation
export function useNetworkData() {
  const [data, setData] = useState(() => generateMockData())
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        // Simulate small changes in the data
        const newData = { ...prev }
        newData.floors = prev.floors.map(floor => ({
          ...floor,
          devices: floor.devices.map(device => ({
            ...device,
            clients: device.clients ? Math.max(0, device.clients + Math.floor(Math.random() * 5 - 2)) : undefined,
            cpu: device.cpu ? Math.min(100, Math.max(0, device.cpu + Math.floor(Math.random() * 10 - 5))) : undefined,
            memory: device.memory ? Math.min(100, Math.max(0, device.memory + Math.floor(Math.random() * 5 - 2))) : undefined,
          }))
        }))
        return newData
      })
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return { ...data, lastUpdated }
}
