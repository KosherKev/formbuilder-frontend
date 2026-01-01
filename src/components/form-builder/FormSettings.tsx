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
  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Settings</h3>
        
        <div className="space-y-6">
          {/* Thank You Message */}
          <div className="space-y-2">
            <Label className="text-gray-700">Thank You Message</Label>
            <Textarea
              value={form.settings?.thankYouMessage || ""}
              onChange={(e) =>
                onUpdate({
                  settings: {
                    ...form.settings,
                    thankYouMessage: e.target.value,
                  },
                })
              }
              placeholder="Thank you for your submission!"
              rows={3}
              className="bg-white text-gray-900"
            />
            <p className="text-xs text-gray-500">
              Message shown after form submission
            </p>
          </div>

          {/* Submit Button Text */}
          <div className="space-y-2">
            <Label className="text-gray-700">Submit Button Text</Label>
            <Input
              value={form.settings?.submitButtonText || "Submit"}
              onChange={(e) =>
                onUpdate({
                  settings: {
                    ...form.settings,
                    submitButtonText: e.target.value,
                  },
                })
              }
              placeholder="Submit"
              className="bg-white text-gray-900"
            />
          </div>

          {/* Redirect URL */}
          <div className="space-y-2">
            <Label className="text-gray-700">Redirect URL (Optional)</Label>
            <Input
              value={form.settings?.redirectUrl || ""}
              onChange={(e) =>
                onUpdate({
                  settings: {
                    ...form.settings,
                    redirectUrl: e.target.value,
                  },
                })
              }
              placeholder="https://example.com/thank-you"
              className="bg-white text-gray-900"
            />
            <p className="text-xs text-gray-500">
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
              checked={form.settings?.allowMultipleSubmissions ?? true}
              onCheckedChange={(checked) =>
                onUpdate({
                  settings: {
                    ...form.settings,
                    allowMultipleSubmissions: checked,
                  },
                })
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
              checked={form.settings?.showProgressBar ?? true}
              onCheckedChange={(checked) =>
                onUpdate({
                  settings: {
                    ...form.settings,
                    showProgressBar: checked,
                  },
                })
              }
            />
          </div>

          {/* Response Limit */}
          <div className="space-y-2">
            <Label className="text-gray-700">Response Limit (Optional)</Label>
            <Input
              type="number"
              value={form.settings?.responseLimit || ""}
              onChange={(e) =>
                onUpdate({
                  settings: {
                    ...form.settings,
                    responseLimit: e.target.value ? Number(e.target.value) : undefined,
                  },
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
              checked={form.settings?.enableNotifications ?? true}
              onCheckedChange={(checked) =>
                onUpdate({
                  settings: {
                    ...form.settings,
                    enableNotifications: checked,
                  },
                })
              }
            />
          </div>

          {/* Notification Emails */}
          {form.settings?.enableNotifications && (
            <div className="space-y-2">
              <Label className="text-gray-700">Notification Email(s)</Label>
              <Input
                value={form.settings?.notificationEmails?.join(", ") || ""}
                onChange={(e) =>
                  onUpdate({
                    settings: {
                      ...form.settings,
                      notificationEmails: e.target.value
                        .split(",")
                        .map((email) => email.trim())
                        .filter(Boolean),
                    },
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
                form.settings?.startDate
                  ? new Date(form.settings.startDate).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                onUpdate({
                  settings: {
                    ...form.settings,
                    startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  },
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
                form.settings?.endDate
                  ? new Date(form.settings.endDate).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                onUpdate({
                  settings: {
                    ...form.settings,
                    endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  },
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
