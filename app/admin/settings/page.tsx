import dynamic from 'next/dynamic'

const SettingsClient = dynamic(
  () => import('@/components/features/settings/SettingsClient').then(m => m.SettingsClient),
  { loading: () => <div className="p-8 text-sm text-muted-foreground">Carregando configurações...</div> }
)

export default function SettingsPage() {
  return <SettingsClient />
}
