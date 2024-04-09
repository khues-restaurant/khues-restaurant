export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);

  // Initialize the result object with default empty string values.
  const result = { firstName: "", lastName: "" };

  // If there are no parts or only whitespace, return early with default values.
  if (parts.length === 0) {
    return result;
  }

  // Assign the first part as the first name.
  result.firstName = parts[0] ?? "";

  // If there is more than one part, assign the last part as the last name.
  if (parts.length > 1) {
    result.lastName = parts.at(-1) ?? "";
  }

  return result;
}
