import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Form } from "@/lib/api/forms";

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

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Form Settings</h3>
        
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

      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Settings</h3>
        
        <div className="space-y-4">
          {/* Allow Multiple Submissions */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-gray-700">Allow Multiple Submissions</Label>
              <p className="text-xs text-gray-500">
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
              <Label className="text-gray-700">Show Progress Bar</Label>
              <p className="text-xs text-gray-500">
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
            <Label className="text-gray-700">Response Limit (Optional)</Label>
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
              className="bg-white text-gray-900"
            />
            <p className="text-xs text-gray-500">
              Maximum number of responses to accept
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        
        <div className="space-y-4">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-gray-700">Email Notifications</Label>
              <p className="text-xs text-gray-500">
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
              <Label className="text-gray-700">Notification Email(s)</Label>
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
                className="bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500">
                Comma-separated list of email addresses
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
        
        <div className="space-y-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-gray-700">Start Date (Optional)</Label>
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
              className="bg-white text-gray-900"
            />
            <p className="text-xs text-gray-500">
              Form will open for submissions at this time
            </p>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label className="text-gray-700">End Date (Optional)</Label>
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
              className="bg-white text-gray-900"
            />
            <p className="text-xs text-gray-500">
              Form will close for submissions at this time
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
