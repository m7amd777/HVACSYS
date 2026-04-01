'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from '@xyflow/react';

// Node data types
export interface CoolingUnitNodeData {
  type: 'cooling-unit';
  name: string;
  unitType: 'AHU' | 'FCU' | 'Chiller' | 'Split';
  utilization: number;
  efficiency: number;
  load: number;
  healthScore: number;
  maxCapacity: number;
  status: 'Healthy' | 'Attention Needed' | 'Maintenance Due' | 'Degraded';
  maintenanceDue: Date;
  warningFlags: string[];
}

export interface DamperNodeData {
  type: 'damper';
  name: string;
  openness: number;
  airflow: number;
  healthScore: number;
  actuatorStatus: 'Normal' | 'Slow Response' | 'Stuck' | 'Error';
  lastAdjustment: Date;
  warnings: string[];
}

export interface RoomNodeData {
  type: 'room';
  name: string;
  roomType: 'office' | 'meeting-room' | 'lab' | 'hallway' | 'classroom' | 'executive-office' | 'server-room' | 'lobby';
  currentTemp: number;
  targetTemp: number;
  occupancy: number;
  capacity: number;
  comfortScore: number;
  status: 'Inactive Cooling' | 'Comfort Cooling' | 'Expected to Start in a Bit' | 'Coolers Started' | 'Starting in 10 Minutes';
  airflow: number;
  issues: string[];
}

export type HVACNodeData = CoolingUnitNodeData | DamperNodeData | RoomNodeData;

export type HVACNode = Node<HVACNodeData>;
export type HVACEdge = Edge;

interface BuilderState {
  nodes: HVACNode[];
  edges: HVACEdge[];
  selectedNodeId: string | null;
  aiOverlayEnabled: boolean;
  simulationActive: boolean;
  
  // Actions
  onNodesChange: (changes: NodeChange<HVACNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: HVACNode) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  updateNodeData: (id: string, data: Partial<HVACNodeData>) => void;
  setSelectedNode: (id: string | null) => void;
  toggleAIOverlay: () => void;
  toggleSimulation: () => void;
  resetLayout: () => void;
  randomizeMetadata: () => void;
  saveLayout: () => void;
  loadLayout: () => void;
}

// Generate random metadata for nodes
const generateCoolingUnitData = (name: string): CoolingUnitNodeData => ({
  type: 'cooling-unit',
  name,
  unitType: (['AHU', 'FCU', 'Chiller', 'Split'] as const)[Math.floor(Math.random() * 4)],
  utilization: Math.floor(Math.random() * 40 + 50),
  efficiency: Math.floor(Math.random() * 25 + 70),
  load: Math.floor(Math.random() * 40 + 50),
  healthScore: Math.floor(Math.random() * 30 + 70),
  maxCapacity: Math.floor(Math.random() * 100 + 50),
  status: Math.random() > 0.8 ? 'Attention Needed' : 'Healthy',
  maintenanceDue: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
  warningFlags: Math.random() > 0.7 ? ['High load'] : [],
});

const generateDamperData = (name: string): DamperNodeData => ({
  type: 'damper',
  name,
  openness: Math.floor(Math.random() * 50 + 40),
  airflow: Math.floor(Math.random() * 600 + 400),
  healthScore: Math.floor(Math.random() * 20 + 80),
  actuatorStatus: Math.random() > 0.9 ? 'Slow Response' : 'Normal',
  lastAdjustment: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
  warnings: [],
});

const generateRoomData = (name: string): RoomNodeData => {
  const roomTypes: RoomNodeData['roomType'][] = ['office', 'meeting-room', 'lab', 'classroom', 'executive-office', 'server-room', 'lobby'];
  const statuses: RoomNodeData['status'][] = ['Inactive Cooling', 'Comfort Cooling', 'Expected to Start in a Bit', 'Coolers Started', 'Starting in 10 Minutes'];
  const currentTemp = Math.floor(Math.random() * 8 + 19);
  const targetTemp = Math.floor(Math.random() * 4 + 20);
  const capacity = Math.floor(Math.random() * 20 + 5);
  
  return {
    type: 'room',
    name,
    roomType: roomTypes[Math.floor(Math.random() * roomTypes.length)],
    currentTemp,
    targetTemp,
    occupancy: Math.floor(Math.random() * capacity),
    capacity,
    comfortScore: Math.max(40, 100 - Math.abs(currentTemp - targetTemp) * 15),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    airflow: Math.floor(Math.random() * 500 + 300),
    issues: Math.random() > 0.8 ? ['Temperature deviation'] : [],
  };
};

// Initial demo layout
const initialNodes: HVACNode[] = [
  {
    id: 'cu-1',
    type: 'coolingUnit',
    position: { x: 100, y: 200 },
    data: generateCoolingUnitData('CU-01'),
  },
  {
    id: 'cu-2',
    type: 'coolingUnit',
    position: { x: 100, y: 450 },
    data: generateCoolingUnitData('CU-02'),
  },
  {
    id: 'd-1',
    type: 'damper',
    position: { x: 350, y: 150 },
    data: generateDamperData('D-01'),
  },
  {
    id: 'd-2',
    type: 'damper',
    position: { x: 350, y: 300 },
    data: generateDamperData('D-02'),
  },
  {
    id: 'd-3',
    type: 'damper',
    position: { x: 350, y: 450 },
    data: generateDamperData('D-03'),
  },
  {
    id: 'r-1',
    type: 'room',
    position: { x: 600, y: 80 },
    data: generateRoomData('A-101'),
  },
  {
    id: 'r-2',
    type: 'room',
    position: { x: 600, y: 230 },
    data: generateRoomData('A-102'),
  },
  {
    id: 'r-3',
    type: 'room',
    position: { x: 600, y: 380 },
    data: generateRoomData('B-201'),
  },
  {
    id: 'r-4',
    type: 'room',
    position: { x: 600, y: 530 },
    data: generateRoomData('B-202'),
  },
];

