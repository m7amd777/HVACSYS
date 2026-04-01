'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HVACSystemState, Schedule, Room, CoolingUnit, Damper } from './hvac-types';
import { generateInitialHVACState, simulateUpdate } from './hvac-mock-data';

interface HVACStore extends HVACSystemState {
  // Actions
  initialize: () => void;
  toggleAIOptimization: () => void;
  toggleSimulation: () => void;
  runSimulationTick: () => void;
  addSchedule: (schedule: Schedule) => void;
  removeSchedule: (id: string) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  updateCoolingUnit: (id: string, updates: Partial<CoolingUnit>) => void;
  updateDamper: (id: string, updates: Partial<Damper>) => void;
  acknowledgeIssue: (id: string) => void;
  resolveIssue: (id: string) => void;
  setTimeRange: (range: '1h' | '24h' | '7d') => void;
  refreshData: () => void;
  
  // UI State
  selectedRoomId: string | null;
  selectedCoolingUnitId: string | null;
  selectedDamperId: string | null;
  timeRange: '1h' | '24h' | '7d';
  highlightedRoomId: string | null;
  
  setSelectedRoom: (id: string | null) => void;
  setSelectedCoolingUnit: (id: string | null) => void;
  setSelectedDamper: (id: string | null) => void;
  setHighlightedRoom: (id: string | null) => void;
}

export const useHVACStore = create<HVACStore>()(
  persist(
    (set, get) => ({
      // Initial empty state
      coolingUnits: [],
      dampers: [],
      rooms: [],
      schedules: [],
      issues: [],
      maintenanceEvents: [],
      recommendations: [],
      kpis: {
        totalActiveRooms: 0,
        totalRooms: 0,
        coolingLoadPercentage: 0,
        estimatedEnergySavings: 0,
        averageComfortScore: 0,
        openIssuesCount: 0,
        predictedPeakDemandTime: new Date(),
      },
      utilizationHistory: [],
      lastUpdated: new Date(),
      aiOptimizationActive: true,
      simulationRunning: false,
      
      // UI State
      selectedRoomId: null,
      selectedCoolingUnitId: null,
      selectedDamperId: null,
      timeRange: '24h',
      highlightedRoomId: null,
      
      // Actions
      initialize: () => {
        const state = get();
        // Only initialize if not already loaded
        if (state.rooms.length === 0) {
          const initialState = generateInitialHVACState();
          set(initialState);
        }
      },
      
      toggleAIOptimization: () => {
        set(state => ({ aiOptimizationActive: !state.aiOptimizationActive }));
      },
      
      toggleSimulation: () => {
        set(state => ({ simulationRunning: !state.simulationRunning }));
      },
      
      runSimulationTick: () => {
        const state = get();
        if (state.simulationRunning) {
          const newState = simulateUpdate(state);
          set({
            rooms: newState.rooms,
            coolingUnits: newState.coolingUnits,
            dampers: newState.dampers,
            kpis: newState.kpis,
            lastUpdated: newState.lastUpdated,
          });
        }
      },
      
      addSchedule: (schedule) => {
        set(state => ({
          schedules: [...state.schedules, schedule],
        }));
      },
      
      removeSchedule: (id) => {
        set(state => ({
          schedules: state.schedules.filter(s => s.id !== id),
        }));
      },
      
      updateRoom: (id, updates) => {
        set(state => ({
          rooms: state.rooms.map(r => r.id === id ? { ...r, ...updates } : r),
        }));
      },
      
      updateCoolingUnit: (id, updates) => {
        set(state => ({
          coolingUnits: state.coolingUnits.map(u => u.id === id ? { ...u, ...updates } : u),
        }));
      },
      
      updateDamper: (id, updates) => {
        set(state => ({
          dampers: state.dampers.map(d => d.id === id ? { ...d, ...updates } : d),
        }));
      },
      
      acknowledgeIssue: (id) => {
        set(state => ({
          issues: state.issues.map(i => i.id === id ? { ...i, status: 'acknowledged' as const } : i),
        }));
      },
      
      resolveIssue: (id) => {
        set(state => ({
          issues: state.issues.map(i => i.id === id ? { ...i, status: 'resolved' as const } : i),
        }));
      },
      
      setTimeRange: (range) => {
        set({ timeRange: range });
      },
      
      refreshData: () => {
        const initialState = generateInitialHVACState();
        set(initialState);
      },
      
      // UI State setters
      setSelectedRoom: (id) => set({ selectedRoomId: id }),
      setSelectedCoolingUnit: (id) => set({ selectedCoolingUnitId: id }),
      setSelectedDamper: (id) => set({ selectedDamperId: id }),
      setHighlightedRoom: (id) => set({ highlightedRoomId: id }),
    }),
    {
      name: 'hvac-storage',
      partialize: (state) => ({
        schedules: state.schedules,
        aiOptimizationActive: state.aiOptimizationActive,
        timeRange: state.timeRange,
      }),
    }
  )
);
