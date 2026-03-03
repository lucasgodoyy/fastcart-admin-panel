'use client';

import { useTheme } from 'next-themes';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { t } from '@/lib/admin-language';

const ADMIN_THEMES = [
  { value: 'light', label: () => t('Padrão (Teal)', 'Default (Teal)'), color: 'oklch(0.55 0.15 170)' },
  { value: 'warm', label: () => t('Quente (Terracota)', 'Warm (Terracotta)'), color: 'oklch(0.55 0.16 30)' },
];

export function AdminThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Palette className="h-4 w-4" />
          <span className="sr-only">{t('Trocar tema', 'Switch theme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {ADMIN_THEMES.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className="flex items-center gap-2"
          >
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: t.color }}
            />
            <span>{t.label()}</span>
            {theme === t.value && (
              <span className="ml-auto text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
