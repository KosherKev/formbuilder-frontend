"use client";

import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormTheme } from "@/lib/themes";
import { formThemes, applyThemeStyles, getCardStyleClasses } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  selectedTheme?: Partial<FormTheme>;
  onSelectTheme: (theme: Partial<FormTheme>) => void;
}

export function ThemeSelector({ selectedTheme, onSelectTheme }: ThemeSelectorProps) {
  const [customizing, setCustomizing] = useState(false);
  const [customColors, setCustomColors] = useState({
    primary: selectedTheme?.colors?.primary || "#6366F1",
    background: selectedTheme?.colors?.background || "#0F172A",
  });

  const handlePresetSelect = (theme: FormTheme) => {
    setCustomizing(false);
    onSelectTheme({
      id: theme.id,
      name: theme.name,
      colors: theme.colors,
      fonts: theme.fonts,
      backgroundGradient: theme.backgroundGradient,
      borderRadius: theme.borderRadius,
      cardStyle: theme.cardStyle,
    });
  };

  const handleCustomColorChange = (key: 'primary' | 'background', value: string) => {
    const newColors = { ...customColors, [key]: value };
    setCustomColors(newColors);
    
    onSelectTheme({
      id: 'custom',
      name: 'Custom Theme',
      colors: {
        primary: newColors.primary,
        secondary: newColors.primary,
        background: newColors.background,
        foreground: newColors.background === '#0F172A' ? '#FFFFFF' : '#000000',
        accent: newColors.primary,
        muted: '#64748B',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      borderRadius: 'lg',
      cardStyle: 'glass',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Form Theme</h3>
          <p className="text-sm text-muted-foreground">
            Choose a pre-designed theme or customize your own
          </p>
        </div>
        <Button
          variant={customizing ? "default" : "outline"}
          size="sm"
          onClick={() => setCustomizing(!customizing)}
          className="text-foreground"
        >
          <Palette className="h-4 w-4 mr-2" />
          {customizing ? "Use Preset" : "Customize"}
        </Button>
      </div>

      {customizing ? (
        <Card className="p-6 glass-panel border-0">
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Primary Color</Label>
              <div className="flex items-center space-x-3 mt-2">
                <Input
                  type="color"
                  value={customColors.primary}
                  onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                  className="h-12 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColors.primary}
                  onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                  className="flex-1 text-foreground"
                  placeholder="#6366F1"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground">Background Color</Label>
              <div className="flex items-center space-x-3 mt-2">
                <Input
                  type="color"
                  value={customColors.background}
                  onChange={(e) => handleCustomColorChange('background', e.target.value)}
                  className="h-12 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColors.background}
                  onChange={(e) => handleCustomColorChange('background', e.target.value)}
                  className="flex-1 text-foreground"
                  placeholder="#0F172A"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-muted-foreground">
                Preview your custom theme in the form preview
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formThemes.map((theme) => (
            <Card
              key={theme.id}
              className={cn(
                "relative cursor-pointer transition-all hover:scale-105 border-2 overflow-hidden",
                selectedTheme?.id === theme.id
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-white/10 hover:border-white/20"
              )}
              onClick={() => handlePresetSelect(theme)}
              style={{
                background: theme.backgroundGradient,
                backgroundColor: theme.colors.background,
              }}
            >
              <div className="p-4">
                {/* Theme Preview */}
                <div className="mb-3 h-24 rounded-lg overflow-hidden relative"
                  style={{
                    background: theme.backgroundGradient,
                  }}
                >
                  {/* Mini form preview */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between">
                    <div 
                      className={cn(
                        "h-2 rounded-full",
                        getCardStyleClasses(theme.cardStyle)
                      )}
                      style={{ 
                        backgroundColor: theme.colors.primary,
                        width: '60%'
                      }} 
                    />
                    <div className="space-y-1">
                      <div 
                        className={cn(
                          "h-1.5 rounded",
                          getCardStyleClasses(theme.cardStyle)
                        )}
                        style={{ 
                          backgroundColor: theme.colors.muted,
                          width: '80%',
                          opacity: 0.5
                        }} 
                      />
                      <div 
                        className={cn(
                          "h-1.5 rounded",
                          getCardStyleClasses(theme.cardStyle)
                        )}
                        style={{ 
                          backgroundColor: theme.colors.muted,
                          width: '60%',
                          opacity: 0.5
                        }} 
                      />
                    </div>
                    <div 
                      className={cn(
                        "h-6 rounded",
                        getCardStyleClasses(theme.cardStyle)
                      )}
                      style={{ 
                        backgroundColor: theme.colors.primary,
                        opacity: 0.8
                      }} 
                    />
                  </div>
                </div>

                {/* Theme Info */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 
                      className="font-semibold"
                      style={{ 
                        color: theme.colors.foreground,
                        fontFamily: theme.fonts.heading
                      }}
                    >
                      {theme.name}
                    </h4>
                    {selectedTheme?.id === theme.id && (
                      <Check 
                        className="h-5 w-5" 
                        style={{ color: theme.colors.primary }}
                      />
                    )}
                  </div>
                  <p 
                    className="text-xs"
                    style={{ 
                      color: theme.colors.muted,
                      fontFamily: theme.fonts.body
                    }}
                  >
                    {theme.description}
                  </p>

                  {/* Color Palette */}
                  <div className="flex items-center space-x-1 mt-3">
                    <div
                      className="h-5 w-5 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="h-5 w-5 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div
                      className="h-5 w-5 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
