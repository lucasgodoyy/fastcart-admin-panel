'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Settings, Trophy, Users, Plus, Minus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import loyaltyService from '@/services/admin/loyaltyService';
import { LoyaltySettings, LoyaltyBalance, LoyaltyTransaction } from '@/types/loyalty';
import { t } from '@/lib/admin-language';

const TIER_COLORS: Record<string, string> = {
  BRONZE: 'bg-amber-700 text-white',
  SILVER: 'bg-gray-400 text-white',
  GOLD: 'bg-yellow-500 text-white',
  PLATINUM: 'bg-purple-500 text-white',
};

export function LoyaltyClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('settings');
  const [adjustDialog, setAdjustDialog] = useState<LoyaltyBalance | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const { data: settings, isLoading: loadingSettings } = useQuery<LoyaltySettings | null>({
    queryKey: ['loyalty-settings'],
    queryFn: loyaltyService.getSettings,
  });

  const { data: leaderboardData, isLoading: loadingLeaderboard } = useQuery<{ content: LoyaltyBalance[] }>({
    queryKey: ['loyalty-leaderboard'],
    queryFn: () => loyaltyService.getLeaderboard(),
    enabled: activeTab === 'leaderboard',
  });

  const leaderboard = leaderboardData?.content ?? [];

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const { data: transactions, isLoading: loadingTx } = useQuery<{ content: LoyaltyTransaction[] }>({
    queryKey: ['loyalty-transactions', selectedCustomerId],
    queryFn: () => loyaltyService.getTransactions(selectedCustomerId!),
    enabled: activeTab === 'transactions' && !!selectedCustomerId,
  });

  const [form, setForm] = useState<Partial<LoyaltySettings>>({});

  const updateSettingsMutation = useMutation({
    mutationFn: () => loyaltyService.updateSettings({ ...settings, ...form } as LoyaltySettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-settings'] });
      toast.success(t('Configurações salvas!', 'Settings saved!'));
    },
    onError: () => toast.error(t('Erro ao salvar', 'Error saving')),
  });

  const adjustMutation = useMutation({
    mutationFn: () => loyaltyService.adjustPoints(adjustDialog!.customerId, Number(adjustAmount), adjustReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
      setAdjustDialog(null);
      setAdjustAmount('');
      setAdjustReason('');
      toast.success(t('Pontos ajustados!', 'Points adjusted!'));
    },
    onError: () => toast.error(t('Erro ao ajustar', 'Error adjusting')),
  });

  const s = settings;
  const merged = { ...s, ...form };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('Programa de Fidelidade', 'Loyalty Program')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('Configure pontos, recompensas e acompanhe o engajamento.', 'Configure points, rewards and track engagement.')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings"><Settings className="mr-1.5 h-4 w-4" />{t('Configurações', 'Settings')}</TabsTrigger>
          <TabsTrigger value="leaderboard"><Trophy className="mr-1.5 h-4 w-4" />{t('Ranking', 'Leaderboard')}</TabsTrigger>
          <TabsTrigger value="transactions"><Star className="mr-1.5 h-4 w-4" />{t('Transações', 'Transactions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4">
          {loadingSettings ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm">{t('Acúmulo de Pontos', 'Point Earning')}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>{t('Pontos por real gasto', 'Points per currency unit')}</Label>
                    <Input type="number" value={merged.pointsPerCurrency ?? 1} onChange={(e) => setForm({ ...form, pointsPerCurrency: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>{t('Mínimo para resgate', 'Minimum for redemption')}</Label>
                    <Input type="number" value={merged.minimumRedemption ?? 100} onChange={(e) => setForm({ ...form, minimumRedemption: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>{t('Valor em R$ por ponto', 'Currency value per point')}</Label>
                    <Input type="number" step="0.01" value={merged.currencyPerPoint ?? 0.01} onChange={(e) => setForm({ ...form, currencyPerPoint: Number(e.target.value) })} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">{t('Regras', 'Rules')}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t('Programa ativo', 'Program enabled')}</Label>
                    <Switch checked={merged.enabled ?? false} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
                  </div>
                  <div>
                    <Label>{t('Expiração (dias)', 'Expiry (days)')}</Label>
                    <Input type="number" value={merged.pointsExpiryDays ?? 365} onChange={(e) => setForm({ ...form, pointsExpiryDays: Number(e.target.value) })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t('Pontos em compras', 'Earn on purchases')}</Label>
                    <Switch checked={merged.earnOnPurchase ?? true} onCheckedChange={(v) => setForm({ ...form, earnOnPurchase: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t('Pontos em avaliações', 'Earn on reviews')}</Label>
                    <Switch checked={merged.earnOnReview ?? false} onCheckedChange={(v) => setForm({ ...form, earnOnReview: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t('Pontos por indicação', 'Earn on referrals')}</Label>
                    <Switch checked={merged.earnOnReferral ?? false} onCheckedChange={(v) => setForm({ ...form, earnOnReferral: v })} />
                  </div>
                </CardContent>
              </Card>
              <div className="md:col-span-2">
                <Button onClick={() => updateSettingsMutation.mutate()} disabled={updateSettingsMutation.isPending}>
                  {t('Salvar', 'Save')}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Posição', 'Rank')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Cliente', 'Customer')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Pontos', 'Points')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Tier', 'Tier')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {loadingLeaderboard && <tr><td colSpan={5} className="px-4 py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>}
                {leaderboard?.map((b, i) => (
                  <tr key={b.customerId} className="border-b border-border hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono">#{i + 1}</td>
                    <td className="px-4 py-3 text-sm">{b.customerName || `Customer #${b.customerId}`}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{b.totalPoints?.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TIER_COLORS[b.tier] || 'bg-gray-200 text-gray-800'}`}>{b.tier}</span></td>
                    <td className="px-4 py-3 flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedCustomerId(b.customerId); setActiveTab('transactions'); }}>
                        {t('Transações', 'Transactions')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setAdjustDialog(b); setAdjustAmount(''); setAdjustReason(''); }}>
                        {t('Ajustar', 'Adjust')}
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loadingLeaderboard && leaderboard.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">{t('Nenhum cliente encontrado.', 'No customers found.')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          {!selectedCustomerId && (
            <p className="text-sm text-muted-foreground py-8 text-center">{t('Selecione um cliente no ranking para ver transações.', 'Select a customer from the leaderboard to view transactions.')}</p>
          )}
          {selectedCustomerId && (
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Data', 'Date')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Tipo', 'Type')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Pontos', 'Points')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Descrição', 'Description')}</th>
                </tr>
              </thead>
              <tbody>
                {loadingTx && <tr><td colSpan={4} className="px-4 py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>}
                {transactions?.content?.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Intl.DateTimeFormat('pt-BR').format(new Date(tx.createdAt))}</td>
                    <td className="px-4 py-3"><Badge variant={tx.type === 'EARN' ? 'default' : tx.type === 'REDEEM' ? 'secondary' : 'outline'}>{tx.type}</Badge></td>
                    <td className="px-4 py-3 text-sm font-semibold">{tx.type === 'EARN' ? '+' : '-'}{tx.points}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{tx.description || '—'}</td>
                  </tr>
                ))}
                {!loadingTx && (!transactions?.content || transactions.content.length === 0) && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">{t('Nenhuma transação.', 'No transactions.')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!adjustDialog} onOpenChange={() => setAdjustDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Ajustar Pontos', 'Adjust Points')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('Quantidade (negativo para subtrair)', 'Amount (negative to subtract)')}</Label>
              <Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="+100 ou -50" />
            </div>
            <div>
              <Label>{t('Motivo', 'Reason')}</Label>
              <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog(null)}>{t('Cancelar', 'Cancel')}</Button>
            <Button onClick={() => adjustMutation.mutate()} disabled={adjustMutation.isPending || !adjustAmount}>
              {t('Confirmar', 'Confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
