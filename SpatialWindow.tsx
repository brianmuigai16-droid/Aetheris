import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X, Move } from 'lucide-react';
import { spatialAudio } from '../services/spatialAudio';

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SpatialWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  initialPos?: { x: number; y: number; width?: number; height?: number };
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  children: React.ReactNode;
  parallaxFactor?: number;
  glintOpacity?: number;
  chromaticDispersion?: boolean;
}

export const SpatialWindow: React.FC<SpatialWindowProps> = ({
  id,
  title,
  icon,
  isOpen,
  isMinimized,
  isMaximized,
  zIndex,
  initialPos = { x: 100, y: 100, width: 620, height: 480 },
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  children,
  parallaxFactor = 1,
  glintOpacity = 0.7,
  chromaticDispersion = true,
}) => {
  const [pos, setPos] = useState({
    x: initialPos.x,
    y: initialPos.y,
    width: initialPos.width || 620,
    height: initialPos.height || 480,
  });

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Bring to focus on click
  const handleContainerClick = () => {
    onFocus(id);
    spatialAudio.playWindowFocus();
  };

  // Mouse move tilt within window
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!windowRef.current || isDragging || isMaximized) return;
    const rect = windowRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: -ny * 6 * parallaxFactor,
      ry: nx * 6 * parallaxFactor,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  // Dragging handlers
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    onFocus(id);
    spatialAudio.playSpatialClick();
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(20, Math.min(window.innerWidth - 120, e.clientX - dragOffset.current.x));
      const newY = Math.max(70, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y));
      setPos((prev) => ({ ...prev, x: newX, y: newY }));
    };

    const handleMouseUpGlobal = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging]);

  if (!isOpen || isMinimized) return null;

  const style: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        top: 76,
        left: 24,
        right: 24,
        bottom: 96,
        zIndex,
        transform: 'none',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    : {
        position: 'absolute',
        top: pos.y,
        left: pos.x,
        width: pos.width,
        height: pos.height,
        zIndex,
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      };

  return (
    <div
      ref={windowRef}
      style={style}
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex flex-col rounded-2xl glass-panel text-slate-100 overflow-hidden select-none transition-shadow ${
        isDragging ? 'shadow-[0_32px_64px_rgba(0,0,0,0.6)] cursor-grabbing' : 'hover:shadow-[0_28px_56px_rgba(0,0,0,0.45)]'
      }`}
    >
      {/* VisionOS Specular Glass Top Rim with smooth transition */}
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none transition-opacity duration-500 ease-out z-10"
        style={{ opacity: glintOpacity * 0.7 }}
      />

      {/* Chromatic Dispersion Sub-pixel Edge Accent */}
      {chromaticDispersion && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none border border-cyan-400/25 mix-blend-screen transition-opacity duration-500 ease-out"
          style={{ opacity: glintOpacity * 0.6 }}
        />
      )}

      {/* Window Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        className="flex items-center justify-between px-4 py-3 bg-white/[0.04] border-b border-white/10 cursor-grab active:cursor-grabbing backdrop-blur-md shrink-0"
      >
        <div className="flex items-center gap-2.5">
          {/* Traffic light / visionOS buttons */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                spatialAudio.playSpatialClick();
                onClose(id);
              }}
              title="Close"
              className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-400 flex items-center justify-center text-rose-950 opacity-80 hover:opacity-100 transition-opacity"
            >
              <X className="w-2 h-2 opacity-0 hover:opacity-100" />
            </button>
            <button
              onClick={() => {
                spatialAudio.playSpatialClick();
                onMinimize(id);
              }}
              title="Minimize"
              className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-400 flex items-center justify-center text-amber-950 opacity-80 hover:opacity-100 transition-opacity"
            >
              <Minus className="w-2 h-2 opacity-0 hover:opacity-100" />
            </button>
            <button
              onClick={() => {
                spatialAudio.playSpatialClick();
                onMaximize(id);
              }}
              title="Maximize"
              className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-400 flex items-center justify-center text-emerald-950 opacity-80 hover:opacity-100 transition-opacity"
            >
              <Square className="w-1.5 h-1.5 opacity-0 hover:opacity-100" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-300 ml-2">
            {icon && <span className="text-slate-400">{icon}</span>}
            <span className="truncate max-w-[200px]">{title}</span>
          </div>
        </div>

        {/* Drag Indicator Grip */}
        <div className="flex items-center gap-1 opacity-40 hover:opacity-80 transition-opacity">
          <Move className="w-3.5 h-3.5 text-slate-300" />
        </div>
      </div>

      {/* Window Body Container */}
      <div className="flex-1 overflow-auto p-4 relative custom-scrollbar">
        {children}
      </div>

      {/* Bottom visionOS pill bar handle */}
      <div className="py-1 flex justify-center items-center opacity-40 hover:opacity-90 transition-opacity">
        <div className="w-24 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  );
};
