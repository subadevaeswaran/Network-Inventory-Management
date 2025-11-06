// src/components/Topology.jsx
import React, { useState, useEffect , useCallback} from 'react'; // <-- Import React if not already
import { Network, Radio, Wifi , HomeIcon , Shuffle , RouterIcon} from 'lucide-react'; // Keep icons
import apiClient from '../api/apiClient'; // <-- Import apiClient
import { toast } from 'react-toastify';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType, // For arrowheads if needed
  Handle,     // <-- Import Handle
  Position,
} from 'reactflow';

import 'reactflow/dist/style.css'; // Default styles

const nodeWidth = 150;
const nodeHeight = 80;
const horizontalGap = 150;
const verticalGap = 70;

// --- Custom Node Components (Optional but Recommended) ---
// Simple styled divs based on type
const CustomNode = ({ data, selected }) => { // <-- React Flow passes 'selected' prop
    let bgColor = 'bg-gray-200';
    let icon = null;
    let nameStyle = 'text-gray-800 font-medium text-md';
    let borderStyle = 'border-transparent'; // Default border

    // --- Determine Base Styles ---
    switch (data.type) {
        case 'Headend':
            bgColor = 'bg-blue-600 text-white';
            icon = <Network className="w-4 h-4 mr-1 inline-block" />;
            nameStyle = 'text-white font-semibold text-md';
            break;
        case 'FDH':
            bgColor = 'bg-blue-400 text-white';
            icon = <Radio className="w-4 h-4 mr-2 inline-block" />;
            nameStyle = 'text-white font-medium text-md';
            break;
        case 'Splitter':
            bgColor = 'bg-sky-200 text-sky-800';
            icon = <Shuffle className="w-6 h-6 mr-1 inline-block" />;
            break;
        case 'House':
            bgColor = 'bg-gray-100 border border-gray-300'; // Keep base border
            icon = <RouterIcon className="w-4 h-4 mr-1 inline-block text-gray-600" />;
            nameStyle = 'text-gray-700 text-sm';
             // Add status border color if applicable
             if (data.details?.status === 'ACTIVE') {
                 borderStyle = 'border-green-800';
             } else if (data.details?.status === 'PENDING' || data.details?.status === 'Warning') { // Handle Warning too
                 borderStyle = 'border-yellow-500';
             }
            break;
    }

    // --- Add Selected Style ---
    if (selected) {
        borderStyle = 'border-blue-700 border-2 shadow-lg'; // Add thicker border and shadow for selected
    }
    

    return (
       // Add Handle components INSIDE the main div
       <div className={`p-4 rounded shadow-md border ${bgColor} ${borderStyle} 
                       hover:opacity-60 transition-opacity duration-150 cursor-pointer`} // <-- ADD HOVER EFFECT HERE
             style={{ width: nodeWidth, height: nodeHeight }}>
            {/* --- Add Handles --- */}
            {/* Target handle (incoming connections) on the Left */}
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: '#555', width: '8px', height: '8px', left: '-4px' }} // Optional styling
                isConnectable={false} // Make read-only
            />

             {/* Node Content */}
            <div className="flex items-center text-md mb-1 font-semibold">{icon}{data.type}</div>
            <div className={nameStyle + ' truncate'} title={data.name}>{data.name}</div>

             {/* Source handle (outgoing connections) on the Right */}
             {/* Only add source handle if node actually has children */}
             {data.children && data.children.length > 0 && (
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{ background: '#555', width: '8px', height: '8px', right: '-4px' }} // Optional styling
                    isConnectable={false} // Make read-only
                />
             )}
             {/* --------------- */}
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode, // Register custom node
};


const defaultPositions = {
    Headend: { x: 60, y: 200 },
    FDH: { x: 250, y_start: 50, y_gap: 150 },
    Splitter: { x: 440, y_start: 60, y_gap: 60},
    House: { x: 630, y_start: 40, y_gap: 120 },
    // ONT: { x: 630, y_start: 40, y_gap: 20 }, // ONTs omitted for now
};

