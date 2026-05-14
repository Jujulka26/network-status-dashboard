"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  NetworkZone,
  NetworkAlert,
  NetworkMetrics,
  NetworkStatus,
} from "@/lib/network-types";

// Fixed timestamp offset to prevent hydration mismatch
const MODULE_LOAD_TIME = new Date();

const zoneNames = [
  { id: "zone-1", name: "Main Lobby", floor: "Floor 1" },
  { id: "zone-2", name: "Conference Center", floor: "Floor 2" },
  { id: "zone-3", name: "Executive Suite", floor: "Floor 5" },
  { id: "zone-4", name: "Data Center", floor: "Basement" },
  { id: "zone-5", name: "Server Room", floor: "Floor 4" },
];

const alertMessages = [
  { title: "High Latency Detected", type: "warning" as const },
  { title: "Connection Spike", type: "warning" as const },
  { title: "Bandwidth Threshold Exceeded", type: "critical" as const },
  { title: "Device Offline", type: "critical" as const },
  { title: "Network Restored", type: "info" as const },
  { title: "Routine Maintenance", type: "info" as const },
  { title: "Packet Loss Warning", type: "warning" as const },
  { title: "Security Scan Complete", type: "info" as const },
];

// Static initial data to prevent hydration mismatch
const initialZones: NetworkZone[] = [
  {
    id: "zone-1",
    name: "Main Lobby",
    floor: "Floor 1",
    latency: 24,
    bandwidth: 45,
    connections: 38,
    maxConnections: 100,
    devices: 42,
    status: "optimal",
    uptime: 99.8,
    lastUpdated: new Date(),
  },
  {
    id: "zone-2",
    name: "Conference Center",
    floor: "Floor 2",
    latency: 32,
    bandwidth: 62,
    connections: 85,
    maxConnections: 150,
    devices: 67,
    status: "optimal",
    uptime: 99.5,
    lastUpdated: new Date(),
  },
  {
    id: "zone-3",
    name: "Executive Suite",
    floor: "Floor 5",
    latency: 18,
    bandwidth: 38,
    connections: 22,
    maxConnections: 50,
    devices: 28,
    status: "optimal",
    uptime: 99.9,
    lastUpdated: new Date(),
  },
  {
    id: "zone-4",
    name: "Data Center",
    floor: "Basement",
    latency: 8,
    bandwidth: 78,
    connections: 142,
    maxConnections: 200,
    devices: 156,
    status: "warning",
    uptime: 99.99,
    lastUpdated: new Date(),
  },
  {
    id: "zone-5",
    name: "Server Room",
    floor: "Floor 4",
    latency: 12,
    bandwidth: 55,
    connections: 48,
    maxConnections: 80,
    devices: 54,
    status: "optimal",
    uptime: 99.7,
    lastUpdated: new Date(),
  },
];

const initialAlerts: NetworkAlert[] = [
  {
    id: "alert-1",
    title: "High Latency Detected",
    type: "warning",
    message: "High Latency Detected in Data Center",
    zone: "Data Center",
    timestamp: new Date(MODULE_LOAD_TIME.getTime() - 120000),
  },
  {
    id: "alert-2",
    title: "Security Scan Complete",
    type: "info",
    message: "Security Scan Complete in Server Room",
    zone: "Server Room",
    timestamp: new Date(MODULE_LOAD_TIME.getTime() - 300000),
  },
  {
    id: "alert-3",
    title: "Network Restored",
    type: "info",
    message: "Network Restored in Main Lobby",
    zone: "Main Lobby",
    timestamp: new Date(MODULE_LOAD_TIME.getTime() - 600000),
  },
];

function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fluctuateValue(
  current: number,
  min: number,
  max: number,
  variance: number
): number {
  const change = (Math.random() - 0.5) * variance * 2;
  const newValue = current + change;
  return Math.max(min, Math.min(max, newValue));
}

function determineStatus(
  latency: number,
  bandwidth: number,
  connections: number,
  maxConnections: number
): NetworkStatus {
  const connectionRatio = connections / maxConnections;

  if (latency > 150 || connectionRatio > 0.95) return "critical";
  if (latency > 80 || connectionRatio > 0.8 || bandwidth > 85) return "warning";
  if (Math.random() < 0.02) return "offline";
  return "optimal";
}

export function useNetworkData() {
  const [zones, setZones] = useState<NetworkZone[]>(initialZones);
  const [alerts, setAlerts] = useState<NetworkAlert[]>(initialAlerts);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    totalDevices: 347,
    activeConnections: 335,
    avgLatency: 19,
    bandwidthUsage: 56,
    uptime: 99.97,
  });
  const [isClient, setIsClient] = useState(false);

  // Only start fluctuating after client hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateZones = useCallback(() => {
    setZones((prevZones) =>
      prevZones.map((zone) => {
        const latency = Math.round(fluctuateValue(zone.latency, 5, 180, 15));
        const bandwidth = Math.round(fluctuateValue(zone.bandwidth, 10, 95, 8));
        const connections = Math.round(
          fluctuateValue(zone.connections, 5, zone.maxConnections, 10)
        );

        return {
          ...zone,
          latency,
          bandwidth,
          connections,
          status: determineStatus(
            latency,
            bandwidth,
            connections,
            zone.maxConnections
          ),
          uptime: Math.max(
            90,
            Math.min(100, zone.uptime + (Math.random() - 0.5) * 0.5)
          ),
          lastUpdated: new Date(),
        };
      })
    );
  }, []);

  const updateMetrics = useCallback(() => {
    setMetrics((prev) => ({
      totalDevices: Math.round(fluctuateValue(prev.totalDevices, 300, 400, 10)),
      activeConnections: Math.round(
        fluctuateValue(prev.activeConnections, 280, 380, 15)
      ),
      avgLatency: Math.round(fluctuateValue(prev.avgLatency, 10, 40, 5)),
      bandwidthUsage: Math.round(
        fluctuateValue(prev.bandwidthUsage, 40, 80, 5)
      ),
      uptime: Math.max(
        99.9,
        Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.02)
      ),
    }));
  }, []);

  const addAlert = useCallback(() => {
    if (Math.random() > 0.3) return;

    const alertTemplate =
      alertMessages[Math.floor(Math.random() * alertMessages.length)];
    const zone = zoneNames[Math.floor(Math.random() * zoneNames.length)];

    const newAlert: NetworkAlert = {
      id: `alert-${Date.now()}`,
      ...alertTemplate,
      message: `${alertTemplate.title} in ${zone.name}`,
      zone: zone.name,
      timestamp: new Date(),
    };

    setAlerts((prev) => [newAlert, ...prev].slice(0, 8));
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const zoneInterval = setInterval(updateZones, 6000);
    const metricsInterval = setInterval(updateMetrics, 5000);
    const alertInterval = setInterval(addAlert, 12000);

    return () => {
      clearInterval(zoneInterval);
      clearInterval(metricsInterval);
      clearInterval(alertInterval);
    };
  }, [isClient, updateZones, updateMetrics, addAlert]);

  return { zones, alerts, metrics };
}
