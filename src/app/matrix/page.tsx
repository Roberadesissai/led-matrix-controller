'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrightnessControl } from "@/components/controls/brightness-control";
import { LEDGrid } from "@/components/led-matrix/led-grid";
import { useLEDMatrix } from "@/lib/store/led-store";
import { SavePatternModal } from "@/components/modals/save-pattern-modal";
import { useState } from "react";
import { Download, Save, Trash2, Undo } from "lucide-react";

export default function MatrixPage() {
  const { activeLeds, isConnected, clearAll, loadPattern } = useLEDMatrix();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [history, setHistory] = useState<Set<number>[]>([new Set()]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePatternSave = (name: string) => {
    // Here you would implement the pattern saving logic
    console.log(`Saving pattern: ${name}`, Array.from(activeLeds));
    setShowSaveModal(false);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      loadPattern(history[newIndex]);
    }
  };

  const canUndo = currentIndex > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Matrix Editor</h1>
        <p className="text-muted-foreground">
          Create and edit LED patterns
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main Matrix Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LED Matrix</CardTitle>
              <CardDescription>
                Click on LEDs to toggle them {!isConnected && '(Disconnected)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LEDGrid />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={!isConnected || activeLeds.size === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 
                bg-blue-500/10 text-blue-500 rounded-lg 
                hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Pattern
            </button>

            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="flex items-center justify-center gap-2 px-4 py-2 
                bg-yellow-500/10 text-yellow-500 rounded-lg 
                hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
            >
              <Undo className="w-4 h-4" />
              Undo
            </button>

            <button
              onClick={() => {
                const pattern = new Set(activeLeds);
                const blob = new Blob(
                  [JSON.stringify(Array.from(pattern))],
                  { type: 'application/json' }
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `led-pattern-${new Date().toISOString()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              disabled={!isConnected || activeLeds.size === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 
                bg-green-500/10 text-green-500 rounded-lg 
                hover:bg-green-500/20 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={clearAll}
              disabled={!isConnected || activeLeds.size === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 
                bg-red-500/10 text-red-500 rounded-lg 
                hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brightness</CardTitle>
              <CardDescription>Adjust LED brightness</CardDescription>
            </CardHeader>
            <CardContent>
              <BrightnessControl />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matrix Info</CardTitle>
              <CardDescription>Current matrix status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Active LEDs</div>
                <div className="text-2xl font-bold">{activeLeds.size}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Connection Status</div>
                <div className={`text-2xl font-bold ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Pattern Modal */}
      <SavePatternModal 
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handlePatternSave}
      />
    </div>
  );
} 