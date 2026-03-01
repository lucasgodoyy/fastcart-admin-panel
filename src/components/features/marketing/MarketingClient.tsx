'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import marketingService, {
  MarketingStats,
  MarketingCampaign,
  MarketingBanner,
  Paginated,
} from '@/services/marketingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Megaphone,
  ImageIcon,
  Loader2,
  Plus,
  Target,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

const statusLabels: Record<string, string> = {
  ACTIVE: 'Ativa',
  PAUSED: 'Pausada',
  DRAFT: 'Rascunho',
  ENDED: 'Encerrada',
  SCHEDULED: 'Agendada',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  ENDED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

function formatCurrency(cents: number | null) {
  if (cents == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function MarketingClient() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('campaigns');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Stats
  const { data: stats, isLoading: loadingStats } = useQuery<MarketingStats>({
    queryKey: ['marketing-stats'],
    queryFn: marketingService.getStats,
  });

  // Campaigns
  const { data: campaignsData, isLoading: loadingCampaigns } = useQuery<Paginated<MarketingCampaign>>({
    queryKey: ['marketing-campaigns'],
    queryFn: () => marketingService.listCampaigns({ size: 20 }),
  });

  // Banners
  const { data: bannersData, isLoading: loadingBanners } = useQuery<Paginated<MarketingBanner>>({
    queryKey: ['marketing-banners'],
    queryFn: () => marketingService.listBanners({ size: 20 }),
  });

  // Create campaign form
  const [form, setForm] = useState({
    name: '',
    type: 'DISCOUNT',
    channel: 'EMAIL',
    status: 'DRAFT',
  });

  const createCampaign = useMutation({
    mutationFn: () => marketingService.createCampaign(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
      toast.success('Campanha criada!');
      setDialogOpen(false);
      setForm({ name: '', type: 'DISCOUNT', channel: 'EMAIL', status: 'DRAFT' });
    },
    onError: () => toast.error('Erro ao criar campanha.'),
  });

  const deleteCampaign = useMutation({
    mutationFn: marketingService.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
      toast.success('Campanha removida.');
    },
  });

  const campaigns = campaignsData?.content ?? [];
  const banners = bannersData?.content ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Marketing</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie campanhas, banners e push notifications da sua loja.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nova campanha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Black Friday 2025"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISCOUNT">Desconto</SelectItem>
                    <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                    <SelectItem value="BUNDLE">Bundle</SelectItem>
                    <SelectItem value="SEASONAL">Sazonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Canal</Label>
                <Select value={form.channel} onValueChange={(v) => setForm((p) => ({ ...p, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">E-mail</SelectItem>
                    <SelectItem value="PUSH">Push</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="SOCIAL">Redes sociais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={() => createCampaign.mutate()}
                disabled={!form.name || createCampaign.isPending}
              >
                {createCampaign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Campanhas Ativas</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.activeCampaigns ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Banners Ativos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.activeBanners ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Conversões</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.totalConversions ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Receita</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : formatCurrency(stats?.totalRevenueCents ?? null)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        {/* Campaigns tab */}
        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loadingCampaigns ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhuma campanha ainda. Crie a primeira!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Conversões</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.channel}</p>
                        </TableCell>
                        <TableCell className="text-sm">{c.type}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[c.status] ?? ''}`}>
                            {statusLabels[c.status] ?? c.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm">{c.views}</TableCell>
                        <TableCell className="text-right text-sm">{c.clicks}</TableCell>
                        <TableCell className="text-right text-sm">{c.conversions}</TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatCurrency(c.revenueCents)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => deleteCampaign.mutate(c.id)}
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners tab */}
        <TabsContent value="banners" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loadingBanners ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : banners.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum banner cadastrado.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Posição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Impressões</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead>Período</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <p className="text-sm font-medium">{b.title}</p>
                          {b.subtitle && <p className="text-xs text-muted-foreground">{b.subtitle}</p>}
                        </TableCell>
                        <TableCell className="text-sm">{b.position || '—'}</TableCell>
                        <TableCell>
                          {b.active ? (
                            <Badge variant="outline" className="text-green-600 border-green-300">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm">{b.impressions}</TableCell>
                        <TableCell className="text-right text-sm">{b.clicks}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(b.startsAt)} — {formatDate(b.endsAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