// Function to add calculated positions (basic layout)
// Function to add calculated positions
const calculatePositions = (nodes) => {
    let headendCount = 0;
    let fdhCounts = {};
    let splitterCounts = {};
    let houseCounts = {}; // Reset counts for each calculation

    if (!Array.isArray(nodes)) return [];

    // Pre-calculate parent references AND children counts per type
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const parentMap = new Map();
    const childrenCounts = {}; // Stores counts like { splitterId: { House: 2 } }

    nodes.forEach(node => {
        childrenCounts[node.id] = { FDH: 0, Splitter: 0, House: 0 }; // Initialize counts
        node.children?.forEach(childId => {
            parentMap.set(childId, node.id);
            const childNode = nodeMap.get(childId);
            if (childNode) {
                // Increment count for the specific child type under this parent
                if (childrenCounts[node.id][childNode.type] !== undefined) {
                    childrenCounts[node.id][childNode.type]++;
                }
            }
        });
    });


    const calculatedNodes = nodes.map(node => {
        let position = { x: 0, y: 0 };
        switch(node.type) {
            case 'Headend':
                position = { x: defaultPositions.Headend.x, y: defaultPositions.Headend.y + (headendCount * 200) };
                fdhCounts[node.id] = 0; // Initialize FDH index count
                headendCount++;
                break;
            case 'FDH':
                 const parentHeadendId = parentMap.get(node.id);
                 const parentHeadend = parentHeadendId ? nodeMap.get(parentHeadendId) : null;
                 const headendY = parentHeadend?.y ?? defaultPositions.Headend.y;
                 const fdhIndex = parentHeadend ? fdhCounts[parentHeadend.id]++ : 0;
                 // Use pre-calculated children count
                 const numFdhs = parentHeadend ? childrenCounts[parentHeadend.id]?.FDH || 1 : 1;
                 const totalFdhHeight = (numFdhs - 1) * defaultPositions.FDH.y_gap;
                 const fdhStartY = headendY - (totalFdhHeight / 2);
                 position = { x: defaultPositions.FDH.x, y: fdhStartY + (fdhIndex * defaultPositions.FDH.y_gap) };
                 splitterCounts[node.id] = 0; // Initialize Splitter index count
                break;
            case 'Splitter':
                 const parentFdhId = parentMap.get(node.id);
                 const parentFdh = parentFdhId ? nodeMap.get(parentFdhId) : null;
                 if (parentFdh && parentFdh.y !== undefined) {
                     const fdhY = parentFdh.y;
                     const splitterIndex = splitterCounts[parentFdh.id]++;
                     // Use pre-calculated children count
                     const numSplitters = parentFdh ? childrenCounts[parentFdh.id]?.Splitter || 1 : 1;
                     const totalSplitterHeight = (numSplitters - 1) * defaultPositions.Splitter.y_gap;
                     const startYOffset = fdhY - (totalSplitterHeight / 2);
                     position = { x: defaultPositions.Splitter.x, y: startYOffset + (splitterIndex * defaultPositions.Splitter.y_gap) };
                     houseCounts[node.id] = 0; // Initialize House index count for THIS splitter
                 } else {
                     position = { x: defaultPositions.Splitter.x, y: defaultPositions.Splitter.y_start };
                 }
                break;
            case 'House':
                const parentSplitterId = parentMap.get(node.id);
                const parentSplitter = parentSplitterId ? nodeMap.get(parentSplitterId) : null;
                if (parentSplitter && parentSplitter.y !== undefined) {
                    const splitterY = parentSplitter.y;
                    // --- **FIX**: Use houseCounts specific to the parent splitter ID ---
                    const houseIndex = houseCounts[parentSplitter.id]++; // Index relative ONLY to this splitter
                    // Use pre-calculated children count for THIS splitter
                    const numHouses = parentSplitter ? childrenCounts[parentSplitter.id]?.House || 1 : 1;
                    // -----------------------------------------------------------------

                    // Center houses around splitter vertically
                    const totalHouseHeight = (numHouses - 1) * defaultPositions.House.y_gap;
                    const startYOffset = splitterY - (totalHouseHeight / 2);
                    position = {
                        x: defaultPositions.House.x,
                        y: startYOffset + (houseIndex * defaultPositions.House.y_gap)
                    };
                } else {
                    position = { x: defaultPositions.House.x, y: defaultPositions.House.y_start }; // Fallback
                }
                break;
            default: break;
        }
        position.x = Number.isFinite(position.x) ? position.x : 0;
        position.y = Number.isFinite(position.y) ? position.y : 0;
        // Update the node in the nodeMap immediately
        nodeMap.set(node.id, { ...node, x: position.x, y: position.y });
        return { ...node, x: position.x, y: position.y };
    });

    // Remove the collision nudge for now, let's see if proper indexing fixes it
    // ...

    return calculatedNodes;
};

