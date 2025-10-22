import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List } from 'lucide-react';

interface ViewSwitchProps {
  view: 'cards' | 'list';
  onViewChange: (view: 'cards' | 'list') => void;
}

export function ViewSwitch({ view, onViewChange }: ViewSwitchProps) {
  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(value) => value && onViewChange(value as 'cards' | 'list')}
      className="border rounded-lg"
      data-testid="view-switch"
    >
      <ToggleGroupItem value="cards" aria-label="Cards view" className="px-3">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view" className="px-3">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
