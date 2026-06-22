"use client"

import { useEffect, useRef, useCallback, useMemo, useState } from "react"
import Image from "next/image"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceY,
  forceX,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force"
import { Camera, Wifi, Server, Router, HardDrive, ChevronDown, ChevronUp, X, Wrench } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { withBasePath } from "@/lib/site-path"
import type { Device, FloorData } from "@/lib/network-data"
import { cn } from "@/lib/utils"
import { useDashboardPreferences } from "./dashboard-preferences"
import { STATUS_ICON_TEXT } from "./device-ui"

type DeviceStatus = "healthy" | "degraded" | "down"
type DeviceType = "access_point" | "switch" | "router" | "server"

const DEVICE_ICON: Record<DeviceType, React.ElementType> = {
  access_point: Wifi,
  switch: HardDrive,
  router: Router,
  server: Server,
}

const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  access_point: "Access Point",
  switch: "Switch",
  router: "Router",
  server: "Server",
}

// Compute a clean tree layout so every node has a designated home
function computeHomes(floors: FloorData[]): Map<string, { x: number; y: number }> {
  const homes = new Map<string, { x: number; y: number }>()
  const allDevices = floors.flatMap(f => f.devices)
  const router = allDevices.find(d => d.type === "router")
  if (!router) return homes

  const W = 860
  const pad = 60

  const groups = floors
    .map(floor => ({
      sw: floor.devices.find(d => d.type === "switch"),
      leaves: floor.devices.filter(d => d.type !== "switch" && d.type !== "router"),
    }))
    .filter(g => g.sw) as { sw: { id: string }; leaves: { id: string }[] }[]

  const totalSlots = groups.reduce((s, g) => s + Math.max(1, g.leaves.length), 0)
  const slot = Math.min(130, (W - pad * 2) / totalSlots)

  let curX = pad + slot / 2
  groups.forEach(({ sw, leaves }) => {
    const count = Math.max(1, leaves.length)
    const cx = curX + (count - 1) * slot / 2
    homes.set(sw.id, { x: cx, y: 200 })
    leaves.forEach((leaf, i) => homes.set(leaf.id, { x: curX + i * slot, y: 380 }))
    curX += count * slot
  })

  homes.set(router.id, { x: W / 2, y: 50 })
  return homes
}

const STATUS_RING: Record<DeviceStatus, string> = {
  healthy:  "border-emerald-400 shadow-emerald-400/30",
  degraded: "border-amber-400  shadow-amber-400/30",
  down: "border-red-400    shadow-red-400/30",
}

function getStatusHelp(t: ReturnType<typeof useDashboardPreferences>["t"], status: DeviceStatus) {
  if (status === "healthy") return t("statusHealthyHelp")
  if (status === "degraded") return t("statusLatencyHelp")
  return t("statusDownHelp")
}

function DeviceNode({ data, selected }: NodeProps) {
  const { t } = useDashboardPreferences()
  const d = data as { name: string; type: DeviceType; status: DeviceStatus }
  const Icon = DEVICE_ICON[d.type] ?? Server

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-1 cursor-pointer active:cursor-grabbing select-none">
          <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} />
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm bg-white transition",
            STATUS_RING[d.status],
            selected && "ring-2 ring-primary ring-offset-2"
          )}>
            <Icon className={cn("h-4 w-4", STATUS_ICON_TEXT[d.status])} />
          </div>
          <span className="text-[9px] text-foreground/70 text-center leading-tight max-w-[72px]">{d.name}</span>
          <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64">
        <div className="space-y-1">
          <p className="font-medium">{d.name} • {DEVICE_TYPE_LABEL[d.type]}</p>
          <p className="text-background/80">{t(d.status)}: {getStatusHelp(t, d.status)}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

const NODE_TYPES = { deviceNode: DeviceNode }

