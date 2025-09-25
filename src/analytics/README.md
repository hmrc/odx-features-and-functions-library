# HMRC ODX Features and Functions - Analytics

This package provides a flexible analytics tracking solution for React applications, supporting both REST endpoint and custom callback integrations.

> **Note:** This work makes extensive use of JsDoc/TsDoc. As such, a static site is also available. The below is a brief overview as a quick start guide.

## Features

- **AnalyticsConfig**: Central configuration for analytics, supporting URL-based or callback-based event delivery.
- **AnalyticsConfigProvider**: React context provider for analytics configuration.
- **withPageTracking**: Higher-order component (HOC) to automatically track page views.
- **InteractionTracker**: Class for capturing an analytics payload specific to tracking user events as they interact with a page. Provides startEventTracking()
  and stopEventTracking() methods for use.

## Installation

```bash
npm install hmrc-odx-features-and-functions
```

## Usage

The usage of this package can be broken down into a set of steps:

1. Configure Analytics
2. Tracking Page Views
3. Accessing Analytics Config in Components
4. Tracking user interaction events

### Configure Analytics

You can use either a REST endpoint (`url`) or a custom async callback (`apiCallback`) for analytics delivery.
You must provide at least one.

#### a) Using a URL

```tsx
import React from 'react';
import { AnalyticsConfigProvider } from 'hmrc-odx-features-and-functions';

const App = () => (
  <AnalyticsConfigProvider
    url="https://example.com/analytics"
    headers={{ Authorization: 'Bearer token' }}
    logCallback={msg => console.log('Analytics log:', msg)}
  >
    <YourComponent />
  </AnalyticsConfigProvider>
);
```

#### b) Using an API Callback

```tsx
import React from 'react';
import { AnalyticsConfigProvider, AnalyticsPayload } from 'hmrc-odx-features-and-functions';

const myApiCallback = async (payload: AnalyticsPayload) => {
  // Send payload to your own analytics system
  await fetch('/my-analytics-endpoint', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  });
};

const App = () => (
  <AnalyticsConfigProvider apiCallback={myApiCallback}>
    <YourComponent />
  </AnalyticsConfigProvider>
);
```

### Tracking Page Views

Wrap your page or component with the `withPageTracking` HOC:

```tsx
import React from 'react';
import { withPageTracking } from 'hmrc-odx-features-and-functions';

const MyPage = () => <div>Welcome!</div>;

// Optionally provide a pageName, otherwise the component's name is used
export default withPageTracking(MyPage);
```

Or with a custom page name:

```tsx
const TrackedPage = withPageTracking(MyPage);

// Usage in JSX
<TrackedPage pageName="HomePage" />
```

### Accessing Analytics Config in Components

You can access the analytics config anywhere in your component tree:

```tsx
import React from 'react';
import { useAnalyticsConfig } from 'hmrc-odx-features-and-functions';

const MyComponent = () => {
  const analyticsConfig = useAnalyticsConfig();

  const handleClick = () => {
    if (analyticsConfig.logCallback) {
      analyticsConfig.logCallback('Button clicked!');
    }
  };

  return <button onClick={handleClick}>Log Event</button>;
};
```

### Tracking User Interaction Events

To track user interaction events such as clicks, changes or inputs across your application, use the `InteractionTracker` class.
This allows you to automatically capture events on specified DOM elements and send enriched analytics payloads to your configured endpoint.
As is described in the abve section, you must provide a REST endpoint (`url`) or custom async callback (`apiCallback`).

#### a) Basic setup

```tsx
import React, { useEffect } from 'react';
import {
  InteractionTracker,
  TrackerConfig
} from 'hmrc-odx-features-and-functions';

const trackerConfig: TrackerConfig = {
  url: new URL('https://example.com/analytics')
};

const App = () => {
  useEffect(() => {
    const tracker = new InteractionTracker(trackerConfig);
    tracker.startEventTracking();

    return () => {
      tracker.stopEventTracking();
    };
  }, []);

  return (
    <YourComponent />
  );
};

export default App;
```

Click and change events are tracked as default. `<button />`, `<a />`, `<select />,` and `<input />` will be tracked as default CSS selectors. There is no need to
pass these in configuring the tracker, unless you wish to configure any custom events or CSS selectors, along with additional metadata:

