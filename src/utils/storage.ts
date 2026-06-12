const STORAGE_KEYS = {
  COMPANY_ID: 'revvo_company_id',
  SACADOR_ID: 'revvo_sacador_id'
} as const;

export const storeCompanyId = (companyId: string) => {
  localStorage.setItem(STORAGE_KEYS.COMPANY_ID, companyId);
};

export const getStoredCompanyId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.COMPANY_ID);
};

export const storeSacadorId = (sacadorId: string) => {
  localStorage.setItem(STORAGE_KEYS.SACADOR_ID, sacadorId);
};

export const getStoredSacadorId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.SACADOR_ID);
};

export const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.COMPANY_ID);
  localStorage.removeItem(STORAGE_KEYS.SACADOR_ID);
};