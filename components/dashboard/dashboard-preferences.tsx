"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useTheme } from "next-themes"

export type DashboardLanguage = "en" | "zh" | "ms"
export type DashboardTheme = "light" | "dark" | "system"

const TRANSLATIONS = {
  en: {
    appName: "NetWatch",
    appSubtitle: "Building Network Monitor",
    live: "Live",
    updated: "Updated",
    refreshData: "Refresh data",
    helpDocumentation: "Help & Documentation",
    settings: "Settings",
    sections: "Sections",
    overview: "Overview",
    bandwidthAlerts: "Bandwidth & Alerts",
    networkTopology: "Network Topology",
    floorByFloor: "Floor-by-Floor",
    locations: "Locations",
    events: "Events",
    remoteControl: "Remote Control",
    device: "Device",
    remoteHome: "Remote Home",
    terminal: "Terminal",
    connected: "Connected",
    sendCommand: "Send command",
    commandPlaceholder: "Type a command, for example: ping gateway",
    totalDevices: "Total Devices",
    connectedClients: "Connected Clients",
    bandwidthUsage: "Bandwidth Usage",
    networkHealth: "Network Health",
    healthy: "Healthy",
    warning: "Down",
    critical: "Critical",
    offline: "Offline",
    operational: "Operational",
    issuesDetected: "Issues Detected",
    allSystemsNormal: "All systems normal",
    acrossAllFloors: "Across all floors",
    recentAlerts: "Recent Alerts",
    unread: "unread",
    ack: "Ack",
    noAlerts: "No alerts at this time",
    download: "Download",
    upload: "Upload",
    networkBandwidth24h: "Network Bandwidth (24h)",
    clickToExpandTopology: "Click to expand interactive topology",
    dragNodes: "Drag nodes or click any node for live details",
    selectedDevice: "Selected Device",
    deviceDetails: "Device Details",
    cameraPreview: "Camera Preview",
    location: "Location",
    metrics: "Metrics",
    connectedDevices: "Connected Devices",
    maintenanceNotes: "Maintenance Notes",
    floorLocation: "Floor Location",
    floorplanCamera: "Floorplan & Camera Preview",
    devicesMonitored: "devices monitored",
    floorsMonitored: "floors monitored",
    searchDevices: "Search devices, IP, zone, or rack",
    allStatuses: "All statuses",
    allTypes: "All types",
    accessPoint: "Access point",
    switch: "Switch",
    router: "Router",
    server: "Server",
    noDevicesMatch: "No devices match the current filters.",
    recentEvents: "Maintenance & Recent Events",
    language: "Language",
    theme: "Theme",
    refreshInterval: "Refresh interval",
    compactView: "Compact view",
    light: "Light",
    dark: "Dark",
    system: "System",
    seconds: "seconds",
    saveBehavior: "Preferences are saved on this browser.",
    dashboardOverview: "Dashboard Overview",
    topologyGuide: "Topology Guide",
    alertMeanings: "Alert Meanings",
    deviceStatus: "Device Status",
    troubleshooting: "Troubleshooting",
    faq: "FAQ",
    helpOverviewBody: "Use the top cards to read total devices, active clients, bandwidth, and overall health. The chart shows 24-hour traffic trends and the alert panel lists recent network events.",
    helpTopologyBody: "Open the topology section and click any router, switch, access point, or server. The detail panel shows metrics, physical location, camera preview, and connected devices.",
    helpAlertsBody: "Down means the device is degraded or not operating normally. Critical means service risk is high. Info is a maintenance or advisory message. Acknowledge alerts after checking them.",
    helpStatusBody: "Healthy devices are operating normally, down devices have elevated usage, load, or link issues, critical devices need urgent action, and offline devices are not responding.",
    helpTroubleshootingBody: "Start from alerts, open the affected device, verify its IP/rack/floor, then inspect connected devices in the topology. Use the camera preview to confirm the physical location.",
    helpFaqBody: "This demo uses realistic mock data, simulated live updates, and generated camera preview photos for assignment demonstration. The previews are not live CCTV streams.",
  },
  zh: {
    appName: "NetWatch",
    appSubtitle: "建筑网络监控",
    live: "实时",
    updated: "更新",
    refreshData: "刷新数据",
    helpDocumentation: "帮助与文档",
    settings: "设置",
    sections: "区块",
    overview: "总览",
    bandwidthAlerts: "流量与警报",
    networkTopology: "网络拓扑",
    floorByFloor: "楼层状态",
    locations: "位置",
    events: "事件",
    remoteControl: "远程控制",
    device: "设备",
    remoteHome: "远程主页",
    terminal: "终端",
    connected: "已连接",
    sendCommand: "发送命令",
    commandPlaceholder: "输入命令，例如：ping gateway",
    totalDevices: "设备总数",
    connectedClients: "连接用户",
    bandwidthUsage: "带宽使用",
    networkHealth: "网络健康",
    healthy: "正常",
    warning: "故障",
    critical: "严重",
    offline: "离线",
    operational: "运行正常",
    issuesDetected: "发现问题",
    allSystemsNormal: "所有系统正常",
    acrossAllFloors: "所有楼层",
    recentAlerts: "最近警报",
    unread: "未读",
    ack: "确认",
    noAlerts: "目前没有警报",
    download: "下载",
    upload: "上传",
    networkBandwidth24h: "网络带宽（24小时）",
    clickToExpandTopology: "点击展开互动拓扑",
    dragNodes: "拖动节点，或点击节点查看实时详情",
    selectedDevice: "已选设备",
    deviceDetails: "设备详情",
    cameraPreview: "摄像头预览",
    location: "位置",
    metrics: "指标",
    connectedDevices: "连接设备",
    maintenanceNotes: "维护备注",
    floorLocation: "楼层位置",
    floorplanCamera: "楼层平面图与摄像头预览",
    devicesMonitored: "台设备监控中",
    floorsMonitored: "层楼监控中",
    searchDevices: "搜索设备、IP、区域或机柜",
    allStatuses: "所有状态",
    allTypes: "所有类型",
    accessPoint: "无线 AP",
    switch: "交换机",
    router: "路由器",
    server: "服务器",
    noDevicesMatch: "没有设备符合当前筛选。",
    recentEvents: "维护与近期事件",
    language: "语言",
    theme: "主题",
    refreshInterval: "刷新间隔",
    compactView: "紧凑视图",
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
    seconds: "秒",
    saveBehavior: "偏好设置会保存在此浏览器。",
    dashboardOverview: "仪表盘总览",
    topologyGuide: "拓扑指南",
    alertMeanings: "警报含义",
    deviceStatus: "设备状态",
    troubleshooting: "故障排查",
    faq: "常见问题",
    helpOverviewBody: "顶部卡片显示设备总数、活跃用户、带宽和整体健康状态。图表显示 24 小时流量趋势，警报面板列出近期网络事件。",
    helpTopologyBody: "展开拓扑后，点击任何路由器、交换机、AP 或服务器。详情面板会显示指标、物理位置、摄像头预览和连接设备。",
    helpAlertsBody: "故障代表设备降级或运行不正常；严重代表服务风险较高；信息是维护或提示消息。检查后可确认警报。",
    helpStatusBody: "正常表示设备运行稳定；故障表示使用率、负载或链路异常；严重表示需要立即处理；离线表示设备无响应。",
    helpTroubleshootingBody: "先从警报开始，打开受影响设备，确认 IP、机柜和楼层，再在拓扑里检查连接设备。摄像头预览用于确认物理位置。",
    helpFaqBody: "这个 demo 使用真实感 mock 数据、模拟实时刷新和生成的摄像头预览照片，用于作业展示。预览不是真实 CCTV 直播。",
  },
  ms: {
    appName: "NetWatch",
    appSubtitle: "Pemantau Rangkaian Bangunan",
    live: "Langsung",
    updated: "Dikemas kini",
    refreshData: "Segar semula data",
    helpDocumentation: "Bantuan & Dokumentasi",
    settings: "Tetapan",
    sections: "Bahagian",
    overview: "Ringkasan",
    bandwidthAlerts: "Bandwidth & Amaran",
    networkTopology: "Topologi Rangkaian",
    floorByFloor: "Status Mengikut Tingkat",
    locations: "Lokasi",
    events: "Peristiwa",
    remoteControl: "Kawalan Jauh",
    device: "Peranti",
    remoteHome: "Laman Jauh",
    terminal: "Terminal",
    connected: "Bersambung",
    sendCommand: "Hantar arahan",
    commandPlaceholder: "Taip arahan, contoh: ping gateway",
    totalDevices: "Jumlah Peranti",
    connectedClients: "Klien Bersambung",
    bandwidthUsage: "Penggunaan Bandwidth",
    networkHealth: "Kesihatan Rangkaian",
    healthy: "Sihat",
    warning: "Terganggu",
    critical: "Kritikal",
    offline: "Luar talian",
    operational: "Beroperasi",
    issuesDetected: "Isu Dikesan",
    allSystemsNormal: "Semua sistem normal",
    acrossAllFloors: "Di semua tingkat",
    recentAlerts: "Amaran Terkini",
    unread: "belum dibaca",
    ack: "Sah",
    noAlerts: "Tiada amaran buat masa ini",
    download: "Muat turun",
    upload: "Muat naik",
    networkBandwidth24h: "Bandwidth Rangkaian (24j)",
    clickToExpandTopology: "Klik untuk buka topologi interaktif",
    dragNodes: "Seret nod atau klik nod untuk butiran langsung",
    selectedDevice: "Peranti Dipilih",
    deviceDetails: "Butiran Peranti",
    cameraPreview: "Pratonton Kamera",
    location: "Lokasi",
    metrics: "Metrik",
    connectedDevices: "Peranti Bersambung",
    maintenanceNotes: "Nota Penyelenggaraan",
    floorLocation: "Lokasi Tingkat",
    floorplanCamera: "Pelan Tingkat & Pratonton Kamera",
    devicesMonitored: "peranti dipantau",
    floorsMonitored: "tingkat dipantau",
    searchDevices: "Cari peranti, IP, zon, atau rak",
    allStatuses: "Semua status",
    allTypes: "Semua jenis",
    accessPoint: "Access point",
    switch: "Switch",
    router: "Router",
    server: "Server",
    noDevicesMatch: "Tiada peranti sepadan dengan penapis semasa.",
    recentEvents: "Penyelenggaraan & Peristiwa Terkini",
    language: "Bahasa",
    theme: "Tema",
    refreshInterval: "Selang segar semula",
    compactView: "Paparan padat",
    light: "Cerah",
    dark: "Gelap",
    system: "Sistem",
    seconds: "saat",
    saveBehavior: "Tetapan disimpan dalam pelayar ini.",
    dashboardOverview: "Ringkasan Dashboard",
    topologyGuide: "Panduan Topologi",
    alertMeanings: "Maksud Amaran",
    deviceStatus: "Status Peranti",
    troubleshooting: "Penyelesaian Masalah",
    faq: "FAQ",
    helpOverviewBody: "Kad di atas menunjukkan jumlah peranti, klien aktif, bandwidth, dan kesihatan keseluruhan. Carta menunjukkan trend trafik 24 jam dan panel amaran menyenaraikan peristiwa rangkaian.",
    helpTopologyBody: "Buka bahagian topologi dan klik mana-mana router, switch, access point, atau server. Panel butiran menunjukkan metrik, lokasi fizikal, pratonton kamera, dan sambungan.",
    helpAlertsBody: "Terganggu bermaksud peranti merosot atau tidak beroperasi secara normal. Kritikal bermaksud risiko servis tinggi. Info ialah mesej penyelenggaraan atau makluman. Sahkan selepas semakan.",
    helpStatusBody: "Sihat bermaksud peranti normal, terganggu bermaksud penggunaan, beban, atau pautan bermasalah, kritikal perlu tindakan segera, dan luar talian bermaksud peranti tidak memberi respons.",
    helpTroubleshootingBody: "Mula daripada amaran, buka peranti terlibat, semak IP/rak/tingkat, kemudian periksa peranti bersambung dalam topologi. Guna pratonton kamera untuk sahkan lokasi fizikal.",
    helpFaqBody: "Demo ini menggunakan data mock realistik, kemas kini simulasi, dan foto pratonton kamera yang dijana untuk demonstrasi tugasan. Pratonton ini bukan siaran CCTV langsung.",
  },
} as const