export function Topology() {
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // State for selected node, hovered node, and filters
  const [isLoading, setIsLoading] = useState(false);
  const [topologyData, setTopologyData] = useState([]); // <-- State for fetched data
  const [cities, setCities] = useState([]); // <-- State for city list
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null); // No type needed in JS
   const [cityFilter, setCityFilter] = useState('all'); // <-- Renamed from regionFilter
  
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [svgHeight, setSvgHeight] = useState(500);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const svgTopPadding = 20; // Define padding used in transform
  const svgBottomPadding = 20;



  // --- Fetch Cities on Mount ---
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await apiClient.get('/headends/cities'); // Call your endpoint
        setCities(response.data); // Store the fetched city names
      } catch (error) {
        console.error("Failed to fetch cities:", error);
        toast.error("Could not load city list for filtering.");
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, []); // Empty dependency array means run once on mount

  // --- **NEW**: Fetch Topology Data based on City Filter ---
  // --- Fetch Topology Data & Calculate Height ---
  useEffect(() => {
    const fetchTopology = async () => {
      setIsLoading(true);
      setSelectedNodeData(null);
      
      
      setNodes([]);
      setEdges([]);
try {
        const response = await apiClient.get('/topology', {
            params: { city: cityFilter === 'all' ? undefined : cityFilter }
        });

        const backendNodes = response.data;
        console.log("Fetched Backend Nodes:", backendNodes);
        if (!Array.isArray(backendNodes) || backendNodes.length === 0) {
            // Handle empty or invalid data
            setNodes([]);
            setEdges([]);
            toast.info(`No topology data found for '${cityFilter}'.`);
            return; // Exit if no data
        }

        const rfNodes = [];
        const rfEdges = [];
        const nodeMap = new Map(backendNodes.map(n => [n.id, n])); // Map for quick lookup

        // Basic layout calculation (Tree structure using levels)
        const levels = {}; // { 0: [headend], 1: [fdh], 2: [splitter], 3: [house] }
        const assignLevel = (nodeId, level) => {
            const node = nodeMap.get(nodeId);
            if (!node) return;
            if (!levels[level]) levels[level] = [];
            if (!levels[level].find(n => n.id === node.id)) { // Avoid duplicates
                 levels[level].push(node);
            }
            node.children?.forEach(childId => assignLevel(childId, level + 1));
        };

        // Find root nodes (Headends) and start assigning levels
        backendNodes.filter(n => n.type === 'Headend').forEach(headend => assignLevel(headend.id, 0));

        // Calculate positions based on levels
        Object.keys(levels).forEach(levelStr => {
            const level = parseInt(levelStr, 10);
            const nodesInLevel = levels[level];
            const levelYGap = verticalGap + nodeHeight; // Vertical space per node in level
            const totalLevelHeight = (nodesInLevel.length - 1) * levelYGap;
            const startY = (360 / 2) - (totalLevelHeight / 2); // Center level vertically (adjust 360 if needed)

            nodesInLevel.forEach((node, index) => {
                 // Check if node already processed (can happen with complex graphs, less likely in tree)
                 if (rfNodes.find(n => n.id === node.id)) return;

                 const calculatedPosition = {
                    x: level * (nodeWidth + horizontalGap),
                    y: startY + (index * levelYGap)
                 };

                 rfNodes.push({
                    id: node.id,
                    type: 'custom', // Use our custom node
                    position: calculatedPosition,
                    data: node, // Store original backend data here
                 });

                 // Create edges from this node to its children
                 console.log(`Processing node ${node.id}, children:`, node.children); 
                 node.children?.forEach(childId => {
                     // Check if child exists in the map (it should)
                     if (nodeMap.has(childId)) {
                        const newEdge = { // Create edge object
                            id: `e-${node.id}-${childId}`,
                            source: node.id, // Parent node ID
                            target: childId, // Child node ID
                            type: 'smoothstep',
                             markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#A0AEC0' },
                             style: { stroke: '#CBD5E1', strokeWidth: 1.5 },
                         };
                         console.log("Creating Edge:", newEdge); // <-- LOG 3: Check created edge
                         rfEdges.push(newEdge); // Add edge to array
                     } else {
                         console.warn(`Child node ${childId} for parent ${node.id} not found.`);
                     }
                 });
            });
        });
        console.log("Final Nodes for ReactFlow:", rfNodes); // <-- LOG 4: Check final nodes
        console.log("Final Edges for ReactFlow:", rfEdges);
        setNodes(rfNodes);
        setEdges(rfEdges);
        // Select first headend if available
        if (rfNodes.length > 0) {
            setSelectedNodeData(rfNodes.find(n => n.data.type === 'Headend')?.data || rfNodes[0].data);
        }

      } catch (error) {
        console.error("Failed to fetch topology:", error);
        toast.error("Could not load topology data.");
        setNodes([]);
        setEdges([]);
      }
      finally { setIsLoading(false); }
    };
    fetchTopology();
  }, [cityFilter,setNodes, setEdges]);

  // --- Filter Nodes based on City ---
