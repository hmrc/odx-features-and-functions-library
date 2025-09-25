import { AnalyticsConfig } from './analyticsConfig'
import { AnalyticsPayload } from './analyticsPayload'
import { LogLevel, logMessage } from '../helpers'
import { EventType } from '.'
import { mapEventType, validateAndFilterSelectors, elementCheck } from './analyticsHelpers/interactionTrackerUtils';

/**
 * Configuration interface for the InteractionTracker.
 * Extends AnalyticsConfig and adds fields for event tracking and metadata enrichment.
 * @property events - Array of DOM event types to track (e.g., ['click', 'change']).
 * @property includeSelectors - Array of CSS selectors to include for tracking (e.g., ['button', 'a']).
 * @property excludeSelectors - Array of CSS selectors to exclude from tracking.
 * @property metaData - Optional object containing custom metadata to attach to every event.
 * @property customPayload - Optional function that allows consumers to override the default payload structure.
 *                            If provided, this function receives the raw event details and should return a fully
 *                            customized payload object. When used, this will replace the default payload and
 *                            any metadata enrichment.
*/
export interface TrackerConfig extends AnalyticsConfig {
  events?: string[];
  includeSelectors?: string[];
  excludeSelectors?: string[];
  metaData?: Record<string, any>;
  customPayload?: (eventDetails?: Event ) => any;
  loggedEventType?: EventType;
  target?: string | ((event: Event) => string);
}


/**
 * Interface representing the details of a tracked user interaction event.
 * @property type - The type of DOM event (e.g., 'click', 'change').
 * @property target - A string representation of the target element (e.g., element ID or outerHTML).
 * @property value - The value associated with the event, if applicable (e.g., selected option in a dropdown).
 * @property pageUrl - The full URL of the page where the event occurred.
 * @property pageTitle - The title of the page where the event occurred.
 * @property [key: string] - Additional dynamic properties that may be added by the consumer.
 */
export interface EventDetails {
  type?: string;
  target?: string;
  value?: string | null;
  pageUrl?: string;
  pageTitle?: string;
  [key: string]: any;
}

/**
 * Tracks user interaction events for analytics.
 * Allows consumers to configure which DOM events to track, which elements to include/exclude,
 * and enriches event payloads with metadata. Events are sent to a configured analytics endpoint.
*/
export default class InteractionTracker {

  private _trackerConfig: TrackerConfig

  public get trackerConfig(): TrackerConfig {
    return this._trackerConfig;
  }

  /**
   * Stores event listeners for cleanup.
   */
  private listeners: Record<string, EventListener> = {}

  /**
   * Constructs an instance of the InteractionTracker class
   * @param trackerConfig - The configuration object specifying event types, selectors, endpoint, and metadata.
  */
  constructor(trackerConfig: TrackerConfig) {
    this._trackerConfig = trackerConfig
  }

  /**
   * Initializes event tracking by registering listeners for configured event types.
   * Only events on elements matching includeSelectors (and not excludeSelectors) are tracked.
   * When a tracked event occurs, builds a payload and sends it to the configured analytics endpoint.
   * Please note: all selectors will be considered as valid provided that they are valid syntax for a CSS selector.
   * A selector may not be present in the DOM - it will not be tracked in this case.
   *
   * @example
   * tracker.startEventTracking();
   *
   * @remarks
   * - Default events tracked are 'click' and 'change' if not specified.
   * - Default included selectors are ['button', 'a', 'select', 'input].
  */
  public startEventTracking(): void {
    const eventsToTrack = this._trackerConfig?.events ?? ['click', 'change'];
    const rawInclude = this._trackerConfig?.includeSelectors ?? ['button', 'a', 'select', 'input'];
    const rawExclude = this._trackerConfig?.excludeSelectors ?? [];

    // remove any invalid selectors to be excluded from tracking
    const include = validateAndFilterSelectors(rawInclude);
    const exclude = validateAndFilterSelectors(rawExclude);

    // check for a relevant selector against the target element
    const shouldTrack = (target: Element | null): target is HTMLElement => {
      if (!target) return false;

      let inIncluded = false;
      let inExcluded = false;

      inIncluded = elementCheck(include, target);
      inExcluded = elementCheck(exclude, target);

      return !!inIncluded && !inExcluded;
    };

    for (const eventType of eventsToTrack) {
      const handler: EventListener = (e) => {
        const target = e.target as HTMLElement
        if (!shouldTrack(target)) return

        // compute eventType
        const loggedEventType = this._trackerConfig.loggedEventType ?? mapEventType(eventType, target);

        // compute target
        let loggedTargetValue = eventType
        if(typeof this._trackerConfig.target === 'function'){
          loggedTargetValue = this._trackerConfig.target(e)
        } else if (this._trackerConfig.target !== undefined){
          loggedTargetValue = this._trackerConfig.target
        }

        // compute additionalPayload
        const additionalPayload = typeof this._trackerConfig?.customPayload === 'function' ? this._trackerConfig.customPayload(e) : {}

        this.logEvent(loggedEventType, loggedTargetValue, additionalPayload)
      }

      this.listeners[eventType] = handler
      document.addEventListener(eventType, handler, true)
    }
  }

  /**
   * Builds the analytics payload and sends it to the configured endpoint.
   * Enriches the payload with event details, page URL, title, and optional metadata.
   * If a custom payload is provided, it will override the default payload.
   * @param type - The EventType type of event being logged
   * @param target - The value to populate the target property of the Payload.
   * @param additionalPayload - Data to add to the additionalPayload of the logged event. This will be enriched with event details and metaData if defined on the TrackerConfig
   * @throws will throw an error if neither apiCallback nor targetUrl is provided.
   */
  public async logEvent(type: EventType, target: string, additionalPayload: Record<string, any>): Promise<void> {
    const { url, apiCallback, logCallback } = this._trackerConfig;

    const eventDetails: EventDetails = {
      pageUrl: window.location.href,
      pageTitle: window.document.title
    }

    const payload = {
        ...eventDetails,
        ...this._trackerConfig.metaData,
        ...additionalPayload
      }

    const analyticsPayload = new AnalyticsPayload(type, target, '', payload)

    if (logCallback) {
      logMessage(
        `Logging ${type} event for target: ${target}`,
        LogLevel.INFO,
        logCallback
      );
    }

    try {
      if (apiCallback) {
        await apiCallback(analyticsPayload);
      } else if (url) {
        await fetch(url.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analyticsPayload),
          keepalive: true
        });
      } else {
        throw new Error('No apiCallback or url provided for analytics tracking.');
      }
    } catch (error) {
      if (logCallback) {
        logMessage(
          `Error sending tracking event: '${type}' to tracking API: ${error}`,
          LogLevel.ERROR,
          logCallback
        );
      } else {
        console.error('Tracking failed: ', error);
      }
    }
  }

  /**
   * Removes the event listener and tracking configuration for a given event name.
   * Use this to clean up event tracking when no longer needed.
   */
  public stopEventTracking(): void {
    for (const [eventType, handler] of Object.entries(this.listeners)) {
      document.removeEventListener(eventType, handler, true)
    }
  }
}
