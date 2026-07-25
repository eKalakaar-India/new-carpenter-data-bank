/**
 * googleSheet.client.js
 *
 * Production Google Sheets Client
 */

import { google } from "googleapis";

import {
  GoogleAuthenticationError,
  GoogleApiQuotaError,
  GoogleRateLimitError,
} from "./googleSheet.errors.js";

let sheetsClient = null;

/**
 * Returns singleton Google Sheets client
 */
export async function getGoogleSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },

      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const authClient = await auth.getClient();

    sheetsClient = google.sheets({
      version: "v4",
      auth: authClient,
    });

    return sheetsClient;
  } catch (error) {
    throw new GoogleAuthenticationError(error.message);
  }
}

/**
 * Generic Retry Wrapper
 */

export async function withRetry(
  operation,
  retries = 3,
  delay = 500
) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await operation();
    } catch (error) {
      const status =
        error?.response?.status ??
        error?.code;

      if (status === 429) {
        if (attempt === retries) {
          throw new GoogleRateLimitError();
        }

        await sleep(delay);

        delay *= 2;

        attempt++;

        continue;
      }

      if (
        status === 403 &&
        error.message?.includes("quota")
      ) {
        throw new GoogleApiQuotaError();
      }

      throw error;
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}