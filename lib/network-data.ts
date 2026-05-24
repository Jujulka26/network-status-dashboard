"use client"

import { useState, useEffect } from "react"

export interface Device {
  id: string
  name: string
  type: "access_point" | "switch" | "router" | "server"
  status: "healthy" | "warning" | "critical" | "offline"
  floor: number
  zone: string
  room: string
  rack?: string
  ipAddress: string
  macAddress: string
  model: string
  firmware: string
  uptime: string
  lastSeen: string
  clients?: number
  bandwidth?: { up: number; down: number }
  cpu?: number
  memory?: number
  temperature?: number
  location: { x: number; y: number }
  camera: {
    label: string
    image: string
    angle: string
  }
  maintenanceNotes: string
  connectedTo: string[]
}

export interface FloorData {
  floor: number
  name: string
  shortName: string
  mapLabel: string
  devices: Device[]
  totalClients: number
  bandwidth: { up: number; down: number }
}

export interface Alert {
  id: string
  type: "critical" | "warning" | "info"
  message: string
  deviceId?: string
  device: string
  timestamp: Date
  acknowledged: boolean
}

export interface BandwidthHistory {
  time: string
  upload: number
  download: number
}

export interface MaintenanceEvent {
  id: string
  deviceId: string
  title: string
  description: string
  timestamp: Date
  status: "completed" | "scheduled" | "monitoring"
}

function device(base: Device): Device {
  return base
}

