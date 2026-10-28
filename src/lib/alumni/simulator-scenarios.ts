export const simulatorScenarios = [
  { id: 'transport', label: 'Transportation request', body: 'Could someone help me arrange a ride to my meeting tomorrow?', action: 'Assist with transportation resources', priority: 'high' },
  { id: 'housing', label: 'Housing resources', body: 'Can someone call me about housing options?', action: 'Return requested call', priority: 'high' },
  { id: 'employment', label: 'Job search', body: 'Do you have information about employment resources?', action: 'Assist with employment resources', priority: 'normal' },
  { id: 'meeting', label: 'Alumni meeting', body: 'What time is the next alumni meeting?', action: 'Invite to alumni meeting', priority: 'normal' },
  { id: 'checkin', label: 'Friendly hello', body: 'Just checking in. Things are going well!', action: null, priority: 'low' },
] as const;
