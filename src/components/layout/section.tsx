// src/components/layout/section.tsx
interface SectionProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
  }
  
  export function Section({ title, description, children }: SectionProps) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5">
        {(title || description) && (
          <div className="px-6 py-4 border-b border-white/5">
            {title && <h2 className="text-xl font-semibold text-white">{title}</h2>}
            {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    );
  }