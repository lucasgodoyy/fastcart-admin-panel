export type AdminLanguage = 'pt' | 'en';

const configuredLanguage = (process.env.NEXT_PUBLIC_ADMIN_LANGUAGE || 'pt').toLowerCase();

export const adminLanguage: AdminLanguage = configuredLanguage === 'en' ? 'en' : 'pt';

export const isEnglish = adminLanguage === 'en';

export function t(pt: string, en: string): string {
  return isEnglish ? en : pt;
}
