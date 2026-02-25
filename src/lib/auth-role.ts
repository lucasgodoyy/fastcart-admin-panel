export type CanonicalRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER';

export function normalizeRole(role?: string | null): CanonicalRole | undefined {
  if (!role) return undefined;

  const cleaned = role.trim().toUpperCase();
  const withoutPrefix = cleaned.startsWith('ROLE_') ? cleaned.slice(5) : cleaned;

  if (withoutPrefix === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (withoutPrefix === 'ADMIN') return 'ADMIN';
  if (withoutPrefix === 'STAFF') return 'STAFF';
  if (withoutPrefix === 'CUSTOMER') return 'CUSTOMER';

  return undefined;
}
