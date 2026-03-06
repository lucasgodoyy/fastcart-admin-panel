'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import marketingService, { AdsAccount } from '@/services/marketingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Plug, Unplug, Facebook, BarChart3, ShoppingBag, Video } from 'lucide-react';
import { toast } from 'sonner';

/* ── Platform definitions ── */

type PlatformDef = {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  fields: { key: string; label: string; placeholder: string; required: boolean }[];
};

const PLATFORMS: PlatformDef[] = [
  {
    key: 'FACEBOOK',
    name: 'Meta (Facebook / Instagram)',
    icon: <Facebook className="h-6 w-6" />,
    color: 'bg-blue-600',
    description:
      'Instale o Pixel do Facebook para rastrear conversões, criar públicos personalizados e otimizar campanhas de anúncios.',
    fields: [
      { key: 'pixelId', label: 'Pixel ID', placeholder: 'Ex: 123456789012345', required: true },
      {
        key: 'catalogId',
        label: 'Catalog ID (opcional)',
        placeholder: 'Ex: 987654321098765',
        required: false,
      },
      {
        key: 'accessToken',
        label: 'Access Token (opcional)',
        placeholder: 'Token de acesso da API de Conversões',
        required: false,
      },
    ],
  },
  {
    key: 'GOOGLE',
    name: 'Google Analytics / Ads',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'bg-amber-500',
    description:
      'Conecte o Google Analytics 4 e/ou Google Ads para medir tráfego, conversões e ROI das campanhas.',
    fields: [
      {
        key: 'accountId',
        label: 'Measurement ID (GA4)',
        placeholder: 'Ex: G-XXXXXXXXXX',
        required: true,
      },
      {
        key: 'pixelId',
        label: 'Conversion ID (Google Ads)',
        placeholder: 'Ex: AW-XXXXXXXXX',
        required: false,
      },
    ],
  },
  {
    key: 'TIKTOK',
    name: 'TikTok Ads',
    icon: <Video className="h-6 w-6" />,
    color: 'bg-black',
    description:
      'Adicione o Pixel do TikTok para rastrear eventos e otimizar campanhas no TikTok Ads Manager.',
    fields: [
      { key: 'pixelId', label: 'Pixel ID', placeholder: 'Ex: CXXXXXXXXXXXXXXXXX', required: true },
      {
        key: 'accessToken',
        label: 'Access Token (opcional)',
        placeholder: 'Token para Events API',
        required: false,
      },
    ],
  },
  {
    key: 'GOOGLE_MERCHANT',
    name: 'Google Merchant Center',
    icon: <ShoppingBag className="h-6 w-6" />,
    color: 'bg-green-600',
    description:
      'Sincronize seu catálogo de produtos com o Google Merchant Center para aparecer no Google Shopping.',
    fields: [
      {
        key: 'accountId',
        label: 'Merchant ID',
        placeholder: 'Ex: 123456789',
        required: true,
      },
      {
        key: 'catalogId',
        label: 'Feed ID (opcional)',
        placeholder: 'ID do feed de produtos',
        required: false,
      },
    ],
  },
];

/* ── Component ── */

