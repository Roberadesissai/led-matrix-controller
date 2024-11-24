// src/components/led-matrix/led-button.tsx
interface LEDButtonProps {
    index: number;
    isActive: boolean;
    onClick: (index: number) => void;
  }
  
  export function LEDButton({ index, isActive, onClick }: LEDButtonProps) {
    return (
      <button
        onClick={() => onClick(index)}
        className={`
          aspect-square rounded-full transition-all duration-200
          ${isActive 
            ? 'bg-blue-500 shadow-lg shadow-blue-500/50 scale-105' 
            : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'
          }
        `}
        aria-label={`LED ${index}`}
      />
    );
  }
  
  