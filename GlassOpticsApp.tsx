import React, { useState, useRef, useEffect } from 'react';
import { Sliders, Sparkles, RefreshCw, Zap, Gem, Moon, CloudFog, Compass } from 'lucide-react';
import { spatialAudio } from '../../services/spatialAudio';

export interface OpticsConfig {
  blurRadius: number;
  glassOpacity: number;
  specularGlint: number;
  parallaxTilt: number;
  chromaticDispersion: boolean;
}

interface GlassOpticsAppProps {
  optics: OpticsConfig;
  onUpdateOptics: (newOptics: Partial<OpticsConfig>) => void;
  onResetOptics: () => void;
}

interface OpticsPreset {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  config: OpticsConfig;
}

export const GlassOpticsApp: React.FC<GlassOpticsAppProps> = ({
  optics,
  onUpdateOptics,
  onResetOptics,
}) => {
  const [activePresetId, setActivePresetId] = useState<string>('vision-pro');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  const presets: OpticsPreset[] = [
    {
      id: 'vision-pro',
      name: 'Vision Pro Glass',
      subtitle: 'Calibrated VisionOS refraction with specular rim',
      icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
      config: {
        blurRadius: 36,
        glassOpacity: 0.08,
        specularGlint: 0.85,
        parallaxTilt: 1.2,
        chromaticDispersion: true,
      },
    },
    {
      id: 'crystal',
      name: 'Crystal Prismatic',
      subtitle: 'High transmission with chromatic dispersion',
      icon: <Gem className="w-3.5 h-3.5 text-cyan-400" />,
      config: {
        blurRadius: 16,
        glassOpacity: 0.03,
        specularGlint: 1.0,
        parallaxTilt: 1.5,
        chromaticDispersion: true,
      },
    },
    {
      id: 'obsidian',
      name: 'Smoked Obsidian',
      subtitle: 'Deep smoked surface with soft specular contrast',
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
      config: {
        blurRadius: 44,
        glassOpacity: 0.2,
        specularGlint: 0.45,
        parallaxTilt: 0.8,
        chromaticDispersion: false,
      },
    },
    {
      id: 'frosted',
      name: 'Frosted Mist',
      subtitle: 'Heavy atmospheric diffusion & matte touch',
      icon: <CloudFog className="w-3.5 h-3.5 text-emerald-400" />,
      config: {
        blurRadius: 48,
        glassOpacity: 0.14,
        specularGlint: 0.55,
        parallaxTilt: 0.6,
        chromaticDispersion: false,
      },
    },
    {
      id: 'minimal',
      name: 'Minimal Air',
      subtitle: 'Ultralight substrate with subtle edge definition',
      icon: <Compass className="w-3.5 h-3.5 text-pink-400" />,
      config: {
        blurRadius: 24,
        glassOpacity: 0.05,
        specularGlint: 0.4,
        parallaxTilt: 1.0,
        chromaticDispersion: false,
      },
    },
  ];

  // Cancel any running transition animation
  const stopAnimation = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsTransitioning(false);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Smooth Spring / Cubic Easing Interpolator to animate values smoothly
  const animateToConfig = (target: OpticsConfig, presetId?: string) => {
    stopAnimation();
    if (presetId) setActivePresetId(presetId);
    setIsTransitioning(true);

    const start = {
      blurRadius: optics.blurRadius,
      glassOpacity: optics.glassOpacity,
      specularGlint: optics.specularGlint,
      parallaxTilt: optics.parallaxTilt,
    };

    const duration = 580; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth cubic ease-out curve: 1 - (1 - t)^3
      const ease = 1 - Math.pow(1 - progress, 3);

      const currentBlur = Math.round(start.blurRadius + (target.blurRadius - start.blurRadius) * ease);
      const currentOpacity = Number(
        (start.glassOpacity + (target.glassOpacity - start.glassOpacity) * ease).toFixed(3)
      );
      const currentGlint = Number(
        (start.specularGlint + (target.specularGlint - start.specularGlint) * ease).toFixed(3)
      );
      const currentTilt = Number(
        (start.parallaxTilt + (target.parallaxTilt - start.parallaxTilt) * ease).toFixed(2)
      );

      onUpdateOptics({
        blurRadius: currentBlur,
        glassOpacity: currentOpacity,
        specularGlint: currentGlint,
        parallaxTilt: currentTilt,
        chromaticDispersion: target.chromaticDispersion,
      });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setIsTransitioning(false);
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const handleSelectPreset = (preset: OpticsPreset) => {
    spatialAudio.playGlassChime(1980, 0.35);
    animateToConfig(preset.config, preset.id);
  };

  const handleReset = () => {
    spatialAudio.playGlassChime(1450, 0.3);
    const defaultConfig: OpticsConfig = {
      blurRadius: 28,
      glassOpacity: 0.06,
      specularGlint: 0.7,
      parallaxTilt: 1.0,
      chromaticDispersion: true,
    };
    animateToConfig(defaultConfig, 'default');
    onResetOptics();
  };

  // Slider change helper (direct user drag)
  const handleManualSlider = (key: keyof OpticsConfig, val: number | boolean) => {
    stopAnimation();
    setActivePresetId('custom');
    onUpdateOptics({ [key]: val });
  };

  // Percentage helpers for visual fill tracks
  const blurPercent = Math.min(100, Math.max(0, ((optics.blurRadius - 8) / (48 - 8)) * 100));
  const opacityPercent = Math.min(100, Math.max(0, ((optics.glassOpacity - 0.02) / (0.25 - 0.02)) * 100));
  const glintPercent = Math.min(100, Math.max(0, (optics.specularGlint / 1.0) * 100));
  const tiltPercent = Math.min(100, Math.max(0, (optics.parallaxTilt / 2.0) * 100));

  return (
    <div className="space-y-4 text-sm select-none">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-pink-400" />
          Spatial Glass Optics
        </label>
        {isTransitioning ? (
          <span className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono animate-pulse">
            <Sparkles className="w-3 h-3" />
            Interpolating Glass...
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono">VisionOS Refraction 3.0</span>
        )}
      </div>

      {/* Preset Cards Strip */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 mb-1.5">Optical Presets (Smooth Morph)</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {presets.map((p) => {
            const isActive = activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-300 flex items-start gap-2.5 ${
                  isActive
                    ? 'bg-white/[0.14] border-white/40 shadow-[0_0_16px_rgba(255,255,255,0.2)] text-white scale-[1.01]'
                    : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0 mt-0.5">
                  {p.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs truncate flex items-center justify-between">
                    <span>{p.name}</span>
                    {isActive && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-mono border border-cyan-400/30">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animated Sliders Control Panel */}
      <div className="space-y-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        {/* Blur Radius */}
        <div>
          <div className="flex justify-between text-xs mb-1 text-slate-300">
            <span>Backdrop Blur Intensity</span>
            <span className="font-mono tabular-nums text-pink-300 transition-all duration-300">
              {optics.blurRadius}px
            </span>
          </div>
          <div className="relative flex items-center h-4">
            {/* Visual Fill Track with CSS transition */}
            <div className="absolute inset-x-0 h-1.5 bg-white/10 rounded-lg overflow-hidden pointer-events-none">
              <div
                className="h-full bg-gradient-to-r from-pink-500/80 to-purple-400 transition-all duration-300 ease-out"
                style={{ width: `${blurPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="8"
              max="48"
              step="1"
              value={optics.blurRadius}
              onChange={(e) => handleManualSlider('blurRadius', parseInt(e.target.value))}
              className="relative w-full h-1.5 bg-transparent appearance-none rounded-lg accent-pink-400 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* Glass Base Opacity */}
        <div>
          <div className="flex justify-between text-xs mb-1 text-slate-300">
            <span>Glass Substrate Density (Opacity)</span>
            <span className="font-mono tabular-nums text-cyan-300 transition-all duration-300">
              {Math.round(optics.glassOpacity * 100)}%
            </span>
          </div>
          <div className="relative flex items-center h-4">
            <div className="absolute inset-x-0 h-1.5 bg-white/10 rounded-lg overflow-hidden pointer-events-none">
              <div
                className="h-full bg-gradient-to-r from-cyan-500/80 to-indigo-400 transition-all duration-300 ease-out"
                style={{ width: `${opacityPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="0.02"
              max="0.25"
              step="0.005"
              value={optics.glassOpacity}
              onChange={(e) => handleManualSlider('glassOpacity', parseFloat(e.target.value))}
              className="relative w-full h-1.5 bg-transparent appearance-none rounded-lg accent-cyan-400 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* Specular Glint */}
        <div>
          <div className="flex justify-between text-xs mb-1 text-slate-300">
            <span>Specular Rim Glint</span>
            <span className="font-mono tabular-nums text-amber-300 transition-all duration-300">
              {Math.round(optics.specularGlint * 100)}%
            </span>
          </div>
          <div className="relative flex items-center h-4">
            <div className="absolute inset-x-0 h-1.5 bg-white/10 rounded-lg overflow-hidden pointer-events-none">
              <div
                className="h-full bg-gradient-to-r from-amber-500/80 to-yellow-300 transition-all duration-300 ease-out"
                style={{ width: `${glintPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={optics.specularGlint}
              onChange={(e) => handleManualSlider('specularGlint', parseFloat(e.target.value))}
              className="relative w-full h-1.5 bg-transparent appearance-none rounded-lg accent-amber-400 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* Parallax Tilt Multiplier */}
        <div>
          <div className="flex justify-between text-xs mb-1 text-slate-300">
            <span>Cursor Tilt Parallax Factor</span>
            <span className="font-mono tabular-nums text-indigo-300 transition-all duration-300">
              {optics.parallaxTilt.toFixed(1)}x
            </span>
          </div>
          <div className="relative flex items-center h-4">
            <div className="absolute inset-x-0 h-1.5 bg-white/10 rounded-lg overflow-hidden pointer-events-none">
              <div
                className="h-full bg-gradient-to-r from-indigo-500/80 to-violet-400 transition-all duration-300 ease-out"
                style={{ width: `${tiltPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={optics.parallaxTilt}
              onChange={(e) => handleManualSlider('parallaxTilt', parseFloat(e.target.value))}
              className="relative w-full h-1.5 bg-transparent appearance-none rounded-lg accent-indigo-400 cursor-pointer z-10"
            />
          </div>
        </div>
      </div>

      {/* Chromatic Dispersion Switch & Reset */}
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-xs font-medium text-white">Chromatic Dispersion</div>
            <div className="text-[10px] text-slate-400">Subtle RGB edge diffraction on windows</div>
          </div>
        </div>
        <button
          onClick={() => {
            spatialAudio.playSpatialClick();
            handleManualSlider('chromaticDispersion', !optics.chromaticDispersion);
          }}
          className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${
            optics.chromaticDispersion ? 'bg-cyan-500' : 'bg-white/20'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
              optics.chromaticDispersion ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Reset Calibration */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400 font-mono">
          Transitions: 580ms cubic ease
        </span>

        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-lg glass-control text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTransitioning ? 'animate-spin' : ''}`} />
          Reset Calibration
        </button>
      </div>
    </div>
  );
};