export function IntegrationsClient() {
  const queryClient = useQueryClient();

  // State
  const [connectPlatform, setConnectPlatform] = useState<PlatformDef | null>(null);
  const [disconnectPlatform, setDisconnectPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Queries
  const { data: accounts = [], isLoading } = useQuery<AdsAccount[]>({
    queryKey: ['ads-accounts'],
    queryFn: marketingService.listAdsAccounts,
  });

  // Mutations
  const connectMut = useMutation({
    mutationFn: marketingService.connectAdsAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads-accounts'] });
      toast.success('Integração conectada com sucesso!');
      setConnectPlatform(null);
      setFormData({});
    },
    onError: () => toast.error('Erro ao conectar integração.'),
  });

  const disconnectMut = useMutation({
    mutationFn: marketingService.disconnectAdsAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads-accounts'] });
      toast.success('Integração desconectada.');
      setDisconnectPlatform(null);
    },
    onError: () => toast.error('Erro ao desconectar integração.'),
  });

  // Helpers
  const getAccount = (platform: string): AdsAccount | undefined =>
    accounts.find((a) => a.platform === platform);

  const handleConnect = (platform: PlatformDef) => {
    const existing = getAccount(platform.key);
    if (existing) {
      // Pre-fill form with existing data
      setFormData({
        accountId: existing.accountId || '',
        accountName: existing.accountName || '',
        pixelId: existing.pixelId || '',
        catalogId: existing.catalogId || '',
      });
    } else {
      setFormData({});
    }
    setConnectPlatform(platform);
  };

  const handleSubmitConnect = () => {
    if (!connectPlatform) return;

    const requiredFields = connectPlatform.fields.filter((f) => f.required);
    const missing = requiredFields.filter((f) => !formData[f.key]?.trim());
    if (missing.length > 0) {
      toast.error(`Preencha: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }

    connectMut.mutate({
      platform: connectPlatform.key,
      accountId: formData.accountId || formData.pixelId || '',
      accountName: connectPlatform.name,
      accessToken: formData.accessToken || undefined,
      pixelId: formData.pixelId || undefined,
      catalogId: formData.catalogId || undefined,
      status: 'ACTIVE',
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Integrações</h2>
        <p className="text-muted-foreground">
          Conecte pixels, analytics e catálogos para rastrear conversões e otimizar seus anúncios.
        </p>
      </div>

      {/* Platform cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const account = getAccount(platform.key);
          const isConnected = account?.status === 'ACTIVE';

          return (
            <Card key={platform.key} className="relative overflow-hidden">
              {/* Color bar */}
              <div className={`absolute top-0 left-0 h-1 w-full ${platform.color}`} />

              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pt-5">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${platform.color} text-white`}
                >
                  {platform.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {platform.name}
                    {isConnected ? (
                      <Badge variant="default" className="bg-green-600 text-xs">
                        Conectado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Desconectado
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm">{platform.description}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Show current config if connected */}
                {isConnected && account && (
                  <div className="rounded-md border bg-muted/50 p-3 text-sm space-y-1">
                    {account.pixelId && (
                      <p>
                        <span className="font-medium">Pixel/Tag:</span> {account.pixelId}
                      </p>
                    )}
                    {account.accountId && (
                      <p>
                        <span className="font-medium">ID da Conta:</span> {account.accountId}
                      </p>
                    )}
                    {account.catalogId && (
                      <p>
                        <span className="font-medium">Catálogo:</span> {account.catalogId}
                      </p>
                    )}
                    {account.lastSyncAt && (
                      <p className="text-muted-foreground">
                        Última sincronização:{' '}
                        {new Date(account.lastSyncAt).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant={isConnected ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleConnect(platform)}
                  >
                    <Plug className="mr-2 h-4 w-4" />
                    {isConnected ? 'Editar Configuração' : 'Conectar'}
                  </Button>
                  {isConnected && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDisconnectPlatform(platform.key)}
                    >
                      <Unplug className="mr-2 h-4 w-4" />
                      Desconectar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Connect Dialog ── */}
      <Dialog
        open={!!connectPlatform}
        onOpenChange={(open) => {
          if (!open) {
            setConnectPlatform(null);
            setFormData({});
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {connectPlatform
                ? getAccount(connectPlatform.key)
                  ? `Editar ${connectPlatform.name}`
                  : `Conectar ${connectPlatform.name}`
                : 'Conectar'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da integração. Você encontra essas informações no painel da
              plataforma de anúncios.
            </DialogDescription>
          </DialogHeader>

          {connectPlatform && (
            <div className="space-y-4 py-2">
              {connectPlatform.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.key}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  />
                </div>
              ))}

              <Button
                className="w-full"
                onClick={handleSubmitConnect}
                disabled={connectMut.isPending}
              >
                {connectMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {getAccount(connectPlatform.key) ? 'Salvar Alterações' : 'Conectar Integração'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Disconnect Confirmation ── */}
      <AlertDialog
        open={!!disconnectPlatform}
        onOpenChange={(open) => !open && setDisconnectPlatform(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar integração?</AlertDialogTitle>
            <AlertDialogDescription>
              O pixel/tag será removido da sua loja. Você poderá reconectar a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => disconnectPlatform && disconnectMut.mutate(disconnectPlatform)}
              disabled={disconnectMut.isPending}
            >
              {disconnectMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