```tsx
import React, { useEffect } from 'react';
import {
  InteractionTracker,
  TrackerConfig
} from 'hmrc-odx-features-and-functions';

const trackerConfig: TrackerConfig = {
  url: new URL('https://example.com/analytics'),
  events: ['focus', 'blur', 'click', 'change'],
  excludeSelectors: ['#no-track']
  metaData: { userId: 'user123' }
};

const App = () => {
  useEffect(() => {
    const tracker = new InteractionTracker(trackerConfig);
    tracker.startEventTracking();

    return () => {
      tracker.stopEventTracking();
    };
  }, []);

  return (
    <YourComponent />
  );
};

export default App;
```

### b) Setup with a custom hook

A consuming application can create a custom useInteractionTracker() hook, for example:

```tsx
import { useEffect } from 'React';
import { InteractionTracker, TrackerConfig } from 'hmrc-odx-features-and-functions';

const useInteractionTracker = (config: TrackerConfig): void => {
  useEffect(() => {
    const tracker = new InteractionTracker(config);
    tracker.startEventTracking();

    return () => {
      tracker.stopEventTracking();
    };
  }, [JSON.stringify(config)]);
};

export default useInteractionTracker;
```

This hook can then be brought into the top level of the application:

```tsx
import useInteractionTracker from '/path';
import { TrackerConfig } from 'hmrc-odx-features-and-functions';

const trackerConfig: TrackerConfig = {
  url: new URL('https://exampleurl.com/analytics')
};

useInteractionTracker(trackerConfig);

const App = () => (
   <YourComponent />
);
```

#### b) With customised payload values

By default, the payload for tracked events will have an `EventType` and `Target` property generated based on the event tracked and target element.
(e.g. for a click event on an anchor tag - `EventType` = EventType.Link and `Target` = 'click')

To override and manually define these properties for a given tracked event, you can configure the TrackerConfig with the optional `loggedEventType` and `target`
options. `target` can be a string if standardised across all instances of the tracked event, or a string returning function which will receive the Event object for
the given event for dynamic Target values.

```tsx
import useInteractionTracker from '/path';
import { TrackerConfig, EventType } from 'hmrc-odx-features-and-functions';

const customPayload = (eventDetails: EventDetails): any => ({
  const element = document.querySelector(eventDetails.target);
  const label = element?.textContent?.trim();

  return (
    customField: 'Custom Field',
    timestamp: new Date().toIsoString(),
    target: label
  );
});

// Example of generating 'dynamic' target value - using href of interacted link
const outboundLinkClickTargetBuilder = (e: Event) => {
  const targetHtml = e.target as HTMLAnchorElement;
  return targetHtml.getAttribute('href');
};

const trackerConfig: TrackerConfig = {
  url: new URL('https://exampleurl.com/analytics'),
  includeSelectors: ['a'],
  events: ['click']
  loggedEventType: EventType.Outbound,
  target: outboundLinkClickTargetBuilder
};

useInteractionTracker(trackerConfig);

const App = () => (
   <YourComponent />
);
```


For any additional payload data, you can populate the `additionalPayload` member of the sent payload by providing a `customPayload` function. This gives you full control over the event data sent to your analytics endpoint.

```tsx
import useInteractionTracker from '/path';
import { TrackerConfig } from 'hmrc-odx-features-and-functions';

const customPayload = (eventDetails: EventDetails): any => ({
  const element = document.querySelector(eventDetails.target);
  const label = element?.textContent?.trim();

  return (
    customField: 'Custom Field',
    timestamp: new Date().toIsoString(),
    target: label
  );
});

const trackerConfig: TrackerConfig = {
  url: new URL('https://exampleurl.com/analytics'),
  customPayload: customPayload
};

useInteractionTracker(trackerConfig);

const App = () => (
   <YourComponent />
);
```

**Note:** If `customPayload` is provided, it will override the default payload and any metadata.

#### Example payload for default configuraion

```
Received Analytics Payload: {
  EventType: 'Navigation',
  Target: 'click',
  ErrorMessage: '',
  AdditionalPayload: {
    type: 'click',
    target: '<button id="button-id" class="button-class">Click Here</button>',
    value: null,
    pageUrl: 'http://example.com',
    pageTitle: 'Page Title'
  }
}
```

#### Example payload for when consumer provides `customPaylod`

```
Received Analytics Payload: {
  EventType: 'Navigation',
  Target: 'click',
  ErrorMessage: '',
  AdditionalPayload: {
    customField: 'Custom Field',
    timestamp: '2025-08-13T14:18:00.000Z',
    target: 'View Payments <TES Link>'
  }
}
```

