export function getLearningModuleStorageKey(config, key) {
  return `smartdesk_demo_${config?.id || 'learning-module'}_${key}`;
}
