/**
 * Save a company assessment score to localStorage.
 * Call this from the test results page after completing an assessment.
 *
 * @param companyName - Must match the `name` field in companyList (e.g. "TCS NQT")
 * @param score - Score as a number 0–100
 */
export function saveCompanyScore(companyName: string, score: number): void {
  try {
    const existing = JSON.parse(localStorage.getItem('company-scores') || '{}');
    existing[companyName] = score;
    localStorage.setItem('company-scores', JSON.stringify(existing));
    // Trigger storage event for same-tab listeners
    window.dispatchEvent(new StorageEvent('storage', { key: 'company-scores' }));
  } catch {
    // ignore
  }
}

/**
 * Get all saved company scores.
 */
export function getCompanyScores(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem('company-scores') || '{}');
  } catch {
    return {};
  }
}
