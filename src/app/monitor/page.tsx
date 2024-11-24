'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLEDMatrix } from "@/lib/store/led-store";
import { useState, useEffect } from "react";
import { Activity, Wifi, Zap, Timer, Settings2 } from "lucide-react";
import { MonitorTime } from "@/components/monitor/monitor-time";

export default function MonitorPage() {
  const { activeLeds, isConnected, brightness } = useLEDMatrix();
  const [uptime, setUptime] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update lastUpdate timestamp when LEDs change
  useEffect(() => {
    setLastUpdate(new Date());
  }, [activeLeds]);

  // Helper function for correct zigzag pattern
  const getZigzagIndex = (row: number, col: number): number => {
    const MATRIX_WIDTH = 20;
    return row % 2 === 0
      ? row * MATRIX_WIDTH + (MATRIX_WIDTH - 1 - col)  // Right to left
      : row * MATRIX_WIDTH + col;  // Left to right
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Matrix Monitor</h1>
        <p className="text-muted-foreground">
          Monitor LED matrix status and performance
        </p>
      </div>

      {/* Status Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Connection Status - Updated to use WebSocket status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Wifi className={`w-4 h-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-xs text-muted-foreground">
              WebSocket Status
            </p>
          </CardContent>
        </Card>

        {/* Active LEDs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active LEDs</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeds.size}</div>
            <p className="text-xs text-muted-foreground">
              Out of 160 total LEDs
            </p>
          </CardContent>
        </Card>

        {/* Brightness Level - Updated styling */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brightness Level</CardTitle>
            <Zap className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{brightness}%</span>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-700">
                <div
                  style={{ width: `${brightness}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap 
                    text-white justify-center bg-yellow-500 transition-all duration-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uptime */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Timer className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(uptime / 3600)}h {Math.floor((uptime % 3600) / 60)}m {uptime % 60}s
            </div>
            <p className="text-xs text-muted-foreground">
              Since last restart
            </p>
          </CardContent>
        </Card>

        {/* Last Update */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Settings2 className="w-4 h-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <MonitorTime />
          </CardContent>
        </Card>

        {/* LED Matrix Preview - Updated with centered numbers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Matrix Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/20 rounded-lg p-2">
              <div className="grid grid-cols-20 gap-px aspect-[20/8]">
                {Array.from({ length: 8 }, (_, row) =>
                  Array.from({ length: 20 }, (_, col) => {
                    const index = getZigzagIndex(row, col);
                    const isActive = activeLeds.has(index);

                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`
                          relative aspect-square rounded-full transition-all duration-300
                          flex items-center justify-center
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm shadow-blue-500/50'
                            : 'bg-gray-800'
                          }
                        `}
                      >
                        <span 
                          className={`
                            absolute inset-0
                            flex items-center justify-center
                            text-[8px] font-mono select-none
                            ${isActive ? 'text-white' : 'text-gray-400'}
                          `}
                        >
                          {index}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 