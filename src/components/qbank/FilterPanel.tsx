import { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  onFiltersChange: (filters: {
    subjects: string[];
    systems: string[];
    difficulties: string[];
    specialtyIds: string[];
    questionStatus: 'unused' | 'incorrect' | 'flagged' | 'all';
  }) => void;
}

interface Specialty {
  id: string;
  name: string;
}

const SUBJECTS = [
  'Pathophysiology',
  'Pharmacology',
  'Physiology',
  'Anatomy',
  'Biochemistry',
  'Microbiology',
  'Immunology',
  'Behavioral Science',
  'Biostatistics',
];

const SYSTEMS = [
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Renal',
  'Endocrine',
  'Nervous',
  'Musculoskeletal',
  'Hematologic',
  'Reproductive',
  'Dermatologic',
  'Multisystem',
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'hard', label: 'Hard', color: 'text-red-400' },
];

const QUESTION_STATUS = [
  { value: 'all', label: 'All Questions' },
  { value: 'unused', label: 'Unused Only' },
  { value: 'incorrect', label: 'Previously Incorrect' },
  { value: 'flagged', label: 'Flagged/Bookmarked' },
];

export default function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [questionStatus, setQuestionStatus] = useState<'unused' | 'incorrect' | 'flagged' | 'all'>('all');

  const [openSections, setOpenSections] = useState({
    status: true,
    subjects: true,
    systems: true,
    difficulties: true,
    specialties: false,
  });

  useEffect(() => {
    const fetchSpecialties = async () => {
      const { data } = await supabase.from('specialties').select('id, name').order('name');
      if (data) setSpecialties(data);
    };
    fetchSpecialties();
  }, []);

  useEffect(() => {
    onFiltersChange({
      subjects: selectedSubjects,
      systems: selectedSystems,
      difficulties: selectedDifficulties,
      specialtyIds: selectedSpecialties,
      questionStatus,
    });
  }, [selectedSubjects, selectedSystems, selectedDifficulties, selectedSpecialties, questionStatus, onFiltersChange]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleItem = (
    item: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const selectAll = (items: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelected(items);
  };

  const clearAll = (setSelected: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      {/* Question Status */}
      <Collapsible open={openSections.status} onOpenChange={() => toggleSection('status')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-lg border border-border hover:bg-accent">
          <span className="font-medium text-foreground">Question Status</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', openSections.status && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2 p-3 bg-card/50 rounded-lg border border-border">
            {QUESTION_STATUS.map((status) => (
              <label
                key={status.value}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                  questionStatus === status.value ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    questionStatus === status.value ? 'border-primary bg-primary' : 'border-muted-foreground'
                  )}
                >
                  {questionStatus === status.value && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span className="text-sm text-foreground">{status.label}</span>
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Difficulty */}
      <Collapsible open={openSections.difficulties} onOpenChange={() => toggleSection('difficulties')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-lg border border-border hover:bg-accent">
          <span className="font-medium text-foreground">
            Difficulty {selectedDifficulties.length > 0 && `(${selectedDifficulties.length})`}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', openSections.difficulties && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="p-3 bg-card/50 rounded-lg border border-border">
            <div className="flex gap-2 mb-3">
              <Button variant="ghost" size="sm" onClick={() => selectAll(DIFFICULTIES.map(d => d.value), setSelectedDifficulties)}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={() => clearAll(setSelectedDifficulties)}>
                Clear
              </Button>
            </div>
            <div className="space-y-2">
              {DIFFICULTIES.map((diff) => (
                <label key={diff.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                  <Checkbox
                    checked={selectedDifficulties.includes(diff.value)}
                    onCheckedChange={() => toggleItem(diff.value, selectedDifficulties, setSelectedDifficulties)}
                  />
                  <span className={cn('text-sm', diff.color)}>{diff.label}</span>
                </label>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Subjects */}
      <Collapsible open={openSections.subjects} onOpenChange={() => toggleSection('subjects')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-lg border border-border hover:bg-accent">
          <span className="font-medium text-foreground">
            Subject {selectedSubjects.length > 0 && `(${selectedSubjects.length})`}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', openSections.subjects && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="p-3 bg-card/50 rounded-lg border border-border max-h-60 overflow-y-auto">
            <div className="flex gap-2 mb-3">
              <Button variant="ghost" size="sm" onClick={() => selectAll(SUBJECTS, setSelectedSubjects)}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={() => clearAll(setSelectedSubjects)}>
                Clear
              </Button>
            </div>
            <div className="space-y-2">
              {SUBJECTS.map((subject) => (
                <label key={subject} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                  <Checkbox
                    checked={selectedSubjects.includes(subject)}
                    onCheckedChange={() => toggleItem(subject, selectedSubjects, setSelectedSubjects)}
                  />
                  <span className="text-sm text-foreground">{subject}</span>
                </label>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Systems */}
      <Collapsible open={openSections.systems} onOpenChange={() => toggleSection('systems')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-lg border border-border hover:bg-accent">
          <span className="font-medium text-foreground">
            Organ System {selectedSystems.length > 0 && `(${selectedSystems.length})`}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', openSections.systems && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="p-3 bg-card/50 rounded-lg border border-border max-h-60 overflow-y-auto">
            <div className="flex gap-2 mb-3">
              <Button variant="ghost" size="sm" onClick={() => selectAll(SYSTEMS, setSelectedSystems)}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={() => clearAll(setSelectedSystems)}>
                Clear
              </Button>
            </div>
            <div className="space-y-2">
              {SYSTEMS.map((system) => (
                <label key={system} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                  <Checkbox
                    checked={selectedSystems.includes(system)}
                    onCheckedChange={() => toggleItem(system, selectedSystems, setSelectedSystems)}
                  />
                  <span className="text-sm text-foreground">{system}</span>
                </label>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Specialties */}
      {specialties.length > 0 && (
        <Collapsible open={openSections.specialties} onOpenChange={() => toggleSection('specialties')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-lg border border-border hover:bg-accent">
            <span className="font-medium text-foreground">
              Specialty {selectedSpecialties.length > 0 && `(${selectedSpecialties.length})`}
            </span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', openSections.specialties && 'rotate-180')} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="p-3 bg-card/50 rounded-lg border border-border max-h-60 overflow-y-auto">
              <div className="flex gap-2 mb-3">
                <Button variant="ghost" size="sm" onClick={() => selectAll(specialties.map(s => s.id), setSelectedSpecialties)}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={() => clearAll(setSelectedSpecialties)}>
                  Clear
                </Button>
              </div>
              <div className="space-y-2">
                {specialties.map((specialty) => (
                  <label key={specialty.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                    <Checkbox
                      checked={selectedSpecialties.includes(specialty.id)}
                      onCheckedChange={() => toggleItem(specialty.id, selectedSpecialties, setSelectedSpecialties)}
                    />
                    <span className="text-sm text-foreground">{specialty.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
