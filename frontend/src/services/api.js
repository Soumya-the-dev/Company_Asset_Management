/**
 * Centralized API Client
 * Wraps Fetch API, handles error responses, and provides transparent fallback to mock data when backend is offline.
 */

import { mockApi } from './mockData';

// Configurable API base URL (normalizes with or without /api suffix)
const rawBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
export const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

const USE_MOCK_ENV = import.meta.env.VITE_USE_MOCK === 'true';

let hasWarnedBackendDown = false;

/**
 * Formats backend HTTP error responses into friendly human-readable error messages.
 */
function parseErrorMessage(status, data) {
  if (data && data.detail) {
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      // Pydantic validation error array
      return data.detail.map((err) => `${err.loc?.slice(-1)[0] || 'Field'}: ${err.msg}`).join(', ');
    }
  }

  switch (status) {
    case 400:
      return 'Invalid request data. Please check the values provided.';
    case 401:
      return 'Unauthorized. Access credentials required.';
    case 403:
      return 'Access forbidden. You do not have permission for this action.';
    case 404:
      return 'The requested record could not be found.';
    case 409:
      return 'A conflict occurred. An asset tag, serial number, or employee code already exists.';
    case 422:
      return 'Validation failed. Please verify that all required fields are filled correctly.';
    case 500:
      return 'Internal server error. Please try again later.';
    default:
      return `Request failed with status code ${status}.`;
  }
}

/**
 * Core request helper
 */
export async function request(endpoint, options = {}, mockFallbackFn = null) {
  // If explicitly forced to mock mode
  if (USE_MOCK_ENV && mockFallbackFn) {
    return await mockFallbackFn();
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = parseErrorMessage(response.status, data);
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If backend is completely offline/unreachable and a mock fallback exists, fallback gracefully
    const isNetworkError =
      error.name === 'TypeError' ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('network');

    if (isNetworkError && mockFallbackFn) {
      if (!hasWarnedBackendDown) {
        console.warn(
          `[AssetManager API] Backend at ${API_BASE_URL} is currently unreachable. Seamlessly activating mock mode for local demo.`
        );
        hasWarnedBackendDown = true;
      }
      return await mockFallbackFn();
    }

    throw error;
  }
}

export { mockApi };
