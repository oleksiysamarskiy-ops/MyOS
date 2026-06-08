import { AppDefinition } from '../types';

// Static registry is empty — all apps are added by the user at runtime.
// See appStore.addApp() / appStore.removeApp().
export const APP_REGISTRY: AppDefinition[] = [];

export function getApp(id: string): AppDefinition | undefined {
  return APP_REGISTRY.find((app) => app.id === id);
}
