// src/components/layout/footer.tsx
export function Footer() {
    return (
      <footer className="border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-400">
              Trip Lights - LED Matrix Controller
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="/docs"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Documentation
              </a>
              <a
                href="/api"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                API
              </a>
              <a
                href="https://github.com/yourusername/trip-lights"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
            <div className="text-sm text-gray-400">
              v1.0.0
            </div>
          </div>
        </div>
      </footer>
    );
  }