#### Example payload for clicking on an outbound link
```
Received Analytics Payload: {
  EventType: 'Link',
  Target: 'click',
  ErrorMessage: '',
  AdditionalPayload: {
    type: 'click',
    target: '<a href="https://link-destination" rel="noreferrer noopener">Click Link (opens in new tab)</a>',
    value: null,
    pageUrl: 'http://link-origin',
    pageTitle: 'Example page title'
  }
}
```

## API Reference

### `<AnalyticsConfigProvider />`

| Prop         | Type                                            | Required | Description                                 |
|--------------|-------------------------------------------------|----------|---------------------------------------------|
| url          | `string`                                        | No       | REST endpoint for analytics events          |
| headers      | `Record<string, string>`                        | No       | Optional headers for REST endpoint          |
| logCallback  | `(message: string) => void`                     | No       | Optional logging callback                   |
| apiCallback  | `(payload: AnalyticsPayload) => Promise<void>`  | No       | Custom async callback for analytics events  |
| children     | `React.ReactNode`                               | Yes      | Components to wrap                         |

> **Note:** You must provide either `url` or `apiCallback`.

---

### `withPageTracking(WrappedComponent)`

Wraps a component to automatically send a page view event on mount.

**Props:**

- `pageName?: string` — Optional. If not provided, uses the wrapped component's name.
- `configOveride?: AnalyticsConfig` — Optional. Override the analytics config for this instance.

---

### `useAnalyticsConfig()`

React hook to access the current `AnalyticsConfig` instance.

---

### `AnalyticsPayload`

Represents an analytics event.

```ts
new AnalyticsPayload(
  eventType: EventType,
  target: string,
  errorMessage?: string,
  additionalPayload?: Record<string, any>
)
```

### `InteractionTracker`

A class that tracks user interaction events and sends analytics payloads to a configured endpoint.

```ts
new InteractionTracker(
  config: TrackerConfig
)
```
#### Methods

| Method                | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `startEventTracking()`| Registers DOM event listeners based on config. Tracks interactions automatically. |
| `logEvent(type, target, additionalValue)` | Manually logs a specific event.       |
| `stopEventTracking()` | Removes all registered event listeners. Use for cleanup.                    |
| `trackerConfig`       | Returns the current configuration used by the tracker.


### `TrackerConfig`

Extends `AnalyticsConfig` with additional fields:

| Prop           | Type                                | Description                                                                 |
|----------------|-------------------------------------|-----------------------------------------------------------------------------|
| `events`       | `string[]`                          | DOM event types to track (e.g., `['click', 'change']`).                     |
| `includeSelectors` | `string[]`                      | CSS selectors to include for tracking.                                     |
| `excludeSelectors` | `string[]`                      | CSS selectors to exclude from tracking.                                    |
| `metaData`     | `Record<string, any>`               | Optional metadata to enrich each event payload.                            |
| `customPayload`| `(eventDetails: EventDetails) => any` | Optional function to override the default payload structure.             |
| `loggedEventType`  | `EventType`                     | Optional EventType to override payload `event` property.                   |
| `target`       | `string | (event: Event) => string ` | Optional value (or value generator) to override payload `target` value    |

**Note on limitations:** Pseudo-elements such as ::before, ::after are **not** supported because they are not actual DOM events. Only selectors that are **syntactically valid** will be considered for tracking. A selector may be non-existent within the DOM, but it will not be considered as invalid unless it is syntactically incorrect. For example 'button>', '##id-tag', '['.


## Example: Full Integration

```tsx
import React from 'react';
import { useInteractionHook } from '/path-to-file';
import {
  AnalyticsConfigProvider,
  withPageTracking,
  useAnalyticsConfig,
  AnalyticsPayload,
  EventType,
  InteractionTracker,
  TrackerConfig
} from 'hmrc-odx-features-and-functions';


const trackerConfig: TrackerConfig = {
  url: new URL('https://example.com/analytics')
};

const MyPage = () => <div>Hello, tracked world!</div>;
const TrackedPage = withPageTracking(MyPage);

const App = () => (
  useInteractionTracker(trackerConfig);

  return (
    <AnalyticsConfigProvider url="https://example.com/analytics">
      <TrackedPage />
    </AnalyticsConfigProvider>
  )
);

export default App;
```

## Error Handling

If neither `url` nor `apiCallback` is provided to `AnalyticsConfigProvider`, an error will be thrown.

A `logCallback` is provided to allow an external logging system to be hooked into this library.