//   useEffect(() => {
//     if (cityFilter === 'all') {
//       setFilteredNodes(selectedNode); // Show all if 'all' selected
//       setSelectedNode(selectedNode.find(n => n.type === 'Headend') || null); // Select first headend or null
//     } else {
//       // Filter nodes to include only those matching the city
//       const cityNodes = selectedNode.filter(node => node.city === cityFilter);
//       setFilteredNodes(cityNodes);
//       // Select the headend for the filtered city, or null if none found
//       setSelectedNode(cityNodes.find(n => n.type === 'Headend') || null);
//     }
//     setHoveredNode(null); // Clear hover on filter change
//   }, [cityFilter]); // Re-run when cityFilter changes

//   // Helper for status badge styling
//   const getStatusBadgeClasses = (status) => {
//     switch (status) {
//       case "Active": return "bg-green-100 text-green-800 border-green-200";
//       case "Warning": return "bg-amber-100 text-amber-800 border-amber-200";
//       case "Fault": return "bg-red-100 text-red-800 border-red-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

const onNodeClick = useCallback((event, node) => {
  console.log("Node clicked:", node)
    setSelectedNodeData(node.data); // Set selected data from the clicked node
    console.log("Setting selectedNodeData:", node.data);
  }, []);

  const findNodeById = (id) => topologyData.find(n => n.id === id);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Network Topology Visualization</h2>
        <p className="text-sm text-gray-600">Interactive view of network infrastructure</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4"> {/* Use flex-wrap for smaller screens */}
       
       {/* --- City Filter Select (Updated) --- */}
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          disabled={isLoadingCities} // Disable while loading
          className="w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
        >
          <option value="all">All Cities</option>
          {/* Map over the fetched cities state */}
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {/* Device Type Filter Select */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Devices</option>
          <option value="fdh">FDH Only</option>
          <option value="splitter">Splitters Only</option>
          <option value="ont">ONTs Only</option>
        </select>
        {/* Status Filter Select */}
        <select
           value={statusFilter}
           onChange={(e) => setStatusFilter(e.target.value)}
           className="w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="warning">Warning</option>
          <option value="fault">Fault</option>
        </select>
      </div>

      {/* Main Grid: Topology Diagram + Details Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

        {/* --- React Flow Diagram Card --- */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-600" />
              Network Tree View {cityFilter !== 'all' ? `(${cityFilter})` : ''}
            </h3>
          </div>
          {/* Set a fixed height for the React Flow container */}
          <div className="h-[60vh] w-full border-t border-gray-200"> {/* Adjust height as needed */}
             {isLoading ? (
                  <div className="flex justify-center items-center h-full"><p className="text-gray-500">Loading Topology...</p></div>
              ) : (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange} // Handles node dragging/selection internally
                  onEdgesChange={onEdgesChange} // Handles edge changes internally
                  // onConnect={onConnect} // Use if you need edge creation
                  onNodeClick={onNodeClick} // Update details panel on click
                  nodeTypes={nodeTypes} // Register custom nodes
                  fitView // Zooms/pans to fit nodes initially
                  fitViewOptions={{ padding: 0.1 }} // Padding for fitView
                >
                  <Background color="#000000" variant="dots" gap={16} size={0.5} />
                  <Controls />
                </ReactFlow>
              )}
          </div>
        </div>

        {/* Node Details Panel Card (using styled div) */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow border border-gray-200"> {/* Added self-start */}
          {/* Card Header */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Node Details</h3>
          </div>
        {/* Card Content */}
          <div className="p-4 md:p-6 space-y-4">
            {selectedNodeData ? (
             <>
                {/* Details Header (Icon, Name, Type) */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                   {selectedNodeData.type === "Headend" && <Network className="h-7 w-7 text-blue-600 flex-shrink-0" />}
                   {selectedNodeData.type === "FDH" && <Radio className="h-7 w-7 text-blue-500 flex-shrink-0" />}
                   {selectedNodeData.type === "Splitter" && <Wifi className="h-7 w-7 text-blue-400 flex-shrink-0" />}
                   {selectedNodeData.type === "House" && <RouterIcon className="h-7 w-7 text-gray-600 flex-shrink-0" />} {/* Import HomeIcon from lucide */}
                   {/* Add ONT icon if needed */}
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-800 truncate">{selectedNodeData.name}</h3>
                    <span className="mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium border border-gray-300 bg-gray-50 text-gray-600">
                      {selectedNodeData.type}
                    </span>
                  </div>
                </div>

                {/* Details Section (Details map, Children list) */}
                <div className="space-y-3 text-sm">
                  {selectedNodeData.details && Object.entries(selectedNodeData.details).map(([key, value]) => (
                      value && <div key={key}>
                          <p className="text-xs font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-gray-800">{value}</p>
                      </div>
                  ))}
                  {/* Display Children IDs */}
                  {selectedNodeData.children && selectedNodeData.children.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Connected Device IDs ({selectedNodeData.children.length})</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-2 text-xs">
                        {selectedNodeData.children.map((childId) => (
                           // Find child data within the current nodes state for display name (optional)
                           // For now, just show ID
                            <div key={childId} className="bg-gray-100 p-1.5 rounded border border-gray-200 truncate" title={childId}>
                               {childId}
                            </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div><p className="text-xs font-medium text-gray-500">Last Update</p><p className="text-gray-800">2025-10-24 14:32</p></div>
                </div>
              </>
            ) : (
                <p className="text-sm text-gray-500">Click on a node in the diagram to view details.</p>
            )}
    
            
            {/* Legend (using simpler divs) */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#3B82F6]"></span>Headend</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#60A5FA]"></span>FDH</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#93C5FD]"></span>Splitter</span>
                {/* Add ONT legend if needed */}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}