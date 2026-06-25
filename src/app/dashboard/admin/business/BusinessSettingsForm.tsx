'use client';

import { useActionState, useState, useEffect } from 'react';
import { updateTenantSettings } from '@/app/actions/tenant';
import { Button } from '@/components/ui/button';

const COUNTRY_CODES: Record<string, string> = {
  'Nepal': '+977',
  'India': '+91',
  'Portugal': '+351',
  'United States': '+1',
  'United Kingdom': '+44',
  'Australia': '+61'
};

export function BusinessSettingsForm({ settings }: { settings: any }) {
  const [country, setCountry] = useState(settings?.country || '');
  const [dialCode, setDialCode] = useState('');
  const [localPhone, setLocalPhone] = useState('');

  // When form mounts or settings change, parse existing phone
  useEffect(() => {
    const code = COUNTRY_CODES[country] || '';
    setDialCode(code);
    
    if (settings?.phone) {
      if (code && settings.phone.startsWith(code)) {
        setLocalPhone(settings.phone.substring(code.length));
      } else {
        // If it doesn't start with the code (or code is missing), just show it all
        setLocalPhone(settings.phone);
      }
    }
  }, [settings?.phone, country]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setCountry(newCountry);
    setDialCode(COUNTRY_CODES[newCountry] || '');
  };

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        return await updateTenantSettings(prevState, formData);
      } catch (e: any) {
        return { success: false, error: 'Something went wrong. Please try again.' };
      }
    },
    { success: false, error: null }
  );

  return (
    <form action={formAction} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="font-heading font-bold text-xl text-foreground">Operational Settings</h2>
        {state.success && <span className="text-sm text-success font-medium">Saved successfully!</span>}
      </div>

      {state.error && (
        <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Country <span className="text-destructive">*</span>
          </label>
          <select 
            name="country" 
            value={country}
            onChange={handleCountryChange}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
          >
            <option value="" disabled>Select Country...</option>
            <option value="Nepal">Nepal</option>
            <option value="India">India</option>
            <option value="Portugal">Portugal</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Timezone <span className="text-destructive">*</span>
          </label>
          <select 
            name="timezone" 
            defaultValue={settings?.timezone || 'UTC'}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Kathmandu">Asia/Kathmandu (NPT)</option>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="Europe/Lisbon">Europe/Lisbon (WET)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Currency <span className="text-destructive">*</span>
          </label>
          <select 
            name="currency" 
            defaultValue={settings?.currency || 'USD'}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
          >
            <option value="USD">USD - US Dollar</option>
            <option value="NPR">NPR - Nepalese Rupee</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Contact Email <span className="text-destructive">*</span>
          </label>
          <input 
            type="email" 
            name="contact_email" 
            defaultValue={settings?.contact_email || ''}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Phone <span className="text-destructive">*</span>
          </label>
          <div className="flex">
            {dialCode && (
              <div className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground text-sm font-medium">
                {dialCode}
                <input type="hidden" name="dial_code" value={dialCode} />
              </div>
            )}
            <input 
              type="text" 
              name="phone_number" 
              value={localPhone}
              onChange={e => setLocalPhone(e.target.value)}
              className={`w-full flex h-10 border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${dialCode ? 'rounded-r-md' : 'rounded-md'}`} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Address Line <span className="text-destructive">*</span>
          </label>
          <input 
            type="text" 
            name="address_line" 
            defaultValue={settings?.address_line || ''}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
          />
          <p className="text-[10px] text-muted-foreground mt-1">Street address or business location details.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">City <span className="text-destructive">*</span></label>
          <input 
            type="text" 
            name="city" 
            defaultValue={settings?.city || ''}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">State / Province / Region</label>
          <input 
            type="text" 
            name="region" 
            placeholder={
              country === 'Nepal' ? 'e.g. Bagmati Province' : 
              country === 'India' ? 'e.g. Maharashtra' : 
              country === 'Portugal' ? 'e.g. Lisbon' : 
              country === 'United States' ? 'e.g. California' : ''
            }
            defaultValue={settings?.region || ''}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Postal Code</label>
          <input 
            type="text" 
            name="postal_code" 
            defaultValue={settings?.postal_code || ''}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 min-w-32">
          {isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
