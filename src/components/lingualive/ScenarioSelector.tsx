"use client";

import type { ScenarioOption } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ListChecks } from 'lucide-react'; // Generic icon for scenario selection

interface ScenarioSelectorProps {
  scenarios: ScenarioOption[];
  selectedScenario: string;
  onSelectScenario: (scenario: string) => void;
  disabled?: boolean;
}

export function ScenarioSelector({
  scenarios,
  selectedScenario,
  onSelectScenario,
  disabled = false,
}: ScenarioSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="scenario-select" className="flex items-center text-base">
        <ListChecks className="mr-2 h-5 w-5 text-primary" />
        Select a Scenario
      </Label>
      <Select
        value={selectedScenario}
        onValueChange={onSelectScenario}
        disabled={disabled}
      >
        <SelectTrigger id="scenario-select" className="w-full text-base py-3 h-auto rounded-lg shadow-sm">
          <SelectValue placeholder="Select a scenario..." />
        </SelectTrigger>
        <SelectContent>
          {scenarios.map((scenario) => (
            <SelectItem key={scenario.value} value={scenario.value} className="text-base py-2">
              <div className="flex items-center">
                <scenario.Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {scenario.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
