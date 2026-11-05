import React, { useState, useRef } from 'react';
import { Plus, Search, Tag, Sparkles } from 'lucide-react';
import { spatialAudio } from '../../services/spatialAudio';

interface ThoughtNode {
  id: string;
  title: string;
  category: 'Optics' | 'Acoustics' | 'Spatial UX' | 'Compositing';
  description: string;
  x: number;
  y: number;
  color: string;
  connections: string[];
}

export const ThoughtMeshApp: React.FC = () => {
  const [nodes, setNodes] = useState<ThoughtNode[]>([
    {
      id: 'n1',
      title: 'Fresnel Refraction Curves',
      category: 'Optics',
      description: 'Physical angle-dependent reflectance on curved glass boundaries with micro-surface scattering.',
      x: 80,
      y: 60,
      color: '#38bdf8',
      connections: ['n2', 'n4'],
    },
    {
      id: 'n2',
      title: 'Binaural Phase Delay',
      category: 'Acoustics',
      description: 'Head-related transfer function simulating sound waves arriving with microsecond interaural deltas.',
      x: 320,
      y: 50,
      color: '#818cf8',
      connections: ['n1', 'n3'],
    },
    {
      id: 'n3',
      title: 'Immersion Crown Calibration',
      category: 'Spatial UX',
      description: 'Gradual transition between physical reality passthrough and synthesized volumetric worlds.',
      x: 360,
      y: 200,
      color: '#f472b6',
      connections: ['n2', 'n5'],
    },
    {
      id: 'n4',
      title: 'Zero-Latency Compositing',
      category: 'Compositing',
      description: 'Direct GPU framebuffer swap minimizing glass hover lag and maintaining 60FPS fluid motion.',
      x: 90,
      y: 220,
      color: '#34d399',
      connections: ['n1', 'n5'],
    },
    {
      id: 'n5',
      title: 'Spatial Memory Pinning',
      category: 'Spatial UX',
      description: 'World-locked coordinate anchors holding glass canvases in static virtual space.',
      x: 220,
      y: 310,
      color: '#fbbf24',
      connections: ['n3', 'n4'],
    },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>('n1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newCat, setNewCat] = useState<'Optics' | 'Acoustics' | 'Spatial UX' | 'Compositing'>('Optics');

  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const categories = ['All', 'Optics', 'Acoustics', 'Spatial UX', 'Compositing'];

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'All' || n.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    spatialAudio.playSpatialClick();
    setSelectedNodeId(id);
    setDraggingNodeId(id);
    const node = nodes.find((n) => n.id === id);
    if (node) {
      dragStartOffset.current = {
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      };
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!draggingNodeId || !canvasAreaRef.current) return;
    const rect = canvasAreaRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 140, e.clientX - dragStartOffset.current.x));
    const newY = Math.max(20, Math.min(rect.height - 70, e.clientY - dragStartOffset.current.y));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleMouseUpCanvas = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    spatialAudio.playGlassChime(2400, 0.3);
    const catColors = {
      Optics: '#38bdf8',
      Acoustics: '#818cf8',
      'Spatial UX': '#f472b6',
      Compositing: '#34d399',
    };

    const newNode: ThoughtNode = {
      id: `n_${Date.now()}`,
      title: newTitle.trim(),
      category: newCat,
      description: newDesc.trim() || 'Spatial thought node captured in glass memory.',
      x: 180 + Math.random() * 80,
      y: 120 + Math.random() * 60,
      color: catColors[newCat],
      connections: [selectedNodeId],
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-3 flex flex-col h-full min-h-[360px] text-sm">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search spatial thoughts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                spatialAudio.playSpatialClick();
                setActiveCategory(c);
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                activeCategory === c
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            spatialAudio.playSpatialClick();
            setIsAdding(!isAdding);
          }}
          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-medium flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          New Node
        </button>
      </div>

      {/* Creation Form Modal/Accordion */}
      {isAdding && (
        <form
          onSubmit={handleCreateNode}
          className="p-3 rounded-xl bg-white/[0.06] border border-cyan-400/30 space-y-2 shrink-0 backdrop-blur-lg"
        >
          <div className="flex justify-between items-center text-xs font-semibold text-white">
            <span>Add Spatial Thought Node</span>
            <span className="text-[10px] text-cyan-300 font-mono">LINKED TO CURRENT NODE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Node Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value as any)}
              className="px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none"
            >
              <option value="Optics">Optics</option>
              <option value="Acoustics">Acoustics</option>
              <option value="Spatial UX">Spatial UX</option>
              <option value="Compositing">Compositing</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Description or key equation..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-2.5 py-1 rounded bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold"
            >
              Attach Node
            </button>
          </div>
        </form>
      )}

      {/* Main Interactive Canvas Area */}
      <div
        ref={canvasAreaRef}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        className="relative flex-1 rounded-xl bg-black/30 border border-white/10 overflow-hidden min-h-[220px]"
      >
        {/* SVG Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map((node) =>
            node.connections.map((targetId) => {
              const targetNode = nodes.find((n) => n.id === targetId);
              if (!targetNode) return null;
              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={node.x + 60}
                  y1={node.y + 24}
                  x2={targetNode.x + 60}
                  y2={targetNode.y + 24}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {filteredNodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDownNode(e, node.id)}
              style={{
                left: node.x,
                top: node.y,
              }}
              className={`absolute cursor-move select-none p-2 rounded-xl backdrop-blur-md border transition-shadow duration-150 ${
                isSelected
                  ? 'bg-white/[0.14] border-white shadow-[0_0_16px_rgba(255,255,255,0.3)] z-10 scale-105'
                  : 'bg-white/[0.05] border-white/15 hover:bg-white/[0.09]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-xs font-medium text-white truncate max-w-[130px]">
                  {node.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Inspector Details Drawer */}
      {selectedNode && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {selectedNode.title}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-mono">
              <Tag className="w-3 h-3" />
              {selectedNode.category}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
        </div>
      )}
    </div>
  );
};
