"use client";
import React, { useState } from 'react';
import { 
  Folder, Search, Share2, Cpu, ShieldCheck, Rocket, Settings, 
  Server, ShieldAlert, CheckCircle2, AlertTriangle, X, Play, RefreshCw, Database
} from 'lucide-react';

const initialNodes = [
  { id: 'idx-01', name: 'srv-splunk-idx-01', ip: '172.28.1.11', os: 'Ubuntu 22.04 LTS', role: 'Indexer Peer', cpu: '16 vCPU', ram: '32 GB', status: 'healthy', ports: ['22/SSH', '8089/Mgmt', '9997/Idx'] },
  { id: 'idx-03', name: 'srv-splunk-idx-03', ip: '172.28.1.13', os: 'Ubuntu 22.04 LTS', role: 'Indexer Peer', cpu: '16 vCPU', ram: '32 GB', status: 'warning', ports: ['22/SSH', '8089/Mgmt', '9997/Idx'] },
  { id: 'fw-01', name: 'core-firewall-01', ip: '172.28.1.1', os: 'PAN-OS 11.0', role: 'Firewall', cpu: '8 vCPU', ram: '16 GB', status: 'healthy', ports: ['443/HTTPS'] },
  { id: 'sh-01', name: 'splunk-sh-01', ip: '172.28.1.20', os: 'RHEL 9.2', role: 'Search Head', cpu: '16 vCPU', ram: '64 GB', status: 'healthy', ports: ['8000/Web', '8089/Mgmt'] },
];

