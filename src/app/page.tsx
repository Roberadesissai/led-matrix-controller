// src/app/page.tsx
'use client';

import { Card } from "@/components/ui/card";
import { useLEDMatrix } from "@/lib/store/led-store";
import { LEDGrid } from "@/components/led-matrix/led-grid";
import { BrightnessSlider } from "@/components/controls/brightness-slider";
import { useState, useEffect, useCallback } from "react";
import { 
  Activity, Zap, Timer, RefreshCcw, Save, Download, 
  Trash2, Undo, Sun, Laptop, Lightbulb, Wifi, Upload
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { saveAs } from 'file-saver';
import { MonitorTime } from '@/components/monitor/monitor-time';

export default function Home() {
  const { activeLeds, brightness, isConnected, clearAll, setLeds, setBrightness } = useLEDMatrix();
  const [mounted, setMounted] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      value: mounted ? `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m` : "Loading...",
      icon: Timer,
      color: "from-purple-500 to-violet-500",
      bgGlow: "purple"
    },
    {
      title: "Last Update",
      value: <MonitorTime />,
      icon: RefreshCcw,
      color: "from-blue-500 to-cyan-500",
      bgGlow: "blue"
    }
  ];

  const handleExport = useCallback(() => {
    const ledData = Array.from(activeLeds);
    const dataStr = JSON.stringify({ leds: ledData, brightness });
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, 'led-pattern.json');
  }, [activeLeds, brightness]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          // Assuming you have functions to set LEDs and brightness in your store
          setLeds(new Set(data.leds));
          setBrightness(data.brightness);
          toast.success('Pattern imported successfully!');
        } catch (err) {
          toast.error('Invalid file format');
        }
      }
    };
    input.click();
  }, []);

  const handleSave = useCallback(() => {
    // Implement save to local storage or backend
    const pattern = {
      leds: Array.from(activeLeds),
      brightness,
      timestamp: new Date().toISOString(),
    };
    // Save to localStorage or your backend
    localStorage.setItem('savedPattern', JSON.stringify(pattern));
    toast.success('Pattern saved!');
  }, [activeLeds, brightness]);

  const actionButtons = [
    {
      icon: Save,
      label: "Save Pattern",
      color: "blue",
      onClick: handleSave
    },
    {
      icon: Download,
      label: "Export",
      color: "green",
      onClick: handleExport
    },
    {
      icon: Upload,
      label: "Import",
      color: "purple",
      onClick: handleImport
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