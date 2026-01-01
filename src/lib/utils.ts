import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { parsePhoneNumber, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Enhanced phone number validation with international support
 */
export function validatePhoneNumber(phone: string, countryCode?: string): {
  valid: boolean;
  message: string;
  formatted?: string;
} {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, message: "Phone number is required" };
  }

  try {
    const country = countryCode ? (countryCode.toUpperCase() as CountryCode) : undefined;
    const isValid = isValidPhoneNumber(phone, country);
    
    if (!isValid) {
      return { 
        valid: false, 
        message: "Invalid phone number for the selected country" 
      };
    }

    const parsed = parsePhoneNumber(phone, country);
    
    return {
      valid: true,
      message: "Valid phone number",
      formatted: parsed ? parsed.format("INTERNATIONAL") : phone
    };
  } catch (error) {
    return {
      valid: false,
      message: "Invalid phone number format"
    };
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  try {
    const parsed = parsePhoneNumber(phone);
    return parsed ? parsed.format("INTERNATIONAL") : phone;
  } catch {
    return phone;
  }
}
