import { LoggingCallback } from '../helpers/logging'
import { AnalyticsPayload } from './analyticsPayload'

export interface HttpHeaders {
  [key: string]: string
}

/**
 * Represents the configuration for analytics.
 * This class is used to encapsulate the URL, headers, logging callback,
 * and an optional API callback for sending analytics data.
 */
export class AnalyticsConfig {
  private _url?: URL

  /**
   * The URL for the analytics configuration.
   * This is an optional property.
   */
  public get url(): URL | undefined {
    return this._url
  }

  /**
   * Sets the URL for the analytics configuration.
   * @param value - The URL as a string or URL object.
   * @throws Will throw an error if the provided URL is invalid.
   */
  public set url(value: string | URL | undefined) {
    if (value === undefined) {
      this._url = undefined
      return
    }
    try {
      this._url = typeof value === 'string' ? new URL(value) : value
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error'

      throw new Error(`Invalid URL provided. A valid URL must be provided. Original error: ${errorMessage}`)
    }
  }

  /**
   * The headers to include in the analytics configuration.
   * This is an optional property.
   */
  public headers?: HttpHeaders

  /**
   * The callback function for logging messages.
   * This is an optional property.
   */
  public logCallback?: LoggingCallback

  /**
   * The API callback for sending analytics payloads.
   * This is an optional property.
   */
  public apiCallback?: (payload: AnalyticsPayload) => Promise<void>

  /**
   * Constructs an instance of the AnalyticsConfig class.
   * @param url - Optional URL for the analytics configuration.
   * @param headers - Optional headers to include in the analytics configuration.
   * @param logCallback - Optional callback function for logging messages.
   * @param apiCallback - Optional async callback for sending analytics payloads.
   * @throws Will throw an error if neither (url and optional headers) nor apiCallback are provided.
   */
  constructor(
    url?: string | URL,
    headers?: HttpHeaders,
    logCallback?: LoggingCallback,
    apiCallback?: (payload: AnalyticsPayload) => Promise<void>
  ) {
    if (!apiCallback && url === undefined) {
      throw new Error(
        'AnalyticsConfig: You must provide either an apiCallback or a url (with optional headers).'
      );
    }

    if (url !== undefined) {
      this.url = url
    }
    this.headers = headers
    this.logCallback = logCallback
    this.apiCallback = apiCallback
  }
}
