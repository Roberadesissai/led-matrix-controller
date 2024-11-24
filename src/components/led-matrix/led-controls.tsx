// src/components/led-matrix/led-controls.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLEDStore } from '@/lib/store/led-store';
import { debounce } from 'lodash';
import { 
  Save, 
  Upload, 
  Download, 
  Sun, 
  Trash2, 
  Play,
  Pause,
  AlertCircle,
  FileJson,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SavePatternModal } from '@/components/modals/save-pattern-modal';

interface SavedPattern {
  name: string;
  timestamp: string;
  pattern: {
    leds: number[];
    brightness: number;
  };
}

const ANIMATION_INTERVAL = 500; // ms

export function LEDControls() {
  const {
    activeLeds,
    brightness,
    isConnected,
    setBrightness,
    clearAll,
    loadPattern,
    updateAllStates
  } = useLEDStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<SavedPattern | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localBrightness, setLocalBrightness] = useState(brightness);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<NodeJS.Timeout>();
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load saved patterns from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ledPatterns');
      if (saved) {
        setSavedPatterns(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load saved patterns:', err);
    }
  }, []);

  // Handle brightness changes with debouncing
  const debouncedBrightnessChange = useCallback(
    debounce((value: number) => {
      setBrightness(value);
    }, 100),
    [setBrightness]
  );

  const handleBrightnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setLocalBrightness(value);
    debouncedBrightnessChange(value);
  };

  const handleSavePattern = (name: string) => {
    try {
      const pattern: SavedPattern = {
        name,
        timestamp: new Date().toISOString(),
        pattern: {
          leds: Array.from(activeLeds),
          brightness: localBrightness
        }
      };

      // Update state and localStorage
      const newPatterns = [...savedPatterns, pattern];
      setSavedPatterns(newPatterns);
      localStorage.setItem('ledPatterns', JSON.stringify(newPatterns));
      
      // Download the pattern
      const blob = new Blob([JSON.stringify(pattern, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setCurrentPattern(pattern);
      setIsModalOpen(false);
      toast.success('Pattern saved and downloaded!');
    } catch (err) {
      toast.error('Failed to save pattern');
      console.error(err);
    }
  };

  const handleExportPattern = () => {
    try {
      const pattern: SavedPattern = {
        name: 'Exported Pattern',
        timestamp: new Date().toISOString(),
        pattern: {
          leds: Array.from(activeLeds),
          brightness: localBrightness
        }
      };

      const blob = new Blob([JSON.stringify(pattern, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `led-pattern-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setError(null);
      toast.success('Pattern exported successfully');
    } catch (err) {
      setError('Failed to export pattern');
      toast.error('Failed to export pattern');
      console.error(err);
    }
  };

  const handleImportPattern = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const pattern = JSON.parse(e.target?.result as string) as SavedPattern;
        loadPattern(new Set(pattern.pattern.leds));
        setBrightness(pattern.pattern.brightness);
        setLocalBrightness(pattern.pattern.brightness);
        setCurrentPattern(pattern);
        setError(null);
        toast.success('Pattern imported successfully');
      } catch (err) {
        setError('Invalid pattern file');
        toast.error('Invalid pattern file');
        console.error(err);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleLoadPattern = (pattern: SavedPattern) => {
    loadPattern(new Set(pattern.pattern.leds));
    setBrightness(pattern.pattern.brightness);
    setLocalBrightness(pattern.pattern.brightness);
    setCurrentPattern(pattern);
    toast.success(`Loaded pattern: ${pattern.name}`);
  };

  const handleDeletePattern = (pattern: SavedPattern) => {
    if (confirm(`Are you sure you want to delete "${pattern.name}"?`)) {
      const newPatterns = savedPatterns.filter(p => p.timestamp !== pattern.timestamp);
      setSavedPatterns(newPatterns);
      localStorage.setItem('ledPatterns', JSON.stringify(newPatterns));
      if (currentPattern?.timestamp === pattern.timestamp) {
        setCurrentPattern(null);
      }
      toast.success('Pattern deleted');
    }
  };

  const handleClearAll = () => {
    clearAll();
    setCurrentPattern(null);
    setError(null);
    toast.success('All LEDs cleared');
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
    toast.success(isPlaying ? 'Animation stopped' : 'Animation started');
  };

  // Animation effect
  useEffect(() => {
    if (isPlaying && currentPattern) {
      animationRef.current = setInterval(() => {
        const ledStates = Object.fromEntries(
          Array.from(currentPattern.pattern.leds).map(led => [`${led}`, true])
        );
        updateAllStates(ledStates);
      }, ANIMATION_INTERVAL);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, currentPattern, updateAllStates]);

  return (
    <>
      <div className="space-y-6">
        {/* Connection Status */}
        <div className={`flex items-center gap-2 p-2 rounded-lg ${
          isConnected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Brightness Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-white">Brightness</span>
            </div>
            <span className="text-sm text-gray-400">{localBrightness}</span>
          </div>

          <div className="relative">
            <label htmlFor="brightness-control" className="sr-only">Brightness Control</label>
            <div className="absolute -top-2 left-0 right-0 h-1 bg-gradient-to-r from-gray-700 via-yellow-500 to-white rounded" />
            <input
              id="brightness-control"
              type="range"
              min="0"
              max="255"
              value={localBrightness}
              onChange={handleBrightnessChange}
              className="w-full h-2 bg-transparent appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-yellow-500
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:shadow-yellow-500/30
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:hover:scale-110
                relative z-10"
              disabled={!isConnected}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={handleClearAll}
            disabled={!isConnected}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 
              text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>

          <button
            onClick={toggleAnimation}
            disabled={!isConnected || !currentPattern}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${isPlaying 
                ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}
              disabled:opacity-50`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!isConnected}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 
              text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/10 
              text-purple-500 rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportPattern}
          className="hidden"
          aria-label="Import LED pattern file"
        />

        {/* Saved Patterns */}
        {savedPatterns.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400">Saved Patterns</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedPatterns.map((pattern) => (
                <div
                  key={pattern.timestamp}
                  className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-white">{pattern.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoadPattern(pattern)}
                      className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                      title="Load Pattern"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePattern(pattern)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                      title="Delete Pattern"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-500/10 text-red-500 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      <SavePatternModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePattern}
      />
    </>
  );
}