import React, { useState, useEffect, useCallback } from 'react';
import { SpatialCanvas3D, Spatial3DConfig } from './components/SpatialCanvas3D';
import { SpatialTopBar } from './components/SpatialTopBar';
import { SpatialDock } from './components/SpatialDock';
import { SpatialWindow, WindowState } from './components/SpatialWindow';
import { HologramLabApp } from './components/apps/HologramLabApp';
import { SpatialAudioApp } from './components/apps/SpatialAudioApp';
import { ThoughtMeshApp } from './components/apps/ThoughtMeshApp';
import { EnvironmentHorizonApp, EnvironmentConfig } from './components/apps/EnvironmentHorizonApp';
import { FileVaultApp } from './components/apps/FileVaultApp';
import { GlassOpticsApp, OpticsConfig } from './components/apps/GlassOpticsApp';
import { Box, Music, Network, Compass, FolderArchive, Sliders } from 'lucide-react';
import { spatialAudio } from './services/spatialAudio';

const DEFAULT_WINDOWS: { [key: string]: WindowState } = {
  hologram: {
    id: 'hologram',
    title: 'Hologram Inspector · 3D Lab',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 48,
    y: 84,
    width: 480,
    height: 480,
  },
  soundscapes: {
    id: 'soundscapes',
    title: 'Spatial Audio & Synthesizer',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 11,
    x: 550,
    y: 84,
    width: 460,
    height: 440,
  },
  thought_mesh: {
    id: 'thought_mesh',
    title: 'Thought Mesh · Neural Anchors',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 12,
    x: 200,
    y: 120,
    width: 620,
    height: 480,
  },
  environment: {
    id: 'environment',
    title: 'Environment Horizons',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 13,
    x: 320,
    y: 110,
    width: 520,
    height: 460,
  },
  file_vault: {
    id: 'file_vault',
    title: 'Artifact Vault · 3D Assets',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 14,
    x: 280,
    y: 130,
    width: 500,
    height: 460,
  },
  optics: {
    id: 'optics',
    title: 'Glass Optics & Refraction',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 15,
    x: 360,
    y: 100,
    width: 480,
    height: 460,
  },
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<string>('workspace');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Initialize from localStorage if available
  const [windows, setWindows] = useState<{ [key: string]: WindowState }>(() => {
    try {
      const saved = localStorage.getItem('aetheris_windows');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WINDOWS;
  });

  const [highestZ, setHighestZ] = useState<number>(25);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 3D Canvas Config
  const [spatial3D, setSpatial3D] = useState<Spatial3DConfig>(() => {
    try {
      const saved = localStorage.getItem('aetheris_spatial3d');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      geometryType: 'torusknot',
      wireframe: false,
      roughness: 0.15,
      transmission: 0.9,
      rotationSpeed: 0.6,
      rimColor: '#06b6d4',
      immersion: 70,
      showParticles: true,
      interactive: true,
    };
  });

  // Environment Config
  const [envConfig, setEnvConfig] = useState<EnvironmentConfig>(() => {
    try {
      const saved = localStorage.getItem('aetheris_env');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      presetId: 'nebula',
      brightness: 0.75,
      blur: 0,
      showVignette: true,
    };
  });

  // Glass Optics Config
  const [optics, setOptics] = useState<OpticsConfig>(() => {
    try {
      const saved = localStorage.getItem('aetheris_optics');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      blurRadius: 28,
      glassOpacity: 0.06,
      specularGlint: 0.7,
      parallaxTilt: 1.0,
      chromaticDispersion: true,
    };
  });

  // Explicit Save Workspace Handler
  const handleSaveWorkspace = useCallback(() => {
    try {
      localStorage.setItem('aetheris_windows', JSON.stringify(windows));
      localStorage.setItem('aetheris_spatial3d', JSON.stringify(spatial3D));
      localStorage.setItem('aetheris_env', JSON.stringify(envConfig));
      localStorage.setItem('aetheris_optics', JSON.stringify(optics));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2200);
    } catch (e) {
      console.warn('Unable to persist to localStorage', e);
    }
  }, [windows, spatial3D, envConfig, optics]);

  // Window Focus Handler
  const handleFocusWindow = useCallback((id: string) => {
    setHighestZ((prev) => {
      const nextZ = prev + 1;
      setWindows((wPrev) => {
        if (!wPrev[id]) return wPrev;
        return {
          ...wPrev,
          [id]: { ...wPrev[id], zIndex: nextZ },
        };
      });
      return nextZ;
    });
  }, []);

  // Window Close Handler
  const handleCloseWindow = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
  }, []);

  // Window Minimize Handler
  const handleMinimizeWindow = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: !prev[id].isMinimized },
    }));
  }, []);

  // Window Maximize Handler
  const handleMaximizeWindow = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id].isMaximized },
    }));
  }, []);

  // Window Toggle (from Dock)
  const handleToggleWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        const win = prev[id];
        if (!win) return prev;
        if (!win.isOpen) {
          handleFocusWindow(id);
          return { ...prev, [id]: { ...win, isOpen: true, isMinimized: false } };
        }
        if (win.isMinimized) {
          handleFocusWindow(id);
          return { ...prev, [id]: { ...win, isMinimized: false } };
        }
        // If already open and focused, toggle minimize
        return { ...prev, [id]: { ...win, isMinimized: true } };
      });
    },
    [handleFocusWindow]
  );

  // Open & Tile All Windows
  const handleOpenAll = () => {
    spatialAudio.playGlassChime(2600, 0.4);
    setWindows((prev) => {
      const updated = { ...prev };
      const keys = Object.keys(updated);
      keys.forEach((key, i) => {
        updated[key] = {
          ...updated[key],
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          x: 40 + (i % 3) * 360,
          y: 75 + Math.floor(i / 3) * 260,
          zIndex: 10 + i,
        };
      });
      return updated;
    });
  };

  // Reset Layout
  const handleResetLayout = () => {
    spatialAudio.playGlassChime(1500, 0.3);
    setWindows(DEFAULT_WINDOWS);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '1') handleToggleWindow('hologram');
      if (e.key === '2') handleToggleWindow('soundscapes');
      if (e.key === '3') handleToggleWindow('thought_mesh');
      if (e.key === '4') handleToggleWindow('environment');
      if (e.key === '5') handleToggleWindow('file_vault');
      if (e.key === '6') handleToggleWindow('optics');
      if (e.key.toLowerCase() === 'r') handleResetLayout();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleWindow]);

  // Environment Background Map
  const getEnvBgUrl = () => {
    switch (envConfig.presetId) {
      case 'nebula':
        return '/src/assets/images/bg_env_deep_nebula_1793900276096.jpg';
      case 'fjord':
        return '/src/assets/images/bg_env_nordic_fjord_1793900276921.jpg';
      case 'atelier':
        return '/src/assets/images/bg_env_cyber_atelier_1793900277539.jpg';
      case 'void':
      default:
        return '';
    }
  };

  // Map Dock Active Flags
  const activeWindowFlags = Object.keys(windows).reduce((acc, k) => {
    acc[k] = windows[k].isOpen && !windows[k].isMinimized;
    return acc;
  }, {} as { [key: string]: boolean });

  // Navigation mode switcher
  const handleNavigate = (screen: string) => {
    setActiveScreen(screen);
    if (screen === 'workspace') {
      // Return to spatial multi-window
    } else if (screen === 'hologram') {
      handleToggleWindow('hologram');
      handleFocusWindow('hologram');
    } else if (screen === 'soundscapes') {
      handleToggleWindow('soundscapes');
      handleFocusWindow('soundscapes');
    } else if (screen === 'thought_mesh') {
      handleToggleWindow('thought_mesh');
      handleFocusWindow('thought_mesh');
    } else if (screen === 'file_vault') {
      handleToggleWindow('file_vault');
      handleFocusWindow('file_vault');
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 flex flex-col font-sans select-none"
      style={{
        // Dynamic Glass Optics CSS variables
        ['--glass-blur' as string]: `${optics.blurRadius}px`,
        ['--glass-opacity' as string]: optics.glassOpacity,
        ['--glass-glint' as string]: optics.specularGlint,
      }}
    >
      {/* Dynamic Environmental Horizon Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          filter: `blur(${envConfig.blur}px) brightness(${envConfig.brightness})`,
        }}
      >
        {getEnvBgUrl() ? (
          <img
            src={getEnvBgUrl()}
            alt="Environmental Horizon"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-slate-950 via-[#05070f] to-black" />
        )}
      </div>

      {/* Atmospheric Vignette & Contrast Scrim */}
      {envConfig.showVignette && (
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] transition-opacity duration-500"
          style={{ opacity: 0.9 }}
        />
      )}

      {/* Three.js 3D Volumetric Hologram & Starfield */}
      <SpatialCanvas3D
        config={spatial3D}
        onPointerMove={() => {
          // pointer tracking
        }}
      />

      {/* Spatial Top Bar */}
      <SpatialTopBar
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        onResetLayout={handleResetLayout}
        onSaveLayout={handleSaveWorkspace}
        isSaved={isSaved}
        immersion={spatial3D.immersion}
        onImmersionChange={(val) => setSpatial3D((prev) => ({ ...prev, immersion: val }))}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* Workspace Area: Multi-Window Spatial Canvas */}
      <main className="relative flex-1 overflow-hidden">
        {/* Hologram Lab Window */}
        <SpatialWindow
          id="hologram"
          title={windows.hologram.title}
          icon={<Box className="w-4 h-4 text-cyan-400" />}
          isOpen={windows.hologram.isOpen}
          isMinimized={windows.hologram.isMinimized}
          isMaximized={windows.hologram.isMaximized}
          zIndex={windows.hologram.zIndex}
          initialPos={{
            x: windows.hologram.x,
            y: windows.hologram.y,
            width: windows.hologram.width,
            height: windows.hologram.height,
          }}
          onClose={handleCloseWindow}
          onMinimize={handleMinimizeWindow}
          onMaximize={handleMaximizeWindow}
          onFocus={handleFocusWindow}
          parallaxFactor={optics.parallaxTilt}
          glintOpacity={optics.specularGlint}
          chromaticDispersion={optics.chromaticDispersion}
        >
          <HologramLabApp
            config={spatial3D}
            onChangeConfig={(newCfg) => setSpatial3D((prev) => ({ ...prev, ...newCfg }))}
          />
        </SpatialWindow>

        {/* Spatial Audio & Soundscapes Window */}
        <SpatialWindow
          id="soundscapes"
          title={windows.soundscapes.title}
          icon={<Music className="w-4 h-4 text-indigo-400" />}
          isOpen={windows.soundscapes.isOpen}
          isMinimized={windows.soundscapes.isMinimized}
          isMaximized={windows.soundscapes.isMaximized}
          zIndex={windows.soundscapes.zIndex}
          initialPos={{
            x: windows.soundscapes.x,
            y: windows.soundscapes.y,
            width: windows.soundscapes.width,
            height: windows.soundscapes.height,
          }}
          onClose={handleCloseWindow}
          onMinimize={handleMinimizeWindow}
          onMaximize={handleMaximizeWindow}
          onFocus={handleFocusWindow}
          parallaxFactor={optics.parallaxTilt}
          glintOpacity={optics.specularGlint}
          chromaticDispersion={optics.chromaticDispersion}
        >
          <SpatialAudioApp />
        </SpatialWindow>

        {/* Thought Mesh & Neural Nodes Window */}
        <SpatialWindow
          id="thought_mesh"
          title={windows.thought_mesh.title}
          icon={<Network className="w-4 h-4 text-purple-400" />}
          isOpen={windows.thought_mesh.isOpen}
          isMinimized={windows.thought_mesh.isMinimized}
          isMaximized={windows.thought_mesh.isMaximized}
          zIndex={windows.thought_mesh.zIndex}
          initialPos={{
            x: windows.thought_mesh.x,
            y: windows.thought_mesh.y,
            width: windows.thought_mesh.width,
            height: windows.thought_mesh.height,
          }}
          onClose={handleCloseWindow}
          onMinimize={handleMinimizeWindow}
          onMaximize={handleMaximizeWindow}
          onFocus={handleFocusWindow}
          parallaxFactor={optics.parallaxTilt}
          glintOpacity={optics.specularGlint}
          chromaticDispersion={optics.chromaticDispersion}
        >
          <ThoughtMeshApp />
        </SpatialWindow>

        {/* Environment Horizons Window */}
        <SpatialWindow
          id="environment"
          title={windows.environment.title}
          icon={<Compass className="w-4 h-4 text-emerald-400" />}
          isOpen={windows.environment.isOpen}
          isMinimized={windows.environment.isMinimized}
          isMaximized={windows.environment.isMaximized}
          zIndex={windows.environment.zIndex}
          initialPos={{
            x: windows.environment.x,
            y: windows.environment.y,
            width: windows.environment.width,
            height: windows.environment.height,
          }}
          onClose={handleCloseWindow}
          onMinimize={handleMinimizeWindow}
          onMaximize={handleMaximizeWindow}
          onFocus={handleFocusWindow}
          parallaxFactor={optics.parallaxTilt}
          glintOpacity={optics.specularGlint}
          chromaticDispersion={optics.chromaticDispersion}
        >
          <EnvironmentHorizonApp
            envConfig={envConfig}
            onUpdateConfig={(newCfg) => setEnvConfig((prev) => ({ ...prev, ...newCfg }))}
          />
        </SpatialWindow>

        {/* Spatial File Vault Window */}
        <SpatialWindow
          id="file_vault"
          title={windows.file_vault.title}
          icon={<FolderArchive className="w-4 h-4 text-amber-400" />}
          isOpen={windows.file_vault.isOpen}
          isMinimized={windows.file_vault.isMinimized}
          isMaximized={windows.file_vault.isMaximized}
          zIndex={windows.file_vault.zIndex}
          initialPos={{
            x: windows.file_vault.x,
            y: windows.file_vault.y,
            width: windows.file_vault.width,
            height: windows.file_vault.height,
          }}
          onClose={handleCloseWindow}
          onMinimize={handleMinimizeWindow}
          onMaximize={handleMaximizeWindow}
          onFocus={handleFocusWindow}
          parallaxFactor={optics.parallaxTilt}
          glintOpacity={optics.specularGlint}
          chromaticDispersion={optics.chromaticDispersion}
        >
          <FileVaultApp />
        </SpatialWindow>

        {/* Glass Optics Calibration Window */}
        <SpatialWindow
          id="optics"
          title={windows.optics.title}
          icon={<Sliders className="w-4 h-4 text-pink-400" />}
          isOpen={windows.optics.isOpen}
          isMinimized={windows.optics.isMinimized}
          isMaximized={windows.optics.isMaximized}
          zIndex={windows.optics.zIndex}
          initialPos={{
            x: windows.optics.x,
            y: windows.optics.y,
            width: windows.optics.width,
            height: windows.optics.height,
          }}
          onClose={handleCloseWindow}
          onMinimize={handleMinimizeWindow}
          onMaximize={handleMaximizeWindow}
          onFocus={handleFocusWindow}
          parallaxFactor={optics.parallaxTilt}
          glintOpacity={optics.specularGlint}
          chromaticDispersion={optics.chromaticDispersion}
        >
          <GlassOpticsApp
            optics={optics}
            onUpdateOptics={(newOptics) => setOptics((prev) => ({ ...prev, ...newOptics }))}
            onResetOptics={() =>
              setOptics({
                blurRadius: 28,
                glassOpacity: 0.06,
                specularGlint: 0.7,
                parallaxTilt: 1.0,
                chromaticDispersion: true,
              })
            }
          />
        </SpatialWindow>
      </main>

      {/* Floating Spatial Capsule Dock */}
      <SpatialDock
        activeWindows={activeWindowFlags}
        onToggleWindow={handleToggleWindow}
        onOpenAll={handleOpenAll}
      />
    </div>
  );
}
