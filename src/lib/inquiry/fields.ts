// Shared inquiry field rules. Imported by the browser form (no zod in the client
// bundle) and by the server schema, so both enforce the same limits and messages.

export const LIMITS = { name: 100, email: 254, phone: 30, interest: 120, message: 2000 } as const;
export const CONTACT_METHODS = ["Email", "Phone", "Either"] as const;
/** Largest accepted request body in bytes. The longest valid inquiry is well under this. */
export const MAX_BODY_BYTES = 8 * 1024;

export type InquiryField = "name" | "email" | "phone" | "interest" | "contactMethod" | "message" | "consent";
export type InquiryErrors = Partial<Record<InquiryField, string>>;

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE = /^[0-9+().\-\s]*$/;
// Carriage returns, line feeds and other control characters never belong in single-line fields.
export const CONTROL = /[\u0000-\u001f\u007f]/;
// The message may contain line breaks, but no other control characters.
export const MESSAGE_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export const MESSAGES = {
  name: "Please tell us your name.",
  nameLong: `Please keep your name under ${LIMITS.name} characters.`,
  email: "Please enter your email address so we can reply.",
  emailInvalid: "Please check this email address. It should look like name@example.com.",
  phone: "Please check this phone number. It needs at least 10 digits.",
  interest: "Please choose one of the listed topics.",
  contactMethod: "Please choose email, phone or either.",
  message: `Please keep your message under ${LIMITS.message} characters.`,
  phoneNeeded: "Please add a phone number, or choose email as the way to reach you.",
  consent: "Please confirm you have read how we use your inquiry.",
  invalid: "Please remove unusual characters from this field.",
} as const;

export type InquiryValues = { name: string; email: string; phone: string; interest: string; contactMethod: string; message: string; consent: boolean };

/** Field-level checks shared by the form and the server. Values are already trimmed strings. */
export function validateInquiry(v: InquiryValues, interestOptions?: readonly string[]): InquiryErrors {
  const e: InquiryErrors = {};
  if (!v.name) e.name = MESSAGES.name;
  else if (v.name.length > LIMITS.name) e.name = MESSAGES.nameLong;
  else if (CONTROL.test(v.name)) e.name = MESSAGES.invalid;

  if (!v.email) e.email = MESSAGES.email;
  else if (v.email.length > LIMITS.email || CONTROL.test(v.email) || !EMAIL.test(v.email)) e.email = MESSAGES.emailInvalid;

  if (v.phone && (v.phone.length > LIMITS.phone || !PHONE.test(v.phone) || v.phone.replace(/\D/g, "").length < 10)) e.phone = MESSAGES.phone;
  if (v.interest && (v.interest.length > LIMITS.interest || CONTROL.test(v.interest) || (interestOptions && !interestOptions.includes(v.interest)))) e.interest = MESSAGES.interest;
  if (v.contactMethod && !(CONTACT_METHODS as readonly string[]).includes(v.contactMethod)) e.contactMethod = MESSAGES.contactMethod;
  else if (v.contactMethod === "Phone" && !v.phone && !e.phone) e.phone = MESSAGES.phoneNeeded;
  if (v.message.length > LIMITS.message) e.message = MESSAGES.message;
  else if (MESSAGE_CONTROL.test(v.message)) e.message = MESSAGES.invalid;
  if (!v.consent) e.consent = MESSAGES.consent;
  return e;
}
