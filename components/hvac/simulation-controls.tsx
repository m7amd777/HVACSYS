"use client";

import { useHvacStore } from "@/lib/hvac-store";
import { useHvacSimulation } from "@/hooks/use-hvac-simulation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Play, Pause, RotateCcw, Settings2, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

export function SimulationControls() {
  const {
    isSimulating,
    simulationSpeed,
    toggleSimulation,
    setSimulationSpeed,
    resetToDefaults,
  } = useHvacStore();
  
  // Hook into simulation
  useHvacSimulation();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-2 py-1.5 shadow-xl backdrop-blur-sm">
        {/* Play/Pause */}
        <Button
          variant={isSimulating ? "default" : "ghost"}
          size="sm"
          onClick={toggleSimulation}
          className={cn(
            "h-9 gap-2 rounded-full",
            isSimulating && "bg-success hover:bg-success/90 text-background"
          )}
        >
          {isSimulating ? (
            <>
              <Pause className="h-4 w-4" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Simulate</span>
            </>
          )}
        </Button>

        {/* Status indicator */}
        {isSimulating && (
          <Badge
            variant="outline"
            className="animate-pulse bg-success/10 text-success border-success/30 gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Live
          </Badge>
        )}

        <div className="h-5 w-px bg-border" />

        {/* Speed control */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-full">
              <Gauge className="h-4 w-4" />
              <span className="hidden sm:inline">{simulationSpeed}x</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="center">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Simulation Speed</span>
                <Badge variant="secondary">{simulationSpeed}x</Badge>
              </div>
              <Slider
                value={[simulationSpeed]}
                onValueChange={([v]) => setSimulationSpeed(v)}
                min={0.5}
                max={4}
                step={0.5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5x</span>
                <span>1x</span>
                <span>2x</span>
                <span>4x</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset */}
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          className="h-9 w-9 rounded-full p-0"
          title="Reset simulation"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="h-5 w-px bg-border" />

        {/* Info tooltip */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-full p-0"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <h4 className="font-medium">Simulation Info</h4>
              <p className="text-sm text-muted-foreground">
                The simulation updates room temperatures, humidity, CO2 levels,
                and energy consumption based on HVAC settings and occupancy
                patterns.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Update interval</span>
                  <span>{Math.round(2000 / simulationSpeed)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode</span>
                  <span>{isSimulating ? "Running" : "Paused"}</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
