export function isDemoMode(): boolean {
  const value = process.env.DEMO_MODE;
  return value === "1" || value === "true";
}

export const DEMO_PIN_LOCK_MESSAGE = "Mode demo: PIN tidak dapat diubah.";
export const DEMO_IMPORT_LOCK_MESSAGE = "Mode demo: import data dinonaktifkan.";
