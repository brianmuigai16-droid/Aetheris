import React from 'react';
import { Box, Music, Network, Compass, FolderArchive, Sliders, LayoutGrid } from 'lucide-react';
import { spatialAudio } from '../services/spatialAudio';

interface DockItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  shortcut: string;
}

interface SpatialDockProps {
  activeWindows: { [key: string]: boolean };
  onToggleWindow: (id: string) => void;
  onOpenAll: () => void;
}

export const SpatialDock: React.FC<SpatialDockProps> = ({
  activeWindows,
  onToggleWindow,
  onOpenAll,
}) => {
  const dockApps: DockItem[] = [
    { id: 'hologram', name: 'Hologram Lab', icon: <Box className="w-5 h-5 text-cyan-300" />, shortcut: '1' },
    { id: 'soundscapes', name: 'Spatial Audio', icon: <Music className="w-5 h-5 text-indigo-300" />, shortcut: '2' },
    { id: 'thought_mesh', name: 'Thought Mesh', icon: <Network className="w-5 h-5 text-purple-300" />, shortcut: '3' },
    { id: 'environment', name: 'Environments', icon: <Compass className="w-5 h-5 text-emerald-300" />, shortcut: '4' },
    { id: 'file_vault', name: 'File Vault', icon: <FolderArchive className="w-5 h-5 text-amber-300" />, shortcut: '5' },
    { id: 'optics', name: 'Glass Optics', icon: <Sliders className="w-5 h-5 text-pink-300" />, shortcut: '6' },
  ];

  return (
    <div className="fixed bottom-5 inset-x-0 flex justify-center items-center z-50 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1.5 p-2 rounded-2xl glass-panel shadow-[0_16px_36px_rgba(0,0,0,0.6)] border border-white/20 backdrop-blur-2xl bg-white/[0.08]">
        {/* App Icons */}
        {dockApps.map((app) => {
          const isOpen = !!activeWindows[app.id];
          return (
            <button
              key={app.id}
              onClick={() => {
                spatialAudio.playDockHover();
                onToggleWindow(app.id);
              }}
              onMouseEnter={() => {
                spatialAudio.playDockHover();
              }}
              title={`${app.name} (${app.shortcut})`}
              className={`relative group p-3 rounded-xl transition-all duration-200 hover:-translate-y-1.5 hover:scale-110 active:scale-95 ${
                isOpen
                  ? 'bg-white/[0.18] shadow-[0_0_16px_rgba(255,255,255,0.25)] border border-white/30'
                  : 'hover:bg-white/[0.12] border border-transparent'
              }`}
            >
              {app.icon}

              {/* Tooltip */}
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-[11px] font-medium text-white bg-slate-900/90 border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                {app.name}
              </span>

              {/* Open indicator pill */}
              {isOpen && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
              )}
            </button>
          );
        })}

        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Tile / Grid All windows */}
        <button
          onClick={() => {
            spatialAudio.playSpatialClick();
            onOpenAll();
          }}
          title="Tile All Spatial Windows"
          className="p-3 rounded-xl hover:bg-white/[0.12] text-slate-300 hover:text-white transition-all duration-200 hover:-translate-y-1"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
