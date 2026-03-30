
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Monitor, Search, Loader2, Maximize2, Minimize2, Save, Activity, Network, FolderTree, ListTree, Orbit } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { ScannedDevice, NetworkInterface } from '../types';

interface NetworkMapProps {
    iface: NetworkInterface | null;
    scannedDevices: ScannedDevice[];
    isScanning: boolean;
    progress: number;
    onStartScan: () => void;
    onSaveToProfile?: (device: ScannedDevice) => void;
    onDiagnose?: (ip: string) => void;
    onScanPorts?: (ip: string) => void;
    language: string;
}

interface D3Node extends d3.SimulationNodeDatum {
    id: string;
    group: string;
    type: string;
    ip?: string;
    mac?: string;
    vendor?: string;
    isNew?: boolean;
    radius: number;
    color: string;
    label: string;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
    source: string | D3Node;
    target: string | D3Node;
    value: number;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({
    iface,
    scannedDevices,
    isScanning,
    progress,
    onStartScan,
    onSaveToProfile,
    onDiagnose,
    onScanPorts,
    language
}) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [viewType, setViewType] = useState<'force' | 'tree'>('force');
    const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);

    // Group devices by type/vendor to create clusters
    const data = useMemo(() => {
        const nodes: D3Node[] = [];
        const links: D3Link[] = [];
        const gatewayIp = iface?.gateway || '192.168.1.1';

        // 1. Add Gateway/Router Node (Center)
        nodes.push({
            id: 'gateway',
            group: 'gateway',
            type: 'Router',
            ip: gatewayIp,
            label: 'Gateway',
            radius: 30,
            color: '#6366f1', // Indigo
            fx: 0,
            fy: 0
        });

        // 2. Create Cluster Hubs (Virtual nodes for visual grouping)
        const clusters = new Set<string>();

        scannedDevices.forEach(d => {
            if (d.ip === gatewayIp) return; // Skip if it's the gateway itself

            // Determine grouping category
            let category = 'Other';
            if (d.type && d.type !== 'Unknown') category = d.type;
            else if (d.vendor && d.vendor !== 'Unknown') {
                // Simple vendor grouping
                if (d.vendor.match(/apple|samsung|huawei/i)) category = 'Mobile';
                else if (d.vendor.match(/hikvision|dahua|axis/i)) category = 'Camera';
                else if (d.vendor.match(/intel|microsoft|dell|hp/i)) category = 'PC';
                else if (d.vendor.match(/synology|qnap/i)) category = 'Server';
                else category = 'IoT';
            }

            clusters.add(category);

            // Add Device Node
            nodes.push({
                id: d.ip,
                group: category,
                type: d.type || 'Unknown',
                ip: d.ip,
                mac: d.mac,
                vendor: d.vendor,
                isNew: d.isNew,
                label: d.hostname || d.ip,
                radius: d.isNew ? 12 : 10,
                color: d.isNew ? '#f43f5e' : (d.status === 'online' ? '#10b981' : '#64748b')
            });
        });

        // 3. Add Cluster Nodes and Links
        clusters.forEach(cluster => {
            const clusterId = `cluster-${cluster}`;
            // Add virtual hub node
            nodes.push({
                id: clusterId,
                group: 'hub',
                type: 'Hub',
                label: cluster,
                radius: 5, // Small invisible-ish hub
                color: '#94a3b8'
            });

            // Link Gateway -> Hub
            links.push({ source: 'gateway', target: clusterId, value: 2 });

            // Link Hub -> Devices in that cluster
            scannedDevices.forEach(d => {
                if (d.ip === gatewayIp) return;
                let dCategory = 'Other';
                if (d.type && d.type !== 'Unknown') dCategory = d.type;
                else if (d.vendor && d.vendor !== 'Unknown') {
                    if (d.vendor.match(/apple|samsung|huawei/i)) dCategory = 'Mobile';
                    else if (d.vendor.match(/hikvision|dahua|axis/i)) dCategory = 'Camera';
                    else if (d.vendor.match(/intel|microsoft|dell|hp/i)) dCategory = 'PC';
                    else if (d.vendor.match(/synology|qnap/i)) dCategory = 'Server';
                    else dCategory = 'IoT';
                }

                if (dCategory === cluster) {
                    links.push({ source: clusterId, target: d.ip, value: 1 });
                }
            });
        });

        return { nodes, links };
    }, [scannedDevices, iface]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current || data.nodes.length === 0 || viewType !== 'force') return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // Clear previous
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .style("cursor", "grab");

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        const g = svg.append("g");

        // Force Simulation
        const simulation = d3.forceSimulation<D3Node>(data.nodes)
            .force("link", d3.forceLink<D3Node, D3Link>(data.links).id(d => d.id).distance(d => (d.target as D3Node).group === 'hub' ? 100 : 50))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("collide", d3.forceCollide().radius(30))
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        // Draw Links
        const link = g.append("g")
            .attr("stroke", "var(--theme-border-primary)")
            .attr("stroke-opacity", 0.4)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value));

        // Draw Nodes
        const node = g.append("g")
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .attr("cursor", "pointer")
            .on("click", (event, d) => {
                event.stopPropagation();
                setSelectedNode(d);
            })
            // Drag behavior
            .call(d3.drag<any, any>()
                .on("start", (event: any, d: any) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                    svg.style("cursor", "grabbing");
                })
                .on("drag", (event: any, d: any) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event: any, d: any) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                    svg.style("cursor", "grab");
                })
            );

        // Node Circles
        node.append("circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d.color)
            .attr("stroke", d => d.isNew ? "#ef4444" : "#fff") // Red stroke for new, white for others
            .attr("stroke-width", d => d.isNew ? 3 : 2)
            .attr("stroke-dasharray", d => d.isNew ? "3,1" : "0") // Dashed for new
            .attr("class", "shadow-sm");

        // Labels
        node.append("text")
            .attr("dy", d => d.radius + 15)
            .attr("text-anchor", "middle")
            .text(d => d.group === 'hub' ? '' : d.label) // Don't label hubs
            .attr("font-size", "10px")
            .style("fill", "var(--theme-text-muted)")
            .style("pointer-events", "none")
            .style("user-select", "none");

        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as D3Node).x!)
                .attr("y1", d => (d.source as D3Node).y!)
                .attr("x2", d => (d.target as D3Node).x!)
                .attr("y2", d => (d.target as D3Node).y!);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        return () => {
            simulation.stop();
        };
    }, [data, iface]);

    return (
        <div ref={containerRef} className={`relative bg-theme-bg-primary overflow-hidden transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50' : 'h-full rounded-2xl border border-theme-border-secondary'}`}>
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button
                    onClick={() => onStartScan()}
                    disabled={isScanning}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transition-all ${isScanning ? 'bg-theme-bg-tertiary text-theme-text-muted' : 'bg-theme-brand-primary hover:bg-theme-brand-hover text-white'}`}
                >
                    {isScanning ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                    {isScanning ? `${t.scanning} ${progress}%` : t.scanNetwork}
                </button>
                <div className="bg-theme-bg-secondary rounded-lg shadow-lg border border-theme-border-primary flex items-center p-1">
                    <button onClick={() => setViewType('force')} className={`p-2 rounded transition-all ${viewType === 'force' ? 'bg-theme-bg-primary text-theme-brand-primary shadow-sm font-bold' : 'text-theme-text-muted hover:text-theme-text-primary'}`} title={t.mapView}>
                        <Orbit size={18} />
                    </button>
                    <button onClick={() => setViewType('tree')} className={`p-2 rounded transition-all ${viewType === 'tree' ? 'bg-theme-bg-primary text-theme-brand-primary shadow-sm font-bold' : 'text-theme-text-muted hover:text-theme-text-primary'}`} title={t.treeView}>
                        <ListTree size={18} />
                    </button>
                    <div className="w-px h-6 bg-theme-border-primary mx-1"></div>
                    <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 hover:bg-theme-bg-hover rounded text-theme-text-muted">
                        {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>
            </div>

            {/* Canvas / Tree */}
            {viewType === 'force' ? (
                <svg ref={svgRef} className="w-full h-full touch-none" />
            ) : (
                <div className="w-full h-full pt-20 pb-10 px-10 overflow-auto custom-scrollbar bg-theme-bg-tertiary">
                    <div className="max-w-4xl mx-auto bg-theme-bg-secondary p-8 rounded-2xl shadow-sm border border-theme-border-primary">
                        <div className="flex items-center gap-3 font-bold mb-8 text-xl text-theme-text-primary border-b border-theme-border-secondary pb-4">
                            <div className="p-2 bg-theme-brand-primary/10 text-theme-brand-primary rounded-xl">
                                <Network size={24} />
                            </div>
                            <span>Gateway ({iface?.gateway || '192.168.1.1'})</span>
                        </div>
                        <div className="pl-6 border-l-2 border-theme-border-primary/50 space-y-8 ml-4">
                            {Object.entries(data.nodes.filter(n => n.group !== 'gateway' && n.group !== 'hub').reduce((acc, node) => {
                                if (!acc[node.group]) acc[node.group] = [];
                                acc[node.group].push(node);
                                return acc;
                            }, {} as Record<string, D3Node[]>)).map(([category, nodes]) => (
                                <div key={category} className="space-y-4">
                                    <div className="flex items-center gap-2 font-bold text-theme-text-muted uppercase tracking-wider text-sm">
                                        <FolderTree size={16} /> {category} ({nodes.length})
                                    </div>
                                    <div className="pl-8 border-l-2 border-theme-border-secondary space-y-3 ml-2">
                                        {nodes.map(node => (
                                            <div
                                                key={node.id}
                                                className={`flex items-center gap-4 p-3 rounded-xl bg-theme-bg-primary border border-theme-border-primary hover:border-theme-brand-primary cursor-pointer transition-all shadow-sm hover:shadow-md ${selectedNode?.id === node.id ? 'ring-2 ring-theme-brand-primary border-transparent' : ''} ${node.isNew ? 'border-rose-500/50 hover:border-rose-500 bg-rose-500/5' : ''}`}
                                                onClick={() => setSelectedNode(node)}
                                            >
                                                <div className="w-4 h-4 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: node.color }}></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold flex items-center gap-2 text-theme-text-primary text-base">
                                                        {node.label}
                                                    </div>
                                                    <div className="text-sm font-mono text-theme-text-muted mt-0.5">{node.ip} <span className="text-theme-border-secondary opacity-50 px-1">•</span> {node.mac || 'Unknown MAC'}</div>
                                                </div>
                                                <div className="text-sm font-medium px-3 py-1 bg-theme-bg-tertiary rounded-lg text-theme-text-secondary border border-theme-border-primary">{node.vendor || 'Unknown'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Node Inspector */}
            {selectedNode && selectedNode.group !== 'gateway' && selectedNode.group !== 'hub' && (
                <div className="absolute top-4 right-4 w-64 bg-theme-bg-secondary rounded-xl shadow-2xl border border-theme-border-primary p-4 animate-in slide-in-from-right-4">
                    <button onClick={() => setSelectedNode(null)} className="absolute top-2 right-2 p-1 text-theme-text-muted hover:text-theme-text-primary"><Minimize2 size={14} /></button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md`} style={{ backgroundColor: selectedNode.color }}>
                            <Monitor size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-theme-text-primary truncate w-40">{selectedNode.label}</h3>
                            <p className="text-xs text-theme-text-muted">{selectedNode.ip}</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-theme-border-primary">
                            <span className="text-theme-text-muted">{t.macAddress}</span>
                            <span className="font-mono text-theme-text-secondary">{selectedNode.mac || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-theme-border-primary">
                            <span className="text-theme-text-muted">{t.vendor}</span>
                            <span className="font-medium text-theme-text-secondary">{selectedNode.vendor || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-theme-border-primary">
                            <span className="text-theme-text-muted">{t.type}</span>
                            <span className="font-medium text-theme-text-secondary">{selectedNode.type}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {onDiagnose && (
                            <button onClick={() => onDiagnose(selectedNode.ip!)} className="p-2 flex items-center justify-center gap-2 bg-theme-bg-tertiary text-theme-brand-primary border border-theme-border-primary rounded-lg hover:bg-theme-bg-hover transition-colors font-bold">
                                <Activity size={14} /> {t.pingTool}
                            </button>
                        )}
                        {onScanPorts && (
                            <button onClick={() => onScanPorts(selectedNode.ip!)} className="p-2 flex items-center justify-center gap-2 bg-theme-bg-tertiary text-amber-500 border border-theme-border-primary rounded-lg hover:bg-theme-bg-hover transition-colors font-bold">
                                <Search size={14} /> Ports
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => onSaveToProfile && onSaveToProfile({
                            ip: selectedNode.ip!,
                            mac: selectedNode.mac || '',
                            vendor: selectedNode.vendor || '',
                            hostname: selectedNode.label,
                            status: 'online',
                            type: selectedNode.type as any,
                            isNew: false
                        })}
                        className="w-full mt-2 p-2 flex items-center justify-center gap-2 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-lg transition-opacity font-bold"
                    >
                        <Save size={14} /> {t.saveToProfile}
                    </button>
                </div>
            )}

            {/* Legend / Overlay */}
            <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="bg-theme-bg-secondary/90 backdrop-blur p-3 rounded-xl border border-theme-border-primary shadow-sm text-xs space-y-2 pointer-events-auto">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-theme-brand-primary"></span>
                        <span className="text-theme-text-secondary">{t.gateway}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-theme-text-secondary">{t.onlineDevice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500 border-2 border-dashed border-rose-300"></span>
                        <span className="text-theme-text-secondary font-bold">{t.newDevice}</span>
                    </div>
                    <div className="text-[10px] text-theme-text-muted mt-2 pt-2 border-t border-theme-border-primary">
                        {t.mapHelp}
                    </div>
                </div>
            </div>
        </div>
    );
};
