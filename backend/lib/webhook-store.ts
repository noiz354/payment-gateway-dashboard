export interface WebhookEvent {
  id: string;
  receivedAt: string;
  event?: string;
  status: 'received';
  payload: Record<string, unknown>;
}

const events: WebhookEvent[] = [];
export function saveWebhook(payload: Record<string, unknown>) {
  const event: WebhookEvent = { id: `wh_${Date.now()}_${events.length}`, receivedAt: new Date().toISOString(), event: typeof payload.event === 'string' ? payload.event : undefined, status: 'received', payload };
  events.unshift(event);
  if (events.length > 500) events.pop();
  return event;
}
export function listWebhooks() { return [...events]; }
export function clearWebhooks() { events.length = 0; }