export function generateMockData() {
  const floors: FloorData[] = [
    {
      floor: 1,
      name: "Floor 1 - Reception & Lobby",
      shortName: "Floor 1",
      mapLabel: "Reception, lobby, and visitor Wi-Fi coverage",
      devices: [
        device({ id: "ap-101", name: "AP-Reception-01", type: "access_point", status: "healthy", floor: 1, zone: "Reception", room: "Reception Desk", ipAddress: "10.10.1.21", macAddress: "A8:5E:45:1B:20:11", model: "UniFi U6 Pro", firmware: "6.6.55", uptime: "45d 12h", lastSeen: "20 seconds ago", clients: 23, bandwidth: { up: 45, down: 120 }, location: { x: 28, y: 44 }, camera: { label: "Lobby camera C-01", image: "/camera/lobby.png", angle: "Ceiling view facing reception counter" }, maintenanceNotes: "Clean AP enclosure during monthly lobby inspection.", connectedTo: ["sw-101"] }),
        device({ id: "ap-102", name: "AP-Lobby-01", type: "access_point", status: "warning", floor: 1, zone: "Lobby", room: "Main Lobby", ipAddress: "10.10.1.22", macAddress: "A8:5E:45:1B:20:12", model: "UniFi U6 Lite", firmware: "6.6.55", uptime: "45d 12h", lastSeen: "18 seconds ago", clients: 6, bandwidth: { up: 8, down: 18 }, location: { x: 61, y: 48 }, camera: { label: "Lobby camera C-02", image: "/camera/lobby.png", angle: "Wide lobby entrance view" }, maintenanceNotes: "Lobby AP is responding slowly after a PoE power fluctuation; check switch port and injector.", connectedTo: ["sw-101"] }),
        device({ id: "sw-101", name: "SW-F1-Core-01", type: "switch", status: "healthy", floor: 1, zone: "Network Closet", room: "F1 IT Closet", rack: "Rack F1 / U12", ipAddress: "10.10.1.2", macAddress: "04:18:D6:8A:90:01", model: "Cisco CBS350-24P", firmware: "3.3.0.16", uptime: "120d 5h", lastSeen: "12 seconds ago", cpu: 25, memory: 42, temperature: 38, location: { x: 83, y: 24 }, camera: { label: "Closet camera C-03", image: "/camera/network-closet.png", angle: "Rack front view" }, maintenanceNotes: "Spare ports available for visitor kiosk expansion.", connectedTo: ["rt-401", "ap-101", "ap-102"] }),
      ],
      totalClients: 41,
      bandwidth: { up: 75, down: 205 }
    },
    {
      floor: 2,
      name: "Floor 2 - Open Office & Meeting Rooms",
      shortName: "Floor 2",
      mapLabel: "Open office, meeting rooms, and team collaboration area",
      devices: [
        device({ id: "ap-201", name: "AP-Office-A1", type: "access_point", status: "healthy", floor: 2, zone: "Office Zone A", room: "Open Office A", ipAddress: "10.10.2.21", macAddress: "A8:5E:45:2B:20:11", model: "UniFi U6 Pro", firmware: "6.6.55", uptime: "30d 8h", lastSeen: "15 seconds ago", clients: 45, bandwidth: { up: 150, down: 320 }, location: { x: 30, y: 32 }, camera: { label: "Office camera C-11", image: "/camera/office.png", angle: "Open office east aisle" }, maintenanceNotes: "Good signal; monitor peak-hour roaming.", connectedTo: ["sw-201"] }),
        device({ id: "ap-202", name: "AP-Office-A2", type: "access_point", status: "warning", floor: 2, zone: "Office Zone A", room: "Open Office A", ipAddress: "10.10.2.22", macAddress: "A8:5E:45:2B:20:12", model: "UniFi U6 Pro", firmware: "6.6.55", uptime: "30d 8h", lastSeen: "9 seconds ago", clients: 52, bandwidth: { up: 180, down: 380 }, location: { x: 63, y: 36 }, camera: { label: "Office camera C-12", image: "/camera/office.png", angle: "Open office west aisle" }, maintenanceNotes: "High client load; consider adding one AP near hot desk zone.", connectedTo: ["sw-201"] }),
        device({ id: "ap-203", name: "AP-Meeting-01", type: "access_point", status: "healthy", floor: 2, zone: "Meeting Rooms", room: "Meeting Room Cluster", ipAddress: "10.10.2.23", macAddress: "A8:5E:45:2B:20:13", model: "UniFi U6 Lite", firmware: "6.6.55", uptime: "30d 8h", lastSeen: "21 seconds ago", clients: 12, bandwidth: { up: 60, down: 140 }, location: { x: 76, y: 70 }, camera: { label: "Meeting camera C-13", image: "/camera/meeting-room.png", angle: "Corridor outside rooms" }, maintenanceNotes: "No current issues.", connectedTo: ["sw-201"] }),
        device({ id: "sw-201", name: "SW-2-Core-01", type: "switch", status: "healthy", floor: 2, zone: "Network Closet", room: "2F IT Closet", rack: "Rack 2A / U18", ipAddress: "10.10.2.2", macAddress: "04:18:D6:8A:91:01", model: "Cisco CBS350-48P", firmware: "3.3.0.16", uptime: "90d 2h", lastSeen: "13 seconds ago", cpu: 35, memory: 55, temperature: 41, location: { x: 16, y: 73 }, camera: { label: "Closet camera C-14", image: "/camera/network-closet.png", angle: "Rack and patch panel view" }, maintenanceNotes: "PoE usage at 62%; still within budget.", connectedTo: ["rt-401", "ap-201", "ap-202", "ap-203"] }),
      ],
      totalClients: 109,
      bandwidth: { up: 390, down: 840 }
    },
    {
      floor: 3,
      name: "Floor 3 - Executive & HR",
      shortName: "Floor 3",
      mapLabel: "Executive rooms, HR department, and secure office area",
      devices: [
        device({ id: "ap-301", name: "AP-Exec-01", type: "access_point", status: "healthy", floor: 3, zone: "Executive Suite", room: "Executive Lounge", ipAddress: "10.10.3.21", macAddress: "A8:5E:45:3B:20:11", model: "UniFi U6 Enterprise", firmware: "6.6.55", uptime: "60d 4h", lastSeen: "19 seconds ago", clients: 15, bandwidth: { up: 80, down: 200 }, location: { x: 31, y: 42 }, camera: { label: "Executive camera C-21", image: "/camera/executive.png", angle: "Executive corridor view" }, maintenanceNotes: "Protected SSID is isolated and stable.", connectedTo: ["sw-301"] }),
        device({ id: "ap-302", name: "AP-HR-01", type: "access_point", status: "healthy", floor: 3, zone: "HR Department", room: "HR Office", ipAddress: "10.10.3.22", macAddress: "A8:5E:45:3B:20:12", model: "UniFi U6 Pro", firmware: "6.6.55", uptime: "60d 4h", lastSeen: "16 seconds ago", clients: 20, bandwidth: { up: 70, down: 150 }, location: { x: 67, y: 58 }, camera: { label: "HR camera C-22", image: "/camera/executive.png", angle: "HR entrance view" }, maintenanceNotes: "Keep HR VLAN monitoring enabled.", connectedTo: ["sw-301"] }),
        device({ id: "sw-301", name: "SW-3-Core-01", type: "switch", status: "critical", floor: 3, zone: "Network Closet", room: "3F IT Closet", rack: "Rack 3A / U16", ipAddress: "10.10.3.2", macAddress: "04:18:D6:8A:92:01", model: "Cisco CBS350-24P", firmware: "3.3.0.16", uptime: "85d 11h", lastSeen: "10 seconds ago", cpu: 91, memory: 86, temperature: 58, location: { x: 82, y: 26 }, camera: { label: "Closet camera C-23", image: "/camera/network-closet.png", angle: "Rack side view" }, maintenanceNotes: "Critical uplink errors detected on the 3F core switch; inspect fiber patch and failover path.", connectedTo: ["rt-401", "ap-301", "ap-302"] }),
      ],
      totalClients: 35,
      bandwidth: { up: 150, down: 350 }
    },
    {
      floor: 4,
      name: "Floor 4 - IT & Server Room",
      shortName: "Floor 4",
      mapLabel: "IT department, core router, and server room",
      devices: [
        device({ id: "ap-401", name: "AP-IT-01", type: "access_point", status: "healthy", floor: 4, zone: "IT Department", room: "IT Workbench", ipAddress: "10.10.4.21", macAddress: "A8:5E:45:4B:20:11", model: "UniFi U6 Enterprise", firmware: "6.6.55", uptime: "15d 22h", lastSeen: "14 seconds ago", clients: 28, bandwidth: { up: 200, down: 450 }, location: { x: 25, y: 32 }, camera: { label: "IT camera C-31", image: "/camera/office.png", angle: "IT workbench area" }, maintenanceNotes: "Recently replaced mounting bracket.", connectedTo: ["sw-401"] }),
        device({ id: "sw-401", name: "SW-4-Core-01", type: "switch", status: "healthy", floor: 4, zone: "Network Closet", room: "Server Room", rack: "Rack S1 / U20", ipAddress: "10.10.4.2", macAddress: "04:18:D6:8A:93:01", model: "Cisco CBS350-48P", firmware: "3.3.0.16", uptime: "200d 8h", lastSeen: "8 seconds ago", cpu: 45, memory: 62, temperature: 43, location: { x: 58, y: 47 }, camera: { label: "Server room C-32", image: "/camera/server-room.png", angle: "Core rack front view" }, maintenanceNotes: "Core switch uplinks are redundant.", connectedTo: ["rt-401", "ap-401", "srv-401", "srv-402", "srv-403"] }),
        device({ id: "rt-401", name: "RT-Main-01", type: "router", status: "healthy", floor: 4, zone: "Server Room", room: "Server Room", rack: "Rack S1 / U18", ipAddress: "10.10.0.1", macAddress: "00:1A:A0:44:80:01", model: "MikroTik CCR2004", firmware: "7.15.2", uptime: "200d 8h", lastSeen: "7 seconds ago", cpu: 30, memory: 48, temperature: 39, location: { x: 52, y: 42 }, camera: { label: "Server room C-32", image: "/camera/server-room.png", angle: "Core rack front view" }, maintenanceNotes: "WAN failover tested successfully last week.", connectedTo: ["sw-101", "sw-201", "sw-301", "sw-401"] }),
        device({ id: "srv-401", name: "SRV-DC-01", type: "server", status: "healthy", floor: 4, zone: "Server Room", room: "Server Room", rack: "Rack S2 / U08", ipAddress: "10.10.4.101", macAddress: "3C:EC:EF:91:10:01", model: "Dell PowerEdge R450", firmware: "iDRAC 7.10", uptime: "180d 15h", lastSeen: "11 seconds ago", cpu: 55, memory: 72, temperature: 44, location: { x: 70, y: 38 }, camera: { label: "Server room C-33", image: "/camera/server-room.png", angle: "Server rack S2 front view" }, maintenanceNotes: "Domain controller backups completed overnight.", connectedTo: ["sw-401"] }),
        device({ id: "srv-402", name: "SRV-App-01", type: "server", status: "warning", floor: 4, zone: "Server Room", room: "Server Room", rack: "Rack S2 / U10", ipAddress: "10.10.4.102", macAddress: "3C:EC:EF:91:10:02", model: "Dell PowerEdge R450", firmware: "iDRAC 7.10", uptime: "180d 15h", lastSeen: "6 seconds ago", cpu: 78, memory: 85, temperature: 49, location: { x: 75, y: 53 }, camera: { label: "Server room C-33", image: "/camera/server-room.png", angle: "Server rack S2 front view" }, maintenanceNotes: "CPU and memory elevated; review application worker queue.", connectedTo: ["sw-401"] }),
        device({ id: "srv-403", name: "SRV-File-01", type: "server", status: "warning", floor: 4, zone: "Server Room", room: "Server Room", rack: "Rack S2 / U12", ipAddress: "10.10.4.103", macAddress: "3C:EC:EF:91:10:03", model: "Dell PowerEdge R550", firmware: "iDRAC 7.10", uptime: "180d 15h", lastSeen: "12 seconds ago", cpu: 68, memory: 81, temperature: 47, location: { x: 80, y: 67 }, camera: { label: "Server room C-34", image: "/camera/server-room.png", angle: "Storage rack view" }, maintenanceNotes: "Storage volume is near capacity and backup jobs are running slower than normal.", connectedTo: ["sw-401"] }),
      ],
      totalClients: 28,
      bandwidth: { up: 200, down: 450 }
    },
  ]

  const alerts: Alert[] = [
    { id: "alert-1", type: "warning", message: "High client load detected on AP-Office-A2", deviceId: "ap-202", device: "AP-Office-A2", timestamp: new Date(Date.now() - 5 * 60000), acknowledged: false },
    { id: "alert-2", type: "warning", message: "High CPU usage on SRV-App-01 (78%)", deviceId: "srv-402", device: "SRV-App-01", timestamp: new Date(Date.now() - 15 * 60000), acknowledged: false },
    { id: "alert-3", type: "critical", message: "Uplink error burst on SW-3-Core-01", deviceId: "sw-301", device: "SW-3-Core-01", timestamp: new Date(Date.now() - 3 * 60000), acknowledged: false },
    { id: "alert-4", type: "warning", message: "Lobby AP throughput dropped after PoE fluctuation", deviceId: "ap-102", device: "AP-Lobby-01", timestamp: new Date(Date.now() - 8 * 60000), acknowledged: false },
    { id: "alert-5", type: "warning", message: "SRV-File-01 storage backup queue is delayed", deviceId: "srv-403", device: "SRV-File-01", timestamp: new Date(Date.now() - 18 * 60000), acknowledged: false },
    { id: "alert-6", type: "info", message: "Scheduled maintenance window in 2 hours", device: "System", timestamp: new Date(Date.now() - 30 * 60000), acknowledged: true },
    { id: "alert-7", type: "info", message: "Firmware update available for AP devices", device: "Multiple APs", timestamp: new Date(Date.now() - 60 * 60000), acknowledged: true },
  ]

  const maintenanceEvents: MaintenanceEvent[] = [
    { id: "event-1", deviceId: "srv-402", title: "Application server review", description: "CPU and memory have remained above normal range during business hours.", timestamp: new Date(Date.now() + 2 * 60 * 60000), status: "scheduled" },
    { id: "event-2", deviceId: "ap-202", title: "Capacity watch", description: "Office AP is handling peak user load; add AP if trend continues.", timestamp: new Date(Date.now() - 25 * 60000), status: "monitoring" },
    { id: "event-3", deviceId: "sw-301", title: "3F switch uplink investigation", description: "Critical uplink error burst detected; technician should inspect fiber patching and redundant path.", timestamp: new Date(Date.now() + 45 * 60000), status: "scheduled" },
    { id: "event-4", deviceId: "ap-102", title: "Lobby AP PoE check", description: "AP is degraded after a power fluctuation; verify switch port power and cable seating.", timestamp: new Date(Date.now() + 70 * 60000), status: "scheduled" },
    { id: "event-5", deviceId: "srv-403", title: "File server capacity watch", description: "Backup queue and storage usage are above normal; review cleanup policy and backup window.", timestamp: new Date(Date.now() - 12 * 60000), status: "monitoring" },
    { id: "event-6", deviceId: "rt-401", title: "WAN failover test", description: "Primary and secondary WAN failover verified successfully.", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000), status: "completed" },
  ]

  const bandwidthHistory: BandwidthHistory[] = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    upload: Math.floor(Math.random() * 400 + 300),
    download: Math.floor(Math.random() * 1200 + 800),
  }))

  return { floors, alerts, bandwidthHistory, maintenanceEvents }
}

export function useNetworkData(refreshIntervalMs = 5000) {
  const [data, setData] = useState(() => generateMockData())
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const refreshNow = () => {
    setData(generateMockData())
    setLastUpdated(new Date())
  }

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
            lastSeen: `${Math.floor(Math.random() * 25 + 5)} seconds ago`,
          }))
        }))
        return newData
      })
      setLastUpdated(new Date())
    }, refreshIntervalMs)

    return () => clearInterval(interval)
  }, [refreshIntervalMs])

  return { ...data, lastUpdated, refreshNow }
}