function DetailRow({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === "") return null

  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

interface SimNode extends SimulationNodeDatum {
  id: string
  homeX: number
  homeY: number
}

function buildInitialGraph(floors: FloorData[], homes: Map<string, { x: number; y: number }>): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const allDevices = floors.flatMap(f => f.devices)
  const router = allDevices.find(d => d.type === "router")
  if (!router) return { nodes, edges }

  allDevices.forEach(device => {
    const h = homes.get(device.id) ?? { x: 430, y: 250 }
    nodes.push({
      id: device.id,
      type: "deviceNode",
      position: { x: h.x - 20, y: h.y - 20 },
      data: { name: device.name, type: device.type, status: device.status },
    })
  })

  allDevices.filter(d => d.type === "switch").forEach(sw => {
    edges.push({
      id: `e-${router.id}__${sw.id}`,
      source: router.id,
      target: sw.id,
      style: { stroke: "#64748b", strokeWidth: 1.5, strokeDasharray: "6 4" },
    })
  })

  floors.forEach(floor => {
    const sw = floor.devices.find(d => d.type === "switch")
    if (!sw) return
    floor.devices.filter(d => d.type !== "switch" && d.type !== "router").forEach(device => {
      edges.push({
        id: `e-${sw.id}__${device.id}`,
        source: sw.id,
        target: device.id,
        style: { stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 3" },
      })
    })
  })

  return { nodes, edges }
}

interface NetworkTopologyProps {
  floors: FloorData[]
  selectedDeviceId?: string | null
  onSelectDevice?: (deviceId: string) => void
}

export function NetworkTopology({ floors }: NetworkTopologyProps) {
  const { t } = useDashboardPreferences()
  const [open, setOpen] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const flowRef = useRef<ReactFlowInstance | null>(null)
  const shouldCenterRef = useRef(false)

  const centerTopology = useCallback(() => {
    shouldCenterRef.current = true

    const fit = () => {
      if (!shouldCenterRef.current || !flowRef.current) return
      flowRef.current.fitView({ padding: 0.18, duration: 500 })
      shouldCenterRef.current = false
    }

    window.setTimeout(fit, 80)
    window.setTimeout(fit, 250)
  }, [])

  useEffect(() => {
    const handler = () => {
      setOpen(true)
      centerTopology()
    }
    window.addEventListener("expand-topology", handler)
    return () => window.removeEventListener("expand-topology", handler)
  }, [centerTopology])

  const [homes] = useState(() => computeHomes(floors))
  const [{ nodes: initNodes, edges: initEdges }] = useState(() => buildInitialGraph(floors, homes))
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, , onEdgesChange] = useEdgesState(initEdges)
  const selectedDevice = useMemo<Device | undefined>(
    () => floors.flatMap(f => f.devices).find(device => device.id === selectedDeviceId),
    [floors, selectedDeviceId]
  )

  const simRef = useRef<{ sim: Simulation<SimNode, undefined>; simNodes: SimNode[] } | null>(null)

  useEffect(() => {
    const simNodes: SimNode[] = initNodes.map(n => {
      const h = homes.get(n.id) ?? { x: 430, y: 250 }
      return { id: n.id, x: h.x, y: h.y, homeX: h.x, homeY: h.y }
    })

    const simLinks = initEdges.map(e => ({ source: e.source, target: e.target }))

    const sim = forceSimulation<SimNode>(simNodes)
      .force("link", forceLink<SimNode, { source: string; target: string }>(simLinks).id((d) => d.id).distance(120).strength(0.3))
      .force("charge", forceManyBody<SimNode>().strength(-120))
      .force("collide", forceCollide<SimNode>(38))
      // Home attraction — nodes spring back after release
      .force("homeX", forceX<SimNode>().x((d: SimNode) => d.homeX).strength(0.18))
      .force("homeY", forceY<SimNode>().y((d: SimNode) => d.homeY).strength(0.18))
      .alphaDecay(0.02)
      .alphaTarget(0.01)

    sim.on("tick", () => {
      setNodes(prev =>
        prev.map(n => {
          if (n.dragging) return n
          const sn = simNodes.find(s => s.id === n.id)
          if (!sn || sn.x === undefined || sn.y === undefined) return n
          return { ...n, position: { x: sn.x - 44, y: sn.y - 40 } }
        })
      )
    })

    simRef.current = { sim, simNodes }
    return () => { sim.stop() }
  }, [homes, initEdges, initNodes, setNodes])

  const onNodeDragStart = useCallback((_: React.MouseEvent, node: Node) => {
    const r = simRef.current
    if (!r) return
    const sn = r.simNodes.find(s => s.id === node.id)
    if (sn) { sn.fx = sn.x; sn.fy = sn.y }
    r.sim.alphaTarget(0.3).restart()
  }, [])

  const onNodeDrag = useCallback((_: React.MouseEvent, node: Node) => {
    const r = simRef.current
    if (!r) return
    const sn = r.simNodes.find(s => s.id === node.id)
    if (sn) { sn.fx = node.position.x + 44; sn.fy = node.position.y + 40 }
  }, [])

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    const r = simRef.current
    if (!r) return
    const sn = r.simNodes.find(s => s.id === node.id)
    if (sn) { sn.fx = null; sn.fy = null }
    // gentle reheat so drift-back animates smoothly, then settles
    r.sim.alphaTarget(0.08).restart()
    setTimeout(() => { simRef.current?.sim.alphaTarget(0.01) }, 1800)
  }, [])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedDeviceId(node.id)
  }, [])

  const SelectedIcon = selectedDevice ? DEVICE_ICON[selectedDevice.type] ?? Server : Server
  const canTroubleshoot = selectedDevice && selectedDevice.status !== "healthy"

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Network Topology</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {open ? "Live device map" : "Click to expand interactive topology"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {open && (
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                {(["healthy", "degraded", "down"] as const).map(s => (
                  <span key={s} className="flex items-center gap-1.5 capitalize">
                    <span className={cn("h-2 w-2 rounded-full inline-block border-2", STATUS_RING[s as DeviceStatus].split(" ")[0])} />
                    {t(s)}
                  </span>
                ))}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen((current) => {
                  if (!current) centerTopology()
                  return !current
                })
              }}
            >
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="p-0">
          <div className="relative h-[500px] rounded-b-xl overflow-hidden bg-secondary/20">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedDeviceId(null)}
              onNodeDragStart={onNodeDragStart}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
              onInit={(instance) => {
                flowRef.current = instance
                if (shouldCenterRef.current) centerTopology()
              }}
              nodeTypes={NODE_TYPES}
              nodesConnectable={false}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.3}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1.25} color="#94a3b8" />
            </ReactFlow>

            {selectedDevice && (
              <div className="absolute right-3 top-3 z-10 w-[260px] max-w-[calc(100%-1.5rem)] rounded-lg border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                      STATUS_RING[selectedDevice.status]
                    )}>
                      <SelectedIcon className={cn("h-4 w-4", STATUS_ICON_TEXT[selectedDevice.status])} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{selectedDevice.name}</h3>
                      <p className="text-xs text-muted-foreground">{DEVICE_TYPE_LABEL[selectedDevice.type]}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => setSelectedDeviceId(null)}
                    aria-label="Close device details"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-3">
                  <span className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                    selectedDevice.status === "healthy" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                    selectedDevice.status === "degraded" && "border-amber-200 bg-amber-50 text-amber-700",
                    selectedDevice.status === "down" && "border-red-200 bg-red-50 text-red-700"
                  )}>
                    {t(selectedDevice.status)}
                  </span>
                </div>

                <div className="mb-3 overflow-hidden rounded-md border border-border bg-secondary/30">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{selectedDevice.camera.label}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{selectedDevice.camera.angle}</p>
                    </div>
                  </div>
                  <div className="relative aspect-video bg-secondary">
                    <Image
                      src={selectedDevice.camera.image}
                      alt={`${selectedDevice.camera.label} preview`}
                      fill
                      sizes="260px"
                      className="object-cover opacity-80"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <DetailRow label="Floor" value={selectedDevice.floor} />
                  <DetailRow label="Zone" value={selectedDevice.zone} />
                  <DetailRow label="Uptime" value={selectedDevice.uptime} />
                  <DetailRow label="Clients" value={selectedDevice.clients} />
                  <DetailRow label="Upload" value={selectedDevice.bandwidth ? `${selectedDevice.bandwidth.up} Mbps` : undefined} />
                  <DetailRow label="Download" value={selectedDevice.bandwidth ? `${selectedDevice.bandwidth.down} Mbps` : undefined} />
                  <DetailRow label="CPU" value={selectedDevice.cpu !== undefined ? `${selectedDevice.cpu}%` : undefined} />
                  <DetailRow label="Memory" value={selectedDevice.memory !== undefined ? `${selectedDevice.memory}%` : undefined} />
                </div>

                {canTroubleshoot && (
                  <Button
                    className="mt-4 w-full"
                    size="sm"
                    onClick={() => window.location.assign(withBasePath(`/remote-control?device=${encodeURIComponent(selectedDevice.id)}`))}
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    {t("troubleshooting")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
