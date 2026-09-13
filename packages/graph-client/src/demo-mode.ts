/** Camera-ready fallbacks. Never surface this flag in the UI. */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE !== "false";
}
