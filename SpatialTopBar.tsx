import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Maximize2, RotateCcw, Sparkles, Save, Check } from 'lucide-react';
import { spatialAudio } from '../services/spatialAudio';

interface SpatialTopBarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onResetLayout: () => void;
  onSaveLayout?: () => void;
  isSaved?: boolean;
  immersion: number;
  onImmersionChange: (val: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const SpatialTopBar: React.FC<SpatialTopBarProps> = ({
  activeScreen,
  onNavigate,
  onResetLayout,
  onSaveLayout,
  isSaved = false,
  immersion,
  onImmersionChange,
  onToggleFullscreen,
  isFullscreen,
}) => {
  const [time, setTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(spatialAudio.getIsMuted());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAudioToggle = () => {
    const muted = spatialAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      spatialAudio.playGlassChime(1500, 0.2);
    }
  };

  const navItems = [
    { id: 'workspace', label: 'Spatial Workspace' },
    { id: 'hologram', label: 'Hologram Lab' },
    { id: 'soundscapes', label: 'Soundscapes' },
    { id: 'thought_mesh', label: 'Thought Mesh' },
    { id: 'file_vault', label: 'Artifact Vault' },
  ];

  return (
    <header className="h-14 px-6 border-b border-white/10 glass-panel-subtle flex items-center justify-between gap-8 z-50 shrink-0 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            spatialAudio.playSpatialClick();
            onNavigate('workspace');
          }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
          <span>Aetheris</span>
          <span className="text-xs font-normal text-slate-400 font-mono tracking-widest pl-1">GLASS·OS</span>
        </button>
      </div>

      {/* Zone 2: 4-5 single-line clean navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                spatialAudio.playSpatialClick();
                onNavigate(item.id);
              }}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 Primary Action + Quick Spatial Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Immersion Level Dial */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Immersion</span>
          <input
            type="range"
            min="20"
            max="100"
            value={immersion}
            onChange={(e) => onImmersionChange(Number(e.target.value))}
            className="w-16 h-1 accent-cyan-400 bg-white/20 rounded-lg cursor-pointer"
            title="Spatial Immersion Crown"
          />
          <span className="font-mono tabular-nums text-cyan-300 w-8 text-right">{immersion}%</span>
        </div>

        {/* Spatial Audio Mute Toggle */}
        <button
          onClick={handleAudioToggle}
          title={isMuted ? 'Unmute Spatial Audio' : 'Mute Spatial Audio'}
          className="p-2 rounded-lg glass-control text-slate-300 hover:text-white"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Save Workspace State Button */}
        {onSaveLayout && (
          <button
            onClick={() => {
              spatialAudio.playGlassChime(2400, 0.25);
              onSaveLayout();
            }}
            title={isSaved ? 'Workspace Saved' : 'Save Workspace Layout & Settings'}
            className={`p-2 rounded-lg glass-control transition-all ${
              isSaved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          </button>
        )}

        {/* Reset Spatial Windows */}
        <button
          onClick={() => {
            spatialAudio.playSpatialClick();
            onResetLayout();
          }}
          title="Reset Spatial Window Layout"
          className="p-2 rounded-lg glass-control text-slate-300 hover:text-white"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => {
            spatialAudio.playSpatialClick();
            onToggleFullscreen();
          }}
          title="Toggle Fullscreen"
          className="p-2 rounded-lg glass-control text-slate-300 hover:text-white"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Tabular Time Display */}
        <div className="hidden sm:block text-xs font-mono tabular-nums text-slate-400 px-2 py-1 rounded bg-white/[0.04] border border-white/5">
          {time}
        </div>

        {/* Zone 3 Primary Action */}
        <button
          onClick={() => {
            spatialAudio.playGlassChime(1980, 0.3);
            onNavigate('workspace');
          }}
          className="px-3.5 py-1.5 text-xs font-semibold text-black bg-white rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          Focus Space
        </button>
      </div>
    </header>
  );
};
