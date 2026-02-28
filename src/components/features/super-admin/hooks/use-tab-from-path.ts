"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Derives the active tab value from the URL path and provides a setter
 * that navigates to the correct sub-route when the user clicks a tab.
 *
 * @param basePath - e.g. "/super-admin/finance"
 * @param tabRouteMap - Maps tab value → sub-route segment. The "default" tab
 *                      maps to the base path itself (empty string).
 *                      e.g. { overview: "", transactions: "transactions", payouts: "payouts", fees: "fees" }
 * @param defaultTab  - The tab value to use when no sub-route matches.
 */
export function useTabFromPath(
  basePath: string,
  tabRouteMap: Record<string, string>,
  defaultTab: string,
) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = useMemo(() => {
    const base = basePath.replace(/\/+$/, "");
    const current = pathname.replace(/\/+$/, "");
    const suffix = current.startsWith(base) ? current.slice(base.length).replace(/^\//, "") : "";

    for (const [tab, route] of Object.entries(tabRouteMap)) {
      if (route === suffix) return tab;
    }
    return defaultTab;
  }, [pathname, basePath, tabRouteMap, defaultTab]);

  const setTab = useCallback(
    (tab: string) => {
      const base = basePath.replace(/\/+$/, "");
      const segment = tabRouteMap[tab] ?? "";
      const target = segment ? `${base}/${segment}` : base;
      router.push(target);
    },
    [basePath, tabRouteMap, router],
  );

  return [currentTab, setTab] as const;
}
