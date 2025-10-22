import { Badge } from '@/components/ui/badge';
import { DisciplineCount, Discipline } from '@/types';
import { Building2, Zap, Cog } from 'lucide-react';

interface DisciplineChipsProps {
  disciplines: DisciplineCount[];
  selected: Discipline | null;
  onSelect: (discipline: Discipline | null) => void;
}

const disciplineIcons = {
  Civil: Building2,
  Elétrica: Zap,
  Mecânica: Cog,
};

export function DisciplineChips({ disciplines, selected, onSelect }: DisciplineChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {disciplines.map((disc) => {
        const Icon = disciplineIcons[disc.name];
        const isSelected = selected === disc.name;
        
        return (
          <Badge
            key={disc.name}
            variant={isSelected ? 'default' : 'secondary'}
            className="cursor-pointer px-4 py-2 text-sm rounded-full transition-all hover:scale-105"
            onClick={() => onSelect(isSelected ? null : disc.name)}
          >
            <Icon className="h-4 w-4 mr-1.5" />
            {disc.name}
            <span className="ml-2 font-bold">{disc.count}</span>
          </Badge>
        );
      })}
    </div>
  );
}
