import { useState } from 'react';
import { ChevronDown, ChevronRight, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface LabCategory {
  name: string;
  values: { name: string; range: string; unit: string }[];
}

const LAB_VALUES: LabCategory[] = [
  {
    name: 'Serum Chemistry',
    values: [
      { name: 'Sodium (Na+)', range: '136-145', unit: 'mEq/L' },
      { name: 'Potassium (K+)', range: '3.5-5.0', unit: 'mEq/L' },
      { name: 'Chloride (Cl-)', range: '98-106', unit: 'mEq/L' },
      { name: 'Bicarbonate (HCO3-)', range: '22-28', unit: 'mEq/L' },
      { name: 'BUN', range: '7-20', unit: 'mg/dL' },
      { name: 'Creatinine', range: '0.6-1.2', unit: 'mg/dL' },
      { name: 'Glucose (fasting)', range: '70-100', unit: 'mg/dL' },
      { name: 'Calcium (total)', range: '8.5-10.5', unit: 'mg/dL' },
      { name: 'Magnesium', range: '1.5-2.5', unit: 'mEq/L' },
      { name: 'Phosphorus', range: '2.5-4.5', unit: 'mg/dL' },
    ],
  },
  {
    name: 'Complete Blood Count',
    values: [
      { name: 'WBC', range: '4,500-11,000', unit: '/μL' },
      { name: 'RBC (male)', range: '4.5-5.5', unit: 'million/μL' },
      { name: 'RBC (female)', range: '4.0-5.0', unit: 'million/μL' },
      { name: 'Hemoglobin (male)', range: '13.5-17.5', unit: 'g/dL' },
      { name: 'Hemoglobin (female)', range: '12.0-16.0', unit: 'g/dL' },
      { name: 'Hematocrit (male)', range: '38-50', unit: '%' },
      { name: 'Hematocrit (female)', range: '36-44', unit: '%' },
      { name: 'Platelets', range: '150,000-400,000', unit: '/μL' },
      { name: 'MCV', range: '80-100', unit: 'fL' },
      { name: 'MCH', range: '27-33', unit: 'pg' },
      { name: 'MCHC', range: '32-36', unit: 'g/dL' },
    ],
  },
  {
    name: 'Liver Function',
    values: [
      { name: 'AST (SGOT)', range: '10-40', unit: 'U/L' },
      { name: 'ALT (SGPT)', range: '7-56', unit: 'U/L' },
      { name: 'Alkaline Phosphatase', range: '44-147', unit: 'U/L' },
      { name: 'Total Bilirubin', range: '0.1-1.2', unit: 'mg/dL' },
      { name: 'Direct Bilirubin', range: '0.0-0.3', unit: 'mg/dL' },
      { name: 'Albumin', range: '3.5-5.5', unit: 'g/dL' },
      { name: 'Total Protein', range: '6.0-8.3', unit: 'g/dL' },
      { name: 'GGT', range: '9-48', unit: 'U/L' },
    ],
  },
  {
    name: 'Lipid Panel',
    values: [
      { name: 'Total Cholesterol', range: '<200', unit: 'mg/dL' },
      { name: 'LDL', range: '<100', unit: 'mg/dL' },
      { name: 'HDL', range: '>40', unit: 'mg/dL' },
      { name: 'Triglycerides', range: '<150', unit: 'mg/dL' },
    ],
  },
  {
    name: 'Coagulation',
    values: [
      { name: 'PT', range: '11-15', unit: 'seconds' },
      { name: 'INR', range: '0.8-1.2', unit: '' },
      { name: 'aPTT', range: '25-35', unit: 'seconds' },
      { name: 'Bleeding Time', range: '2-7', unit: 'minutes' },
      { name: 'Fibrinogen', range: '200-400', unit: 'mg/dL' },
      { name: 'D-dimer', range: '<0.5', unit: 'μg/mL' },
    ],
  },
  {
    name: 'Thyroid Function',
    values: [
      { name: 'TSH', range: '0.5-5.0', unit: 'μU/mL' },
      { name: 'Free T4', range: '0.7-1.9', unit: 'ng/dL' },
      { name: 'T3 (total)', range: '80-200', unit: 'ng/dL' },
    ],
  },
  {
    name: 'Cardiac Markers',
    values: [
      { name: 'Troponin I', range: '<0.04', unit: 'ng/mL' },
      { name: 'CK-MB', range: '0-5', unit: 'ng/mL' },
      { name: 'BNP', range: '<100', unit: 'pg/mL' },
      { name: 'LDH', range: '140-280', unit: 'U/L' },
    ],
  },
  {
    name: 'Arterial Blood Gas',
    values: [
      { name: 'pH', range: '7.35-7.45', unit: '' },
      { name: 'PaO2', range: '80-100', unit: 'mmHg' },
      { name: 'PaCO2', range: '35-45', unit: 'mmHg' },
      { name: 'HCO3-', range: '22-26', unit: 'mEq/L' },
      { name: 'O2 Saturation', range: '>95', unit: '%' },
    ],
  },
  {
    name: 'Urinalysis',
    values: [
      { name: 'pH', range: '4.5-8.0', unit: '' },
      { name: 'Specific Gravity', range: '1.005-1.030', unit: '' },
      { name: 'Protein', range: 'Negative', unit: '' },
      { name: 'Glucose', range: 'Negative', unit: '' },
      { name: 'Ketones', range: 'Negative', unit: '' },
      { name: 'RBC', range: '0-2', unit: '/HPF' },
      { name: 'WBC', range: '0-5', unit: '/HPF' },
    ],
  },
];

interface LabValuesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function LabValuesPanel({ isOpen, onToggle }: LabValuesPanelProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(['Serum Chemistry']);

  const toggleCategory = (name: string) => {
    setOpenCategories(prev =>
      prev.includes(name)
        ? prev.filter(c => c !== name)
        : [...prev, name]
    );
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed right-4 top-20 z-50 gap-2"
      >
        <FlaskConical className="h-4 w-4" />
        Lab Values
      </Button>
    );
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Lab Reference Values</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {LAB_VALUES.map((category) => (
            <Collapsible
              key={category.name}
              open={openCategories.includes(category.name)}
              onOpenChange={() => toggleCategory(category.name)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent text-left">
                <span className="font-medium text-sm text-foreground">
                  {category.name}
                </span>
                {openCategories.includes(category.name) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left py-1 font-medium">Test</th>
                        <th className="text-right py-1 font-medium">Range</th>
                        <th className="text-right py-1 font-medium">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.values.map((value, index) => (
                        <tr
                          key={value.name}
                          className={cn(
                            'border-b border-border/50 last:border-0',
                            index % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'
                          )}
                        >
                          <td className="py-1.5 text-foreground">{value.name}</td>
                          <td className="text-right py-1.5 text-primary font-mono">
                            {value.range}
                          </td>
                          <td className="text-right py-1.5 text-muted-foreground">
                            {value.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