const initialEdges: HVACEdge[] = [
  {
    id: 'e-cu1-d1',
    source: 'cu-1',
    target: 'd-1',
    animated: true,
    style: { stroke: 'hsl(220 80% 65%)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(220 80% 65%)' },
  },
  {
    id: 'e-cu1-d2',
    source: 'cu-1',
    target: 'd-2',
    animated: true,
    style: { stroke: 'hsl(220 80% 65%)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(220 80% 65%)' },
  },
  {
    id: 'e-cu2-d3',
    source: 'cu-2',
    target: 'd-3',
    animated: true,
    style: { stroke: 'hsl(220 80% 65%)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(220 80% 65%)' },
  },
  {
    id: 'e-d1-r1',
    source: 'd-1',
    target: 'r-1',
    animated: true,
    style: { stroke: 'hsl(165 80% 55%)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(165 80% 55%)' },
  },
  {
    id: 'e-d2-r2',
    source: 'd-2',
    target: 'r-2',
    animated: true,
    style: { stroke: 'hsl(165 80% 55%)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(165 80% 55%)' },
  },
  {
    id: 'e-d2-r3',
    source: 'd-2',
    target: 'r-3',
    animated: true,
    style: { stroke: 'hsl(165 80% 55%)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(165 80% 55%)' },
  },
  {
    id: 'e-d3-r4',
    source: 'd-3',
    target: 'r-4',
    animated: true,
    style: { stroke: 'hsl(165 80% 55%)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(165 80% 55%)' },
  },
];

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,
      selectedNodeId: null,
      aiOverlayEnabled: false,
      simulationActive: false,

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as HVACNode[],
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        const newEdge: HVACEdge = {
          ...connection,
          id: `e-${connection.source}-${connection.target}`,
          animated: true,
          style: { stroke: 'hsl(220 80% 65%)', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(220 80% 65%)' },
        };
        set({
          edges: addEdge(newEdge, get().edges),
        });
      },

      addNode: (node) => {
        set({
          nodes: [...get().nodes, node],
        });
      },

      deleteNode: (id) => {
        set({
          nodes: get().nodes.filter(n => n.id !== id),
          edges: get().edges.filter(e => e.source !== id && e.target !== id),
          selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
        });
      },

      deleteEdge: (id) => {
        set({
          edges: get().edges.filter(e => e.id !== id),
        });
      },

      updateNodeData: (id, data) => {
        set({
          nodes: get().nodes.map(n => 
            n.id === id ? { ...n, data: { ...n.data, ...data } as HVACNodeData } : n
          ),
        });
      },

      setSelectedNode: (id) => {
        set({ selectedNodeId: id });
      },

      toggleAIOverlay: () => {
        set({ aiOverlayEnabled: !get().aiOverlayEnabled });
      },

      toggleSimulation: () => {
        set({ simulationActive: !get().simulationActive });
      },

      resetLayout: () => {
        set({
          nodes: initialNodes,
          edges: initialEdges,
          selectedNodeId: null,
        });
      },

      randomizeMetadata: () => {
        set({
          nodes: get().nodes.map(node => {
            if (node.data.type === 'cooling-unit') {
              return { ...node, data: generateCoolingUnitData(node.data.name) };
            } else if (node.data.type === 'damper') {
              return { ...node, data: generateDamperData(node.data.name) };
            } else if (node.data.type === 'room') {
              return { ...node, data: generateRoomData(node.data.name) };
            }
            return node;
          }),
        });
      },

      saveLayout: () => {
        // Layout is auto-saved via persist middleware
        console.log('Layout saved');
      },

      loadLayout: () => {
        // Layout is auto-loaded via persist middleware
        console.log('Layout loaded');
      },
    }),
    {
      name: 'hvac-builder-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        aiOverlayEnabled: state.aiOverlayEnabled,
      }),
      // Merge persisted state with initial state, validating node positions
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<BuilderState> | undefined;
        
        // Validate and fix nodes - ensure all have valid positions
        const validatedNodes = (persisted?.nodes || currentState.nodes).map((node, index) => {
          // Ensure position exists and has valid x/y values
          if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
            return {
              ...node,
              position: { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 150 },
            };
          }
          return node;
        });

        return {
          ...currentState,
          ...persisted,
          nodes: validatedNodes as HVACNode[],
          edges: persisted?.edges || currentState.edges,
        };
      },
    }
  )
);

// Counter for generating unique IDs
let nodeCounter = 100;

export function generateNodeId(type: string): string {
  nodeCounter++;
  return `${type}-${nodeCounter}`;
}

export function generateNodeName(type: 'cooling-unit' | 'damper' | 'room', existingNodes: HVACNode[]): string {
  const prefix = type === 'cooling-unit' ? 'CU' : type === 'damper' ? 'D' : 'R';
  const existingNames = existingNodes
    .filter(n => n.data.type === type)
    .map(n => n.data.name);
  
  let num = 1;
  while (existingNames.includes(`${prefix}-${String(num).padStart(2, '0')}`)) {
    num++;
  }
  
  return `${prefix}-${String(num).padStart(2, '0')}`;
}
