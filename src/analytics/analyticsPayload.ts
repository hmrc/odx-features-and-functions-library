/**
 * Represents the payload for analytics data.
 * This class is used to encapsulate information about a specific analytics event,
 * including the target of the event, any associated error messages, and additional
 * payload data in a JSON-compatible format.
 */
export enum EventType {
  Navigation = 'Navigate',
  Outbound = 'Outbound',
  Inbound = 'Inbound',
  Link = 'Link',
  Error = 'Error',
  UserInput = 'UserInput',
  Other = 'Other'
}

export class AnalyticsPayload {
  EventType: EventType
  Target: string
  ErrorMessage?: string
  AdditionalPayload?: Record<string, any>

  /**
   * Constructs an instance of the AnalyticsPayload class.
   * @param {EventType} eventType - The type of the analytics event.
   * @param {string} target - The target of the analytics event.
   * @param {string} [errorMessage] - An optional error message associated with the event.
   * @param {Record<string, any>} [additionalPayload] - An optional additional payload in JSON-compatible format.
   */
  constructor (
    eventType: EventType,
    target: string,
    errorMessage?: string,
    additionalPayload?: Record<string, any>
  ) {
    this.EventType = eventType
    this.Target = target
    this.ErrorMessage = errorMessage
    this.AdditionalPayload = additionalPayload
  }
}