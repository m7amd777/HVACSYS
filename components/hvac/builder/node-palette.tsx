"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import {
  Wind,
  Snowflake,
  Flame,
  Fan,
  Building2,
  Gauge,
  Zap,
  GripVertical,
} from "lucide-react";

interface NodeItem {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const nodeItems: NodeItem[] = [
  {
    type: "ahu",
    label: "Air Handler",
    description: "AHU for air distribution",
    icon: <Wind className="h-4 w-4" />,
    color: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  },
  {
    type: "chiller",
    label: "Chiller",
    description: "Cooling equipment",
    icon: <Snowflake className="h-4 w-4" />,
    color: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  },
  {
    type: "boiler",
    label: "Boiler",
    description: "Heating equipment",
    icon: <Flame className="h-4 w-4" />,
    color: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  },
  {
    type: "vav",
    label: "VAV Box",
    description: "Variable air volume",
    icon: <Fan className="h-4 w-4" />,
    color: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  },
  {
    type: "zone",
    label: "Zone",
    description: "Room or area",
    icon: <Building2 className="h-4 w-4" />,
    color: "bg-secondary text-foreground border-border",
  },
  {
    type: "sensor",
    label: "Sensor",
    description: "Temperature/humidity",
    icon: <Gauge className="h-4 w-4" />,
    color: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  },
  {
    type: "pump",
    label: "Pump",
    description: "Water circulation",
    icon: <Zap className="h-4 w-4" />,
    color: "bg-primary/20 text-primary border-primary/30",
  },
];

function DraggableNode({ item }: { item: NodeItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${item.type}`,
      data: {
        type: item.type,
        label: item.label,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 cursor-grab transition-all duration-200",
        item.color,
        isDragging
          ? "opacity-50 scale-95 cursor-grabbing"
          : "hover:scale-[1.02] hover:shadow-md"
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/50">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{item.label}</p>
        <p className="text-xs opacity-70">{item.description}</p>
      </div>
      <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
    </div>
  );
}

export function NodePalette() {
  return (
    <div className="w-64 border-r border-border bg-card/50 p-4 flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Components</h3>
        <p className="text-xs text-muted-foreground">
          Drag to add to canvas
        </p>
      </div>
      <div className="flex-1 space-y-2 overflow-auto">
        {nodeItems.map((item) => (
          <DraggableNode key={item.type} item={item} />
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Tip:</span> Connect
          nodes by dragging from one handle to another
        </p>
      </div>
    </div>
  );
}
