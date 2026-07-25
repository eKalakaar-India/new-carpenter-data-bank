/**
 * googleSheet.errors.js
 *
 * Custom Error Classes
 */

export class GoogleSheetError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = this.constructor.name;

    this.statusCode = options.statusCode ?? 500;

    this.code = options.code ?? "GOOGLE_SHEET_ERROR";

    this.details = options.details ?? null;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class GoogleAuthenticationError extends GoogleSheetError {
  constructor(message = "Failed to authenticate with Google Sheets") {
    super(message, {
      statusCode: 401,
      code: "GOOGLE_AUTH_ERROR",
    });
  }
}

export class GoogleSheetNotFoundError extends GoogleSheetError {
  constructor(sheetId) {
    super(`Spreadsheet not found (${sheetId})`, {
      statusCode: 404,
      code: "SHEET_NOT_FOUND",
    });
  }
}

export class GoogleWorksheetNotFoundError extends GoogleSheetError {
  constructor(sheetName) {
    super(`Worksheet "${sheetName}" not found`, {
      statusCode: 404,
      code: "WORKSHEET_NOT_FOUND",
    });
  }
}

export class GoogleValidationError extends GoogleSheetError {
  constructor(details) {
    super("Google Sheet validation failed", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details,
    });
  }
}

export class GoogleApiQuotaError extends GoogleSheetError {
  constructor() {
    super("Google API quota exceeded", {
      statusCode: 429,
      code: "GOOGLE_API_QUOTA",
    });
  }
}

export class GoogleRateLimitError extends GoogleSheetError {
  constructor() {
    super("Google API rate limit exceeded", {
      statusCode: 429,
      code: "GOOGLE_RATE_LIMIT",
    });
  }
}