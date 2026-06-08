const STORAGE_KEYS = {
  COMPANY_ID: 'revvo_company_id'
} as const;

export const storeCompanyId = (companyId: string) => {
  localStorage.setItem(STORAGE_KEYS.COMPANY_ID, companyId);
};

export const getStoredCompanyId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.COMPANY_ID);
};

export const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.COMPANY_ID);
};