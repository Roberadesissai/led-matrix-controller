// src/app/page.tsx
'use client';

import { Card } from "@/components/ui/card";
import { useLEDMatrix } from "@/lib/store/led-store";
import { LEDGrid } from "@/components/led-matrix/led-grid";
import { BrightnessSlider } from "@/components/controls/brightness-slider";
import { useState, useEffect } from "react";
import { 
  Activity, Zap, Timer, RefreshCcw, Save, Download, 
  Trash2, Undo, Sun, Laptop, Lightbulb, Wifi
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function Home() {
  const { activeLeds, brightness, isConnected, clearAll } = useLEDMatrix();
  const [uptime, setUptime] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Animation variants for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const statsCards = [
    {
      title: "Active LEDs",
      value: `${activeLeds.size}/160`,
      icon: Lightbulb,
      color: "from-yellow-500 to-amber-500",
      bgGlow: "yellow"
    },
    {
      title: "Matrix Status",
      value: isConnected ? "Connected" : "Offline",
      icon: Wifi,
      color: isConnected ? "from-green-500 to-emerald-500" : "from-red-500 to-rose-500",
      bgGlow: isConnected ? "green" : "red"
    },
    {
      title: "Uptime",
      value: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      icon: Timer,
      color: "from-purple-500 to-violet-500",
      bgGlow: "purple"
    },
    {
      title: "Last Update",
      value: lastUpdate.toLocaleTimeString(),
      icon: RefreshCcw,
      color: "from-blue-500 to-cyan-500",
      bgGlow: "blue"
    }
  ];

  const actionButtons = [
    {
      icon: Save,
      label: "Save Pattern",
      color: "blue",
      onClick: () => toast.success("Pattern saved!")
    },
    {
      icon: Download,
      label: "Export",
      color: "green",
      onClick: () => toast.success("Pattern exported!")
    },
    {
      icon: Undo,
      label: "Undo",
      color: "yellow",
      onClick: () => toast.error("No actions to undo")
    },
    {
      icon: Trash2,
      label: "Clear All",
      color: "red",
      onClick: clearAll
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className={`
                relative overflow-hidden backdrop-blur-lg bg-white/5 border-0
                hover:bg-white/10 transition-all duration-300
                before:absolute before:inset-0 before:w-full before:h-full 
                before:bg-gradient-to-r ${stat.color} before:opacity-0 
                before:transition-opacity hover:before:opacity-5
              `}>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg p-1.5`} />
                </div>
                <div className={`absolute -right-8 -bottom-8 w-24 h-24 blur-3xl bg-${stat.bgGlow}-500/20`} />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Brightness Control */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="backdrop-blur-lg bg-white/5 border-0">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Sun className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-medium">Brightness Control</h3>
                <span className="ml-auto text-2xl font-bold text-yellow-500">{brightness}%</span>
              </div>
              <BrightnessSlider />
            </div>
          </Card>
        </motion.div>

        {/* LED Matrix */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="backdrop-blur-lg bg-white/5 border-0 p-6">
            <LEDGrid />
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {actionButtons.map((button, index) => (
            <motion.button
              key={button.label}
              variants={itemVariants}
              onClick={button.onClick}
              disabled={!isConnected}
              className={`
                flex items-center justify-center gap-2 p-4 rounded-xl
                backdrop-blur-lg bg-${button.color}-500/10 
                hover:bg-${button.color}-500/20 
                text-${button.color}-500
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <button.icon className="w-5 h-5" />
              <span className="font-medium">{button.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}