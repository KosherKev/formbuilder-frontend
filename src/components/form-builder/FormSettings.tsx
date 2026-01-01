import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSelector } from "./ThemeSelector";
import { Settings, Palette, Bell, Calendar } from "lucide-react";
import type { Form } from "@/lib/api/forms";
import type { FormTheme } from "@/lib/themes";

interface FormSettingsProps {
  form: Form;
  onUpdate: (updates: Partial<Form>) => void;
}

export function FormSettings({ form, onUpdate }: FormSettingsProps) {
  // Local state for form inputs to prevent saving on every keystroke
  const [localSettings, setLocalSettings] = useState(form.settings || {});
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Sync with form when it changes from outside
  useEffect(() => {
    setLocalSettings(form.settings || {});
  }, [form.settings]);

  // Debounced update function
  const handleLocalChange = (updates: any) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);

    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout to save after 1 second of no typing
    const timeout = setTimeout(() => {
      onUpdate({ settings: newSettings });
    }, 1000);

    setDebounceTimeout(timeout);
  };

  // Immediate update for switches (no debounce needed)
  const handleImmediateChange = (updates: any) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);
    onUpdate({ settings: newSettings });
  };

  // Handle theme selection
  const handleThemeChange = (theme: Partial<FormTheme>) => {
    onUpdate({ 
      theme: {
        id: theme.id || 'custom',
        name: theme.name || 'Custom',
        primaryColor: theme.colors?.primary || '#6366F1',
        backgroundColor: theme.colors?.background || '#0F172A',
        fontFamily: theme.fonts?.heading || 'Inter',
        backgroundGradient: theme.backgroundGradient,
        borderRadius: theme.borderRadius,
        cardStyle: theme.cardStyle,
      } as any
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-panel">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card className="p-6 glass-panel border-0">
            <h3 className="text-lg font-semibold text-foreground mb-4">Response Settings</h3>
            
            <div className="space-y-6">
              {/* Thank You Message */}
              <div className="space-y-2">
                <Label className="text-foreground">Thank You Message</Label>
                <Textarea
                  value={localSettings.thankYouMessage || ""}
                  onChange={(e) =>
                    handleLocalChange({ thankYouMessage: e.target.value })
                  }
                  placeholder="Thank you for your submission!"
                  rows={3}
                  className="text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Message shown after form submission
                </p>
              </div>

              {/* Submit Button Text */}
              <div className="space-y-2">
                <Label className="text-foreground">Submit Button Text</Label>
                <Input
                  value={localSettings.submitButtonText || "Submit"}
                  onChange={(e) =>
                    handleLocalChange({ submitButtonText: e.target.value })
                  }
                  placeholder="Submit"
                  className="text-foreground"
                />
              </div>

              {/* Redirect URL */}
              <div className="space-y-2">
                <Label className="text-foreground">Redirect URL (Optional)</Label>
                <Input
                  value={localSettings.redirectUrl || ""}
                  onChange={(e) =>
                    handleLocalChange({ redirectUrl: e.target.value })
                  }
                  placeholder="https://example.com/thank-you"
                  className="text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Redirect users after submission (leave blank to show thank you message)
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-panel border-0">
            <h3 className="text-lg font-semibold text-foreground mb-4">Form Behavior</h3>
            
            <div className="space-y-4">
              {/* Allow Multiple Submissions */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Allow Multiple Submissions</Label>
                  <p className="text-xs text-muted-foreground">
                    Users can submit the form multiple times
                  </p>
                </div>
                <Switch
                  checked={localSettings.allowMultipleSubmissions ?? true}
                  onCheckedChange={(checked) =>
                    handleImmediateChange({ allowMultipleSubmissions: checked })
                  }
                />
              </div>

              {/* Show Progress Bar */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Show Progress Bar</Label>
                  <p className="text-xs text-muted-foreground">
                    Display completion progress to users
                  </p>
                </div>
                <Switch
                  checked={localSettings.showProgressBar ?? true}
                  onCheckedChange={(checked) =>
                    handleImmediateChange({ showProgressBar: checked })
                  }
                />
              </div>

              {/* Response Limit */}
              <div className="space-y-2">
                <Label className="text-foreground">Response Limit (Optional)</Label>
                <Input
                  type="number"
                  value={localSettings.responseLimit || ""}
                  onChange={(e) =>
                    handleLocalChange({
                      responseLimit: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="No limit"
                  min="1"
                  className="text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of responses to accept
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme" className="mt-6">
          <ThemeSelector
            selectedTheme={form.theme}
            onSelectTheme={handleThemeChange}
          />
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className="p-6 glass-panel border-0">
            <h3 className="text-lg font-semibold text-foreground mb-4">Email Notifications</h3>
            
            <div className="space-y-4">
              {/* Enable Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone submits
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableNotifications ?? true}
                  onCheckedChange={(checked) =>
                    handleImmediateChange({ enableNotifications: checked })
                  }
                />
              </div>

              {/* Notification Emails */}
              {localSettings.enableNotifications && (
                <div className="space-y-2">
                  <Label className="text-foreground">Notification Email(s)</Label>
                  <Input
                    value={localSettings.notificationEmails?.join(", ") || ""}
                    onChange={(e) =>
                      handleLocalChange({
                        notificationEmails: e.target.value
                          .split(",")
                          .map((email) => email.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="email@example.com, another@example.com"
                    className="text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of email addresses
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Schedule Settings */}
        <TabsContent value="schedule" className="space-y-6 mt-6">
          <Card className="p-6 glass-panel border-0">
            <h3 className="text-lg font-semibold text-foreground mb-4">Form Schedule</h3>
            
            <div className="space-y-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-foreground">Start Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={
                    localSettings.startDate
                      ? new Date(localSettings.startDate).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    handleLocalChange({
                      startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    })
                  }
                  className="text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Form will open for submissions at this time
                </p>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label className="text-foreground">End Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={
                    localSettings.endDate
                      ? new Date(localSettings.endDate).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    handleLocalChange({
                      endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    })
                  }
                  className="text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Form will close for submissions at this time
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
