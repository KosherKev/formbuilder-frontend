"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Minus,
  Plus,
} from "lucide-react";

interface TextStyleControlsProps {
  value: {
    fontSize?: 'sm' | 'base' | 'lg' | 'xl';
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  };
  onChange: (style: TextStyleControlsProps['value']) => void;
  label?: string;
}

const fontSizeLabels = {
  sm: 'Small (14px)',
  base: 'Medium (16px)',
  lg: 'Large (18px)',
  xl: 'Extra Large (20px)',
};

const fontWeightLabels = {
  normal: 'Normal',
  medium: 'Medium',
  semibold: 'Semi Bold',
  bold: 'Bold',
};

const lineHeightLabels = {
  tight: 'Tight',
  normal: 'Normal',
  relaxed: 'Relaxed',
  loose: 'Loose',
};

export function TextStyleControls({ value, onChange, label = "Text Style" }: TextStyleControlsProps) {
  const currentStyle = {
    fontSize: value.fontSize || 'base',
    fontWeight: value.fontWeight || 'normal',
    textAlign: value.textAlign || 'left',
    lineHeight: value.lineHeight || 'normal',
  };

  const updateStyle = (updates: Partial<typeof currentStyle>) => {
    onChange({ ...currentStyle, ...updates });
  };

  return (
    <div className="space-y-4">
      <Label className="text-foreground">{label}</Label>

      {/* Font Size */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Font Size</Label>
        <Select
          value={currentStyle.fontSize}
          onValueChange={(value: any) => updateStyle({ fontSize: value })}
        >
          <SelectTrigger className="text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(fontSizeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Font Weight</Label>
        <Select
          value={currentStyle.fontWeight}
          onValueChange={(value: any) => updateStyle({ fontWeight: value })}
        >
          <SelectTrigger className="text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(fontWeightLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                <span className={`font-${key}`}>{label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Text Alignment</Label>
        <div className="flex gap-2">
          <Button
            variant={currentStyle.textAlign === 'left' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateStyle({ textAlign: 'left' })}
            className="flex-1"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={currentStyle.textAlign === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateStyle({ textAlign: 'center' })}
            className="flex-1"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={currentStyle.textAlign === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateStyle({ textAlign: 'right' })}
            className="flex-1"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Line Height</Label>
        <Select
          value={currentStyle.lineHeight}
          onValueChange={(value: any) => updateStyle({ lineHeight: value })}
        >
          <SelectTrigger className="text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(lineHeightLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preview */}
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
        <p
          className={`
            text-foreground
            text-${currentStyle.fontSize}
            font-${currentStyle.fontWeight}
            text-${currentStyle.textAlign}
            leading-${currentStyle.lineHeight}
          `}
        >
          The quick brown fox jumps over the lazy dog
        </p>
      </div>
    </div>
  );
}
