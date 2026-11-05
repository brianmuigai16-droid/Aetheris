import React from 'react';
import { Box, Layers, Palette, Eye, RotateCw } from 'lucide-react';
import { Spatial3DConfig } from '../SpatialCanvas3D';
import { spatialAudio } from '../../services/spatialAudio';

interface HologramLabAppProps {
  config: Spatial3DConfig;
  onChangeConfig: (newConfig: Partial<Spatial3DConfig>) => void;
}

export const HologramLabApp: React.FC<HologramLabAppProps> = ({ config, onChangeConfig }) => {
  const geometries = [
    { id: 'torusknot', label: 'Torus Knot', info: '128x32' },
    { id: 'icosahedron', label: 'Polyhedron', info: 'Level 2' },
    { id: 'tesseract', label: 'Tesseract', info: '4x4 Grid' },
    { id: 'sphere', label: 'Geodesic', info: '48 Segments' },
    { id: 'waveRing', label: 'Wave Ring', info: '100 Radial' },
  ] as const;

  const rimColors = [
    { label: 'Cyan', color: '#06b6d4' },
    { label: 'Violet', color: '#8b5cf6' },
    { label: 'Amber', color: '#f59e0b' },
    { label: 'Emerald', color: '#10b981' },
    { label: 'Rose', color: '#f43f5e' },
    { label: 'Pure White', color: '#ffffff' },
  ];

  return (
    <div className="space-y-5 text-sm">
      {/* Geometry Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            Volumetric Geometry
          </label>
          <span className="text-xs text-slate-400 font-mono">Mesh 3D</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {geometries.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                spatialAudio.playSpatialClick();
                onChangeConfig({ geometryType: g.id });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                config.geometryType === g.id
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-white shadow-[0_0_16px_rgba(6,182,212,0.25)]'
                  : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <div className="font-medium text-xs truncate">{g.label}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{g.info}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Material & Optical Refraction Sliders */}
      <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Physical Glass Parameters
          </span>
          <span className="text-[10px] text-slate-400 font-mono">PBR Material</span>
        </div>

        {/* Transmission */}
        <div>
          <div className="flex justify-between text-xs mb-1 text-slate-300">
            <span>Glass Refraction (Transmission)</span>
            <span className="font-mono tabular-nums text-cyan-300">
              {Math.round(config.transmission * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.transmission}
            onChange={(e) => onChangeConfig({ transmission: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/20 rounded-lg accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Roughness */}
        <div>
          <div className="flex justify-between text-xs mb-1 text-slate-300">
            <span>Surface Frosting (Roughness)</span>
            <span className="font-mono tabular-nums text-indigo-300">
              {Math.round(config.roughness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={config.roughness}
            onChange={(e) => onChangeConfig({ roughness: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/20 rounded-lg accent-indigo-400 cursor-pointer"
          />
        </div>

        {/* Rotation Speed */}
        <div>
          <div className="flex justify-between text-xs mb-1 text-slate-300">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-slate-400" />
              Spin Velocity
            </span>
            <span className="font-mono tabular-nums text-slate-300">{config.rotationSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={config.rotationSpeed}
            onChange={(e) => onChangeConfig({ rotationSpeed: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/20 rounded-lg accent-purple-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Rim Specular Color */}
      <div>
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Chromatic Rim Highlight
        </label>
        <div className="flex items-center gap-2">
          {rimColors.map((rc) => (
            <button
              key={rc.color}
              onClick={() => {
                spatialAudio.playSpatialClick();
                onChangeConfig({ rimColor: rc.color });
              }}
              title={rc.label}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                config.rimColor.toLowerCase() === rc.color.toLowerCase()
                  ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: rc.color }}
            />
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            spatialAudio.playSpatialClick();
            onChangeConfig({ wireframe: !config.wireframe });
          }}
          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
            config.wireframe
              ? 'bg-cyan-500/20 border-cyan-400/50 text-white'
              : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Wireframe Matrix
          </span>
          <span className="font-mono text-[10px] uppercase text-cyan-300">
            {config.wireframe ? 'Active' : 'Off'}
          </span>
        </button>

        <button
          onClick={() => {
            spatialAudio.playSpatialClick();
            onChangeConfig({ showParticles: !config.showParticles });
          }}
          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
            config.showParticles
              ? 'bg-indigo-500/20 border-indigo-400/50 text-white'
              : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
          }`}
        >
          <span>Star Particles</span>
          <span className="font-mono text-[10px] uppercase text-indigo-300">
            {config.showParticles ? 'Active' : 'Off'}
          </span>
        </button>
      </div>
    </div>
  );
};
