// Validation helpers for edge functions
// Using simple validation since zod is not available in Deno deploy

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends Error {
  errors: ValidationError[];
  
  constructor(errors: ValidationError[]) {
    super("Validation failed");
    this.errors = errors;
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  return phoneRegex.test(phone);
};

export const validateString = (value: string, minLength: number, maxLength: number): boolean => {
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

export const validateBookingInput = (data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateString(data.customerName, 2, 100)) {
    errors.push({ field: "customerName", message: "Name must be 2-100 characters" });
  }

  if (!validateEmail(data.customerEmail)) {
    errors.push({ field: "customerEmail", message: "Invalid email address" });
  }

  if (data.customerEmail.length > 255) {
    errors.push({ field: "customerEmail", message: "Email too long" });
  }

  if (!validatePhone(data.customerPhone)) {
    errors.push({ field: "customerPhone", message: "Phone must be 8-15 digits" });
  }

  if (data.notes && data.notes.length > 1000) {
    errors.push({ field: "notes", message: "Notes must be less than 1000 characters" });
  }

  return errors;
};

export const validatePaymentInput = (data: {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(data.bookingId)) {
    errors.push({ field: "bookingId", message: "Invalid booking ID format" });
  }

  if (data.amount <= 0 || data.amount > 10000000) {
    errors.push({ field: "amount", message: "Amount must be between 0 and 10,000,000" });
  }

  if (data.currency.length !== 3) {
    errors.push({ field: "currency", message: "Currency must be 3 characters" });
  }

  if (!["card", "mobile_money", "bank_transfer"].includes(data.paymentMethod)) {
    errors.push({ field: "paymentMethod", message: "Invalid payment method" });
  }

  if (!validateString(data.customerInfo.name, 2, 100)) {
    errors.push({ field: "customerInfo.name", message: "Name must be 2-100 characters" });
  }

  if (!validateEmail(data.customerInfo.email)) {
    errors.push({ field: "customerInfo.email", message: "Invalid email address" });
  }

  if (data.customerInfo.phone && !validatePhone(data.customerInfo.phone)) {
    errors.push({ field: "customerInfo.phone", message: "Invalid phone format" });
  }

  return errors;
};

export const validateSupportMessage = (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  bookingReference?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateString(data.name, 2, 100)) {
    errors.push({ field: "name", message: "Name must be 2-100 characters" });
  }

  if (!validateEmail(data.email) || data.email.length > 255) {
    errors.push({ field: "email", message: "Invalid email or too long" });
  }

  if (!validateString(data.subject, 3, 200)) {
    errors.push({ field: "subject", message: "Subject must be 3-200 characters" });
  }

  if (!validateString(data.message, 10, 2000)) {
    errors.push({ field: "message", message: "Message must be 10-2000 characters" });
  }

  if (data.bookingReference && data.bookingReference.length > 50) {
    errors.push({ field: "bookingReference", message: "Booking reference too long" });
  }

  return errors;
};

export const sanitizeString = (input: string, maxLength: number = 1000): string => {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};
