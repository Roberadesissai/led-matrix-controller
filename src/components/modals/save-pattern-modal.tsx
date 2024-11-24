// src/components/modals/save-pattern-modal.tsx
import { useState } from 'react';

interface SavePatternModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
  }
  
  export function SavePatternModal({ isOpen, onClose, onSave }: SavePatternModalProps) {
    const [patternName, setPatternName] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (patternName.trim()) {
        onSave(patternName.trim());
        setPatternName('');
        onClose();
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md m-4 shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Save Pattern</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pattern Name
              </label>
              <input
                type="text"
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                  text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter pattern name..."
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 
                  transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                  transition-colors"
              >
                Save Pattern
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }