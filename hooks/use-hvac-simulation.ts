"use client";

import { useEffect, useCallback, useRef } from "react";
import { useHvacStore } from "@/lib/hvac-store";
import { generateTimeSeriesData, generateUtilizationData } from "@/lib/hvac-mock-data";

export function useHvacSimulation() {
  const {
    rooms,
    isSimulating,
    simulationSpeed,
    updateRoom,
    setTimeSeriesData,
    setUtilizationData,
  } = useHvacStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runSimulationTick = useCallback(() => {
    // Update room temperatures based on HVAC state and occupancy
    rooms.forEach((room) => {
      const targetTemp = room.setpoint;
      const currentTemp = room.currentTemp;
      const hvacMode = room.hvacMode;
      
      let tempDelta = 0;
      
      // Natural drift based on occupancy (more people = warmer)
      const occupancyHeat = (room.occupancy / room.capacity) * 0.3;
      
      // HVAC effect
      if (hvacMode === "cooling" && currentTemp > targetTemp) {
        tempDelta = -0.5 - Math.random() * 0.3;
      } else if (hvacMode === "heating" && currentTemp < targetTemp) {
        tempDelta = 0.5 + Math.random() * 0.3;
      } else if (hvacMode === "auto") {
        if (currentTemp > targetTemp + 1) {
          tempDelta = -0.4 - Math.random() * 0.2;
        } else if (currentTemp < targetTemp - 1) {
          tempDelta = 0.4 + Math.random() * 0.2;
        }
      }
      
      // Add natural variation and occupancy heat
      tempDelta += (Math.random() - 0.5) * 0.2 + occupancyHeat;
      
      // Calculate new temperature
      const newTemp = Math.round((currentTemp + tempDelta) * 10) / 10;
      
      // Update humidity based on HVAC mode
      let humidityDelta = (Math.random() - 0.5) * 2;
      if (hvacMode === "cooling") {
        humidityDelta -= 1;
      }
      const newHumidity = Math.max(
        30,
        Math.min(70, Math.round(room.humidity + humidityDelta))
      );
      
      // Update CO2 based on occupancy
      const co2Target = 400 + (room.occupancy / room.capacity) * 600;
      const co2Delta = (co2Target - room.co2) * 0.1 + (Math.random() - 0.5) * 20;
      const newCo2 = Math.max(
        350,
        Math.min(1200, Math.round(room.co2 + co2Delta))
      );
      
      // Update energy consumption
      let energyFactor = 0.5;
      if (hvacMode === "cooling" || hvacMode === "heating") {
        energyFactor = Math.abs(currentTemp - targetTemp) * 0.2 + 0.5;
      }
      const newEnergy = Math.round((1 + Math.random() * 2) * energyFactor * 10) / 10;
      
      // Determine new status
      let newStatus: typeof room.status = "optimal";
      const tempDiff = Math.abs(newTemp - targetTemp);
      if (tempDiff > 3 || newCo2 > 1000) {
        newStatus = "critical";
      } else if (tempDiff > 2 || newCo2 > 800 || newHumidity > 60) {
        newStatus = "warning";
      } else if (tempDiff < 1 && newCo2 < 600) {
        newStatus = "optimal";
      }
      
      // Random occupancy changes
      let newOccupancy = room.occupancy;
      if (Math.random() > 0.7) {
        const occupancyChange = Math.floor((Math.random() - 0.5) * 4);
        newOccupancy = Math.max(
          0,
          Math.min(room.capacity, room.occupancy + occupancyChange)
        );
      }
      
      updateRoom(room.id, {
        currentTemp: newTemp,
        humidity: newHumidity,
        co2: newCo2,
        energyUsage: newEnergy,
        status: newStatus,
        occupancy: newOccupancy,
      });
    });
    
    // Periodically regenerate chart data
    if (Math.random() > 0.8) {
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      setTimeSeriesData(generateTimeSeriesData(hours));
    }
    
    if (Math.random() > 0.9) {
      setUtilizationData(generateUtilizationData());
    }
  }, [rooms, updateRoom, setTimeSeriesData, setUtilizationData]);

  useEffect(() => {
    if (isSimulating) {
      // Base interval is 2000ms at 1x speed
      const interval = 2000 / simulationSpeed;
      intervalRef.current = setInterval(runSimulationTick, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSimulating, simulationSpeed, runSimulationTick]);

  return {
    isRunning: isSimulating,
  };
}
