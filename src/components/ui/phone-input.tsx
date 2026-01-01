"use client";

import * as React from "react";
import { PhoneInput as ReactPhoneInput, defaultCountries, parseCountry } from "react-international-phone";
import "react-international-phone/style.css";
import { cn } from "@/lib/utils";

export interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  defaultCountry?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  preferredCountries?: string[];
  error?: boolean;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ 
    value, 
    onChange, 
    defaultCountry = "gh", 
    disabled = false,
    placeholder = "Phone number",
    className,
    preferredCountries = ["gh", "ng", "ke", "za", "us"],
    error = false,
  }, ref) => {
    // Get IP-based country on mount
    const [detectedCountry, setDetectedCountry] = React.useState<string>(defaultCountry);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      // Try to detect country from IP
      const detectCountry = async () => {
        try {
          const response = await fetch("https://ipapi.co/json/");
          const data = await response.json();
          if (data.country_code) {
            setDetectedCountry(data.country_code.toLowerCase());
          }
        } catch (error) {
          console.log("Could not detect country, using default");
        } finally {
          setIsLoading(false);
        }
      };

      detectCountry();
    }, []);

    // Create country list with preferred countries at top
    const countries = React.useMemo(() => {
      const preferred = preferredCountries
        .map(code => defaultCountries.find(c => c[1] === code.toLowerCase()))
        .filter(Boolean);
      
      const others = defaultCountries.filter(
        c => !preferredCountries.includes(c[1])
      );

      return [...preferred, ...others];
    }, [preferredCountries]);

    return (
      <div className={cn("phone-input-wrapper", className)}>
        <ReactPhoneInput
          value={value}
          onChange={onChange}
          defaultCountry={isLoading ? defaultCountry : detectedCountry}
          countries={countries}
          disabled={disabled}
          placeholder={placeholder}
          inputClassName={cn(
            "flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-base ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "md:text-sm backdrop-blur-sm transition-all duration-200 focus:bg-background/80",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          countrySelectorStyleProps={{
            buttonClassName: cn(
              "h-10 rounded-l-md border border-r-0 border-input bg-background/50 backdrop-blur-sm",
              "hover:bg-background/80 transition-all duration-200",
              error && "border-red-500"
            ),
            dropdownStyleProps: {
              className: cn(
                "bg-popover/95 backdrop-blur-xl border border-white/10 rounded-md shadow-lg",
                "max-h-[300px] overflow-auto"
              ),
              listItemClassName: cn(
                "hover:bg-accent hover:text-accent-foreground cursor-pointer px-3 py-2",
                "transition-colors"
              ),
            }
          }}
          style={{
            width: "100%",
          }}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
