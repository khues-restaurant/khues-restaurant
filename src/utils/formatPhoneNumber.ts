export function formatPhoneNumber(value: string) {
  if (!value) return value;

  // Remove all non-digit characters
  let phoneNumber = value.replace(/[^\d]/g, "");

  // Remove leading "1" if the phone number length is greater than 10
  if (phoneNumber.length > 10 && phoneNumber.startsWith("1")) {
    phoneNumber = phoneNumber.substring(1);
  }

  // After potentially removing the country code, determine formatting based on length
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength < 4) return phoneNumber;

  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }

  // Format as (XXX) XXX-XXXX
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
}
