import { AnalyticsPayload, EventType } from '../../src/analytics/analyticsPayload';

describe('Given a AnalyticsPayload is created', () => {
  const testCases: {
    description: string;
    args: [EventType, string, string?, Record<string, any>?];
    expected: {
      Target: string;
      ErrorMessage?: string;
      AdditionalPayload?: Record<string, unknown> | null;
      EventType: EventType;
    };
  }[] = [
      {
        description: 'When only EventType and target are provided, Then EventType and target are set and other properties undefined',
        args: [EventType.Navigation, 'TestTarget'],
        expected: { Target: 'TestTarget', ErrorMessage: undefined, AdditionalPayload: undefined, EventType: EventType.Navigation },
      },
      {
        description: 'When EventType, target and error message are provided, Then EventType, target and error message are set.',
        args: [EventType.Error, 'TestTarget', 'TestError'],
        expected: { Target: 'TestTarget', ErrorMessage: 'TestError', AdditionalPayload: undefined, EventType: EventType.Error },
      },
      {
        description: 'When EventType, target, error message, and additional payload are provided, Then all properties set correctly.',
        args: [EventType.Navigation, 'TestTarget', 'TestError', { key1: 'value1', key2: 42 }],
        expected: { Target: 'TestTarget', ErrorMessage: 'TestError', AdditionalPayload: { key1: 'value1', key2: 42 }, EventType: EventType.Navigation },
      },
      {
        description: 'When EventType, target, and empty additional payload are provided, Then additional payload is set as an empty object.',
        args: [EventType.Navigation, 'TestTarget', undefined, {}],
        expected: { Target: 'TestTarget', ErrorMessage: undefined, AdditionalPayload: {}, EventType: EventType.Navigation },
      },
      {
        description: 'When EventType, target, and undefined additional payload are provided, Then additional payload is set as undefined.',
        args: [EventType.Navigation, 'TestTarget', undefined, undefined],
        expected: { Target: 'TestTarget', ErrorMessage: undefined, AdditionalPayload: undefined, EventType: EventType.Navigation },
      },
    ];

  testCases.forEach(({ description, args, expected }) => {
    it(description, () => {
      const payload = new AnalyticsPayload(...args);
      expect(payload.Target).toBe(expected.Target);
      expect(payload.ErrorMessage).toBe(expected.ErrorMessage);
      expect(payload.AdditionalPayload).toEqual(expected.AdditionalPayload);
      expect(payload.EventType).toBe(expected.EventType);
    });
  });
});