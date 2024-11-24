'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLEDMatrix } from "@/lib/store/led-store";
import { useState, useEffect, useRef } from "react";
import { Play, Trash2, Download, FolderOpen, Pencil, Save, Eraser, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { HexColorPicker } from "react-colorful";

interface LEDPattern {
  name: string;
  timestamp: string;
  rows: {
    rowId: number;
    columns: {
      columnId: number;
      isOn: boolean;
      color?: string;
    }[];
  }[];
}

// Helper function to convert zigzag pattern
const getZigzagIndex = (row: number, col: number): number => {
  const MATRIX_WIDTH = 20;
  return row % 2 === 0
    ? row * MATRIX_WIDTH + (MATRIX_WIDTH - 1 - col)  // Right to left
    : row * MATRIX_WIDTH + col;  // Left to right
};

const isValidPattern = (pattern: any): pattern is LEDPattern => {
  return pattern && 
    typeof pattern.name === 'string' &&
    typeof pattern.timestamp === 'string' &&
    Array.isArray(pattern.rows) &&
    pattern.rows.every((row: any) => 
      typeof row.rowId === 'number' &&
      Array.isArray(row.columns) &&
      row.columns.every((col: any) => 
        typeof col.columnId === 'number' &&
        typeof col.isOn === 'boolean'
      )
    );
};

const matrixToPattern = (activeLeds: Set<number>, ledColors: Map<number, string>): LEDPattern => {
  const rows = Array.from({ length: 8 }, (_, rowId) => ({
    rowId,
    columns: Array.from({ length: 20 }, (_, colId) => {
      const index = getZigzagIndex(rowId, colId);
      return {
        columnId: colId,
        isOn: activeLeds.has(index),
        color: ledColors.get(index)
      };
    })
  }));

  return {
    name: `Pattern ${new Date().toLocaleString()}`,
    timestamp: new Date().toISOString(),
    rows
  };
};

const patternToMatrix = (pattern: LEDPattern): Set<number> => {
  const activeLeds = new Set<number>();
  pattern.rows.forEach((row) => {
    row.columns.forEach((col) => {
      if (col.isOn) {
        const index = getZigzagIndex(row.rowId, col.columnId);
        activeLeds.add(index);
      }
    });
  });
  return activeLeds;
};

export default function PatternsPage() {
  const { loadPattern, isConnected, activeLeds, toggleLED, clearAll } = useLEDMatrix();
  const [patterns, setPatterns] = useState<LEDPattern[]>([]);
  const [drawMode, setDrawMode] = useState<'draw' | 'erase'>('draw');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [ledColors, setLedColors] = useState<Map<number, string>>(new Map());
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const savedPatterns = localStorage.getItem('led-patterns');
    if (savedPatterns) {
      try {
        const parsed = JSON.parse(savedPatterns);
        const validPatterns = Array.isArray(parsed) ? parsed.filter(isValidPattern) : [];
        setPatterns(validPatterns);
      } catch (error) {
        console.error('Error loading patterns:', error);
      }
    }
  }, []);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleMouseDown = (row: number, col: number) => {
    const index = getZigzagIndex(row, col);
    setIsDragging(true);
    if (drawMode === 'draw') {
      toggleLED(index);
      setLedColors(prev => {
        const newColors = new Map(prev);
        newColors.set(index, selectedColor);
        return newColors;
      });
    } else if (activeLeds.has(index)) {
      toggleLED(index);
      setLedColors(prev => {
        const newColors = new Map(prev);
        newColors.delete(index);
        return newColors;
      });
    }
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDragging) return;
    const index = getZigzagIndex(row, col);
    if (drawMode === 'draw') {
      toggleLED(index);
      setLedColors(prev => {
        const newColors = new Map(prev);
        newColors.set(index, selectedColor);
        return newColors;
      });
    } else if (activeLeds.has(index)) {
      toggleLED(index);
      setLedColors(prev => {
        const newColors = new Map(prev);
        newColors.delete(index);
        return newColors;
      });
    }
  };

  const handlePatternSave = () => {
    const pattern = matrixToPattern(activeLeds, ledColors);
    setPatterns(current => {
      const updated = [...current, pattern];
      localStorage.setItem('led-patterns', JSON.stringify(updated));
      return updated;
    });
    toast.success('Pattern saved successfully!');
  };

  const handlePatternImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const pattern = JSON.parse(text);
          
          if (!isValidPattern(pattern)) {
            throw new Error('Invalid pattern format');
          }

          setPatterns(current => {
            const updated = [...current, pattern];
            localStorage.setItem('led-patterns', JSON.stringify(updated));
            return updated;
          });
          loadPattern(patternToMatrix(pattern));
          toast.success('Pattern imported successfully!');
        } catch (error) {
          console.error('Error importing pattern:', error);
          toast.error('Failed to import pattern: Invalid format');
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pattern Editor</h1>
          <p className="text-muted-foreground">Create and manage LED patterns</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setDrawMode('draw')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${drawMode === 'draw' 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'}`}
          >
            <Pencil className="w-4 h-4" />
            Draw
          </button>
          <button
            onClick={() => setDrawMode('erase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${drawMode === 'erase' 
                ? 'bg-red-500 text-white' 
                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
          >
            <Eraser className="w-4 h-4" />
            Erase
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Clear All
          </button>
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                border-2 border-gray-700 hover:border-gray-600"
              style={{ backgroundColor: selectedColor }}
            >
              <span className="text-white drop-shadow-lg">Color</span>
            </button>
            {showColorPicker && (
              <div className="absolute top-full right-0 mt-2 z-50 bg-gray-800 p-2 rounded-lg shadow-xl">
                <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Drawing Canvas</CardTitle>
            <CardDescription>Click and drag to draw patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div ref={gridRef} className="bg-black/20 rounded-lg p-4">
              <div className="grid grid-cols-20 gap-0.5 aspect-[20/8]">
                {Array.from({ length: 8 }, (_, row) => (
                  Array.from({ length: 20 }, (_, col) => {
                    const index = getZigzagIndex(row, col);
                    const isActive = activeLeds.has(index);
                    const ledColor = ledColors.get(index) || selectedColor;
                    
                    return (
                      <div
                        key={`${row}-${col}`}
                        onMouseDown={() => handleMouseDown(row, col)}
                        onMouseEnter={() => handleMouseEnter(row, col)}
                        className={`
                          relative aspect-square rounded-full transition-all duration-200
                          flex items-center justify-center cursor-pointer
                          ${isActive 
                            ? '' 
                            : 'bg-gray-700 hover:bg-gray-600'}
                        `}
                        style={{
                          backgroundColor: isActive ? ledColor : undefined,
                          boxShadow: isActive ? `0 0 10px ${ledColor}` : undefined
                        }}
                      >
                        <span 
                          className={`
                            absolute inset-0 flex items-center justify-center
                            text-[10px] font-mono select-none
                            ${isActive ? 'text-white' : 'text-gray-400'}
                          `}
                        >
                          {index}
                        </span>
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={handlePatternSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2
                  bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Current
              </button>
              <button
                onClick={handlePatternImport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2
                  bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                Import
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {patterns.map((pattern) => (
                <div
                  key={pattern.timestamp}
                  className="p-4 bg-gray-800 rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{pattern.name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(pattern.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Pattern Preview */}
                  <div className="bg-black/20 rounded-lg p-2">
                    <div className="grid grid-cols-20 gap-px aspect-[20/8]">
                      {pattern.rows.flatMap(row =>
                        row.columns.map((col, colIndex) => {
                          const index = getZigzagIndex(row.rowId, colIndex);
                          const ledColor = col.color || selectedColor;
                          
                          return (
                            <div
                              key={`${row.rowId}-${colIndex}`}
                              className={`
                                relative aspect-square rounded-full transition-all duration-200
                                flex items-center justify-center
                                ${col.isOn ? '' : 'bg-gray-700'}
                              `}
                              style={{
                                backgroundColor: col.isOn ? ledColor : undefined,
                                boxShadow: col.isOn ? `0 0 10px ${ledColor}` : undefined
                              }}
                            >
                              <span 
                                className={`
                                  absolute inset-0 flex items-center justify-center
                                  text-[8px] font-mono select-none
                                  ${col.isOn ? 'text-white' : 'text-gray-400'}
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => loadPattern(patternToMatrix(pattern))}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5
                        bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 
                        transition-colors text-sm"
                    >
                      <Play className="w-3 h-3" />
                      Load
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(pattern)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${pattern.name}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5
                        bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 
                        transition-colors text-sm"
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                    <button
                      onClick={() => {
                        setPatterns(current => {
                          const updated = current.filter(p => p.timestamp !== pattern.timestamp);
                          localStorage.setItem('led-patterns', JSON.stringify(updated));
                          return updated;
                        });
                        toast.success('Pattern deleted');
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5
                        bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 
                        transition-colors text-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 