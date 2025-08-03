/**
 * Utility functions for input validation and sanitization
 */

/**
 * Sanitizes numeric input to only allow valid numeric characters
 * @param value - The input value to sanitize
 * @param options - Configuration options
 * @returns Sanitized string that only contains valid numeric characters
 */
export function sanitizeNumericInput(
  value: string,
  options: {
    allowDecimals?: boolean;
    allowNegative?: boolean;
    maxDecimalPlaces?: number;
  } = {}
): string {
  const { allowDecimals = true, allowNegative = false, maxDecimalPlaces = 2 } = options;

  // Remove all non-numeric characters except decimal point and negative sign
  // Also remove 'e', 'E', '+' which are valid in scientific notation but not desired for financial inputs
  let sanitized = value.replace(/[^0-9.-]/g, "");

  // Handle negative sign
  if (!allowNegative) {
    sanitized = sanitized.replace(/-/g, "");
  } else {
    // Only allow negative sign at the beginning
    if (sanitized.includes("-")) {
      const parts = sanitized.split("-");
      sanitized = "-" + parts.join("");
      // Remove any extra negative signs
      sanitized = sanitized.replace(/--+/g, "-");
      // Ensure negative sign is only at the beginning
      if (sanitized.indexOf("-") !== 0) {
        sanitized = sanitized.replace(/-/g, "");
      }
    }
  }

  // Handle decimal points
  if (!allowDecimals) {
    sanitized = sanitized.replace(/\./g, "");
  } else {
    // Only allow one decimal point
    const decimalParts = sanitized.split(".");
    if (decimalParts.length > 2) {
      sanitized = decimalParts[0] + "." + decimalParts.slice(1).join("");
    }

    // Limit decimal places
    if (decimalParts.length === 2 && decimalParts[1].length > maxDecimalPlaces) {
      sanitized = decimalParts[0] + "." + decimalParts[1].substring(0, maxDecimalPlaces);
    }
  }

  // Prevent starting with decimal point (add leading zero)
  if (sanitized.startsWith(".")) {
    sanitized = "0" + sanitized;
  }

  // Prevent starting with negative and decimal (add leading zero)
  if (sanitized.startsWith("-.")) {
    sanitized = "-0" + sanitized.substring(1);
  }

  return sanitized;
}

/**
 * Sanitizes integer input to only allow whole numbers
 * @param value - The input value to sanitize
 * @param allowNegative - Whether to allow negative numbers
 * @returns Sanitized string that only contains valid integer characters
 */
export function sanitizeIntegerInput(value: string, allowNegative: boolean = false): string {
  return sanitizeNumericInput(value, {
    allowDecimals: false,
    allowNegative,
    maxDecimalPlaces: 0,
  });
}

/**
 * Sanitizes decimal input to only allow decimal numbers
 * @param value - The input value to sanitize
 * @param maxDecimalPlaces - Maximum number of decimal places allowed
 * @param allowNegative - Whether to allow negative numbers
 * @returns Sanitized string that only contains valid decimal characters
 */
export function sanitizeDecimalInput(
  value: string,
  maxDecimalPlaces: number = 2,
  allowNegative: boolean = false
): string {
  return sanitizeNumericInput(value, {
    allowDecimals: true,
    allowNegative,
    maxDecimalPlaces,
  });
}

/**
 * Sanitizes percentage input (0-100)
 * @param value - The input value to sanitize
 * @param maxDecimalPlaces - Maximum number of decimal places allowed
 * @returns Sanitized string that represents a valid percentage
 */
export function sanitizePercentageInput(value: string, maxDecimalPlaces: number = 1): string {
  let sanitized = sanitizeNumericInput(value, {
    allowDecimals: true,
    allowNegative: false,
    maxDecimalPlaces,
  });

  // Limit to 100%
  const numValue = parseFloat(sanitized);
  if (!isNaN(numValue) && numValue > 100) {
    sanitized = "100";
  }

  return sanitized;
}

/**
 * Creates an onChange handler for numeric inputs
 * @param setValue - Function to update the state value
 * @param sanitizeFunction - Function to sanitize the input
 * @returns onChange handler function
 */
export function createNumericInputHandler(
  setValue: (value: string) => void,
  sanitizeFunction: (value: string) => string
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeFunction(e.target.value);
    setValue(sanitizedValue);
  };
}

/**
 * Creates a keydown handler that prevents invalid characters from being typed
 * @param allowDecimals - Whether to allow decimal points
 * @param allowNegative - Whether to allow negative sign
 * @returns onKeyDown handler function
 */
export function createNumericKeyDownHandler(
  allowDecimals: boolean = true,
  allowNegative: boolean = false
) {
  return (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow control keys (backspace, delete, tab, escape, enter, etc.)
    if (
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'Tab' ||
      e.key === 'Escape' ||
      e.key === 'Enter' ||
      e.key === 'Home' ||
      e.key === 'End' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
      (e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase()))
    ) {
      return;
    }

    // Prevent 'e', 'E', '+' which are valid in number inputs but not desired
    if (['e', 'E', '+'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    // Allow numbers
    if (e.key >= '0' && e.key <= '9') {
      return;
    }

    // Handle decimal point
    if (e.key === '.' && allowDecimals) {
      const input = e.target as HTMLInputElement;
      // Prevent multiple decimal points
      if (input.value.includes('.')) {
        e.preventDefault();
        return;
      }
      return;
    }

    // Handle negative sign
    if (e.key === '-' && allowNegative) {
      const input = e.target as HTMLInputElement;
      // Only allow at the beginning and if not already present
      if (input.selectionStart !== 0 || input.value.includes('-')) {
        e.preventDefault();
        return;
      }
      return;
    }

    // Prevent all other characters
    e.preventDefault();
  };
}