export default function QoderStudio() {
  const [activeView, setActiveView] = useState<'Topology' | 'Architecture' | 'Scope'>('Topology');
  const [selectedNode, setSelectedNode] = useState(initialNodes[1]);
  const [thpStatus, setThpStatus] = useState<'pending' | 'applying' | 'applied'>('pending');
  
  // SVA Architecture Studio State
  const [ingestGB, setIngestGB] = useState(500);
  const [retentionDays, setRetentionDays] = useState(90);
  const [haEnabled, setHaEnabled] = useState(true);
  const [esEnabled, setEsEnabled] = useState(false);

  const perIdxCap = esEnabled ? 200 : 300;
  const idxCount = haEnabled ? Math.max(3, Math.ceil(ingestGB / perIdxCap)) : Math.max(1, Math.ceil(ingestGB / perIdxCap));
  const shCount = haEnabled && ingestGB >= 300 ? 3 : 1;
  const totalStorageTB = ((ingestGB * 0.5 * retentionDays * (haEnabled ? 3 : 1)) / 1024).toFixed(1);

  return (
    <div className="flex h-screen bg-[#0B0F17] text-slate-200 font-sans overflow-hidden select-none">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0F1623] border-r border-slate-800/80 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-400 font-bold text-xl">
              Q
            </div>
            <span className="text-xl font-bold tracking-wide text-white">Qoder</span>
          </div>

          <nav className="p-4 space-y-1.5">
            {[
              { name: 'Workspace & Scope', id: 'Scope', icon: Folder },
              { name: 'Topology Map', id: 'Topology', icon: Share2 },
              { name: 'Architecture Studio', id: 'Architecture', icon: Cpu },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeView === item.id 
                    ? 'bg-slate-800/90 text-teal-400 border-l-4 border-teal-400 shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <div className="px-4 py-2.5 text-xs text-slate-400 bg-slate-900/70 rounded-lg border border-slate-800">
            Default Port: <strong className="text-teal-400">8443 (TLS)</strong>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-[#0F1623]/90 border-b border-slate-800/80 flex items-center justify-between px-6">
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
            Environment: <strong className="text-slate-200">Production-West-01</strong>
          </span>

          <div className="flex items-center gap-3 text-xs font-medium">
            {(['Scope', 'Topology', 'Architecture'] as const).map((step, idx) => (
              <React.Fragment key={step}>
                <span 
                  onClick={() => setActiveView(step)}
                  className={`cursor-pointer px-2.5 py-1 rounded transition ${
                    activeView === step 
                      ? 'text-teal-400 border-b-2 border-teal-400 font-semibold' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {step}
                </span>
                {idx < 2 && <span className="text-slate-700">──</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 text-xs font-medium bg-red-950/40 border border-red-800/60 text-red-300 rounded-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Exclusions Active (172.28.1.99)
            </div>
          </div>
        </header>

        {/* VIEW 1: TOPOLOGY MAP */}
        {activeView === 'Topology' && (
          <div className="flex-1 flex relative overflow-hidden">
            <div className="flex-1 relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] flex items-center justify-center p-8">
              <div className="relative w-full max-w-4xl h-[480px] border border-slate-800/60 rounded-xl bg-[#090D14]/80 backdrop-blur-sm p-8 flex items-center justify-around">
                
                {/* Left: Discovered Indexer Hosts */}
                <div className="space-y-10 z-10">
                  {initialNodes.slice(0, 2).map((node) => (
                    <div 
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`cursor-pointer flex flex-col items-center p-3 rounded-xl border transition-all ${
                        selectedNode.id === node.id 
                          ? 'bg-slate-800/90 border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.15)]' 
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 relative ${
                        node.status === 'healthy' ? 'border-emerald-500 bg-emerald-950/30' : 'border-amber-500 bg-amber-950/30'
                      }`}>
                        <Server className="w-6 h-6 text-slate-200" />
                      </div>
                      <span className="mt-2 text-xs font-semibold text-slate-200">{node.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{node.ip}</span>
                    </div>
                  ))}
                </div>

                {/* Center: Firewall */}
                <div className="flex flex-col items-center space-y-8 z-10">
                  <div className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-center">
                    <span className="text-[10px] font-mono text-teal-400 block">TCP 8089 / 9997</span>
                    <div className="w-32 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 my-1" />
                    <span className="text-[10px] text-slate-400">Observed Flow</span>
                  </div>

                  <div 
                    onClick={() => setSelectedNode(initialNodes[2])}
                    className="cursor-pointer flex flex-col items-center p-4 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-teal-400"
                  >
                    <ShieldAlert className="w-10 h-10 text-rose-500 mb-2" />
                    <span className="text-xs font-semibold">core-firewall-01</span>
                    <span className="text-[10px] text-slate-400 font-mono">172.28.1.1</span>
                  </div>
                </div>

                {/* Right: Search Head */}
                <div className="z-10">
                  <div 
                    onClick={() => setSelectedNode(initialNodes[3])}
                    className="cursor-pointer flex flex-col items-center p-4 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-teal-400"
                  >
                    <div className="w-14 h-14 rounded-xl border-2 border-teal-500 bg-teal-950/30 flex items-center justify-center">
                      <Cpu className="w-7 h-7 text-teal-400" />
                    </div>
                    <span className="mt-2 text-xs font-semibold">splunk-sh-01</span>
                    <span className="text-[10px] text-teal-400">172.28.1.20</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-5 left-6 px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-md flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                DEMO DATA / LAB SANDBOX (172.28.0.0/16)
              </div>
            </div>

            {/* RIGHT DRAWER */}
            <aside className="w-80 bg-[#0F1623] border-l border-slate-800/80 p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h2 className="font-bold text-white text-base">{selectedNode.name}</h2>
                </div>

                <div className="bg-[#141D2E] border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between"><span className="text-slate-500">IP:</span><span className="text-teal-400">{selectedNode.ip}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">OS:</span><span>{selectedNode.os}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">CPU/RAM:</span><span>{selectedNode.cpu} / {selectedNode.ram}</span></div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 block mb-1">Open Ports:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.ports.map(p => (
                        <span key={p} className="px-2 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* THP Best Practice */}
                <div className="bg-[#141D2E] border border-amber-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">THP Disable Required</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Transparent Huge Pages degrades Splunk Indexer I/O performance.
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-400">
                    - [always] madvise never<br/>+ always madvise [never]
                  </div>
                  <button 
                    onClick={() => { setThpStatus('applying'); setTimeout(() => setThpStatus('applied'), 1000); }}
                    className="w-full py-1.5 bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs rounded-lg transition"
                  >
                    {thpStatus === 'pending' && 'Apply (Dry-Run Verified)'}
                    {thpStatus === 'applying' && 'Applying...'}
                    {thpStatus === 'applied' && '✓ Applied to Host'}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* VIEW 2: ARCHITECTURE STUDIO (SVA CALCULATOR) */}
        {activeView === 'Architecture' && (
          <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-y-auto">
            <div className="col-span-5 bg-[#0F1623] border border-slate-800 rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">Splunk Validated Architecture (SVA) Inputs</h2>
              
              <div>
                <label className="text-xs text-slate-400 flex justify-between">
                  <span>Daily Ingest Volume (GB/Day)</span>
                  <strong className="text-teal-400 font-mono">{ingestGB} GB/day</strong>
                </label>
                <input 
                  type="range" min="50" max="5000" step="50" value={ingestGB}
                  onChange={(e) => setIngestGB(Number(e.target.value))}
                  className="w-full mt-2 accent-teal-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 flex justify-between">
                  <span>Retention Period (Days)</span>
                  <strong className="text-teal-400 font-mono">{retentionDays} Days</strong>
                </label>
                <input 
                  type="range" min="30" max="365" step="15" value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full mt-2 accent-teal-400"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800 text-sm">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Indexer High Availability Cluster (RF=3, SF=2)</span>
                  <input type="checkbox" checked={haEnabled} onChange={(e) => setHaEnabled(e.target.checked)} className="accent-teal-400 w-4 h-4" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Splunk Enterprise Security (ES) Workload</span>
                  <input type="checkbox" checked={esEnabled} onChange={(e) => setEsEnabled(e.target.checked)} className="accent-teal-400 w-4 h-4" />
                </label>
              </div>
            </div>

            <div className="col-span-7 bg-[#0F1623] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-white">Recommended Blueprint</h2>
                  <span className="px-3 py-1 bg-teal-500/20 border border-teal-400 text-teal-300 text-xs font-mono rounded-md">
                    {haEnabled ? 'Clustered Distributed (SVA-C3)' : 'Distributed Non-Clustered'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#141D2E] border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400">Indexer Tier</span>
                    <div className="text-2xl font-bold text-white mt-1">{idxCount} Nodes</div>
                    <div className="text-[11px] text-teal-400 font-mono mt-1">16 vCPU / 32GB RAM each</div>
                  </div>
                  <div className="bg-[#141D2E] border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400">Search Head Tier</span>
                    <div className="text-2xl font-bold text-white mt-1">{shCount} Nodes</div>
                    <div className="text-[11px] text-teal-400 font-mono mt-1">16 vCPU / {esEnabled ? '64GB' : '32GB'} RAM</div>
                  </div>
                  <div className="bg-[#141D2E] border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400">Total Clustered Storage</span>
                    <div className="text-2xl font-bold text-white mt-1">{totalStorageTB} TB</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">Hot/Warm NVMe + Cold</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs rounded-lg">
                  Export Deployment Plan (JSON)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: WORKSPACE & SCOPE */}
        {activeView === 'Scope' && (
          <div className="flex-1 p-8 max-w-3xl mx-auto space-y-6">
            <div className="bg-[#0F1623] border border-slate-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">1. Authorized Discovery Scope</h2>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Allowed Subnets (CIDR)</label>
                <input type="text" defaultValue="172.28.1.0/24" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-teal-400" />
              </div>
              <div>
                <label className="text-xs text-red-400 block mb-1">Exclude List (Sensitive / OT / Printers)</label>
                <input type="text" defaultValue="172.28.1.99" className="w-full bg-slate-900 border border-red-900/60 rounded-lg px-3 py-2 text-sm font-mono text-red-300" />
              </div>
              <button onClick={() => setActiveView('Topology')} className="px-5 py-2.5 bg-teal-500 text-black font-bold text-xs rounded-lg">
                Verify Scope & Launch Topology Map
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
