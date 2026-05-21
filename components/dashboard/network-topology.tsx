"use client"

import { useEffect, useRef, useCallback, useState } from "react"
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
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceY,
  forceX,
  type SimulationNodeDatum,
} from "d3-force"
import { Wifi, Server, Router, HardDrive, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { FloorData } from "@/lib/network-data"
import { cn } from "@/lib/utils"

type DeviceStatus = "healthy" | "warning" | "critical" | "offline"
type DeviceType = "access_point" | "switch" | "router" | "server"

const DEVICE_ICON: Record<DeviceType, React.ElementType> = {
  access_point: Wifi,
  switch: HardDrive,
  router: Router,
  server: Server,
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
  warning:  "border-amber-400  shadow-amber-400/30",
  critical: "border-red-400    shadow-red-400/30",
  offline:  "border-slate-500  shadow-slate-500/20",
}

function DeviceNode({ data }: NodeProps) {
  const d = data as { name: string; type: DeviceType; status: DeviceStatus }
  const Icon = DEVICE_ICON[d.type] ?? Server

  return (
    <div className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none">
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} />
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm bg-white",
        STATUS_RING[d.status]
      )}>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="text-[9px] text-foreground/70 text-center leading-tight max-w-[72px]">{d.name}</span>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} />
    </div>
  )
}

const NODE_TYPES = { deviceNode: DeviceNode }

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

export function NetworkTopology({ floors }: { floors: FloorData[] }) {
  const [open, setOpen] = useState(false)
  const [homes] = useState(() => computeHomes(floors))
  const [{ nodes: initNodes, edges: initEdges }] = useState(() => buildInitialGraph(floors, homes))
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, , onEdgesChange] = useEdgesState(initEdges)

  const simRef = useRef<{ sim: ReturnType<typeof forceSimulation>; simNodes: SimNode[] } | null>(null)

  useEffect(() => {
    const simNodes: SimNode[] = initNodes.map(n => {
      const h = homes.get(n.id) ?? { x: 430, y: 250 }
      return { id: n.id, x: h.x, y: h.y, homeX: h.x, homeY: h.y }
    })

    const simLinks = initEdges.map(e => ({ source: e.source, target: e.target }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sim = forceSimulation<SimNode>(simNodes)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .force("link", (forceLink as any)(simLinks).id((d: SimNode) => d.id).distance(120).strength(0.3))
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
  }, [])

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

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Network Topology</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {open ? "Drag nodes — physics keeps edges live" : "Click to expand interactive topology"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {open && (
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                {(["healthy", "warning", "critical"] as const).map(s => (
                  <span key={s} className="flex items-center gap-1.5 capitalize">
                    <span className={cn("h-2 w-2 rounded-full inline-block border-2", STATUS_RING[s as DeviceStatus].split(" ")[0])} />
                    {s}
                  </span>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setOpen(v => !v)}>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="p-0">
          <div className="h-[500px] rounded-b-xl overflow-hidden bg-secondary/20">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDragStart={onNodeDragStart}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
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
          </div>
        </CardContent>
      )}
    </Card>
  )
}