type TranslationKey = keyof typeof TRANSLATIONS.en

interface DashboardPreferencesContextValue {
  language: DashboardLanguage
  setLanguage: (language: DashboardLanguage) => void
  theme: DashboardTheme
  setThemePreference: (theme: DashboardTheme) => void
  refreshInterval: number
  setRefreshInterval: (seconds: number) => void
  compactView: boolean
  setCompactView: (compactView: boolean) => void
  t: (key: TranslationKey) => string
}

const DashboardPreferencesContext = createContext<DashboardPreferencesContextValue | null>(null)

export function DashboardPreferencesProvider({ children }: { children: ReactNode }) {
  const { theme = "system", setTheme } = useTheme()
  const [language, setLanguageState] = useState<DashboardLanguage>("en")
  const [refreshInterval, setRefreshIntervalState] = useState(5)
  const [compactView, setCompactViewState] = useState(false)

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("netwatch-language") as DashboardLanguage | null
    const savedRefresh = Number(window.localStorage.getItem("netwatch-refresh-interval"))
    const savedCompact = window.localStorage.getItem("netwatch-compact-view")

    if (savedLanguage && savedLanguage in TRANSLATIONS) setLanguageState(savedLanguage)
    if ([5, 10, 30].includes(savedRefresh)) setRefreshIntervalState(savedRefresh)
    if (savedCompact) setCompactViewState(savedCompact === "true")
  }, [])

  const value = useMemo<DashboardPreferencesContextValue>(() => {
    const setLanguage = (nextLanguage: DashboardLanguage) => {
      setLanguageState(nextLanguage)
      window.localStorage.setItem("netwatch-language", nextLanguage)
    }

    const setRefreshInterval = (seconds: number) => {
      setRefreshIntervalState(seconds)
      window.localStorage.setItem("netwatch-refresh-interval", String(seconds))
    }

    const setCompactView = (nextCompactView: boolean) => {
      setCompactViewState(nextCompactView)
      window.localStorage.setItem("netwatch-compact-view", String(nextCompactView))
    }

    const setThemePreference = (nextTheme: DashboardTheme) => {
      setTheme(nextTheme)
    }

    return {
      language,
      setLanguage,
      theme: theme as DashboardTheme,
      setThemePreference,
      refreshInterval,
      setRefreshInterval,
      compactView,
      setCompactView,
      t: (key) => TRANSLATIONS[language][key] ?? TRANSLATIONS.en[key],
    }
  }, [compactView, language, refreshInterval, setTheme, theme])

  return (
    <DashboardPreferencesContext.Provider value={value}>
      {children}
    </DashboardPreferencesContext.Provider>
  )
}

export function useDashboardPreferences() {
  const context = useContext(DashboardPreferencesContext)
  if (!context) {
    throw new Error("useDashboardPreferences must be used within DashboardPreferencesProvider")
  }
  return context
}
