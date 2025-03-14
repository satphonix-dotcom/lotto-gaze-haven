
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PatternNumberInputsProps {
  successNumbers: string[];
  machineNumbers: string[];
  onSuccessNumberChange: (index: number, value: string) => void;
  onMachineNumberChange: (index: number, value: string) => void;
  successLabel?: string;
  machineLabel?: string;
  containerClassName?: string;
}

export function PatternNumberInputs({
  successNumbers,
  machineNumbers,
  onSuccessNumberChange,
  onMachineNumberChange,
  successLabel = 'Success',
  machineLabel = 'Machine',
  containerClassName = 'grid grid-cols-10 gap-2'
}: PatternNumberInputsProps) {
  return (
    <div className="space-y-2">
      <Label>Success and Machine Numbers</Label>
      <div className={containerClassName}>
        {successNumbers.map((num, index) => (
          <Input
            key={`success-${index}`}
            type="number"
            min="1"
            max="99"
            placeholder={`${successLabel}${index + 1}`}
            value={num}
            onChange={(e) => onSuccessNumberChange(index, e.target.value)}
            className="bg-blue-50 border-blue-200"
          />
        ))}
        {machineNumbers.map((num, index) => (
          <Input
            key={`machine-${index}`}
            type="number"
            min="1"
            max="99"
            placeholder={`${machineLabel}${index + 1}`}
            value={num}
            onChange={(e) => onMachineNumberChange(index, e.target.value)}
            className="bg-red-50 border-red-200"
          />
        ))}
      </div>
    </div>
  );
}
