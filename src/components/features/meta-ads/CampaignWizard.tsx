'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  Users,
  Image as ImageIcon,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Save,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import metaAdsService from '@/services/metaAdsService';
import type { MetaCampaignDraft, CreateMetaCampaignRequest } from '@/types/meta-ads';

// ── Wizard steps ─────────────────────────────────────────

const STEPS = [
  { key: 'audience', label: 'Público-alvo', icon: Users },
  { key: 'creative', label: 'Criativo', icon: ImageIcon },
  { key: 'budget', label: 'Orçamento', icon: DollarSign },
] as const;

const OBJECTIVE_OPTIONS = [
  { value: 'OUTCOME_TRAFFIC', label: 'Tráfego' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engajamento' },
  { value: 'OUTCOME_LEADS', label: 'Geração de Leads' },
  { value: 'OUTCOME_SALES', label: 'Vendas / Conversões' },
  { value: 'OUTCOME_AWARENESS', label: 'Reconhecimento' },
];

const PLACEMENT_OPTIONS = [
  { value: 'AUTOMATIC', label: 'Automático (recomendado)' },
  { value: 'FEED', label: 'Feed do Facebook' },
  { value: 'STORIES', label: 'Stories' },
  { value: 'REELS', label: 'Reels' },
  { value: 'INSTAGRAM_FEED', label: 'Feed do Instagram' },
  { value: 'INSTAGRAM_STORIES', label: 'Stories do Instagram' },
];

interface CampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: MetaCampaignDraft | null;
  onComplete: () => void;
}

interface WizardData {
  // Step 1 – Audience
  name: string;
  objective: string;
  targetAgeMin: number;
  targetAgeMax: number;
  targetGender: string;
  targetInterests: string;
  targetLocations: string;
  // Step 2 – Creative
  adTitle: string;
  adBody: string;
  adImageUrl: string;
  adLinkUrl: string;
  adCallToAction: string;
  placement: string;
  // Step 3 – Budget
  dailyBudget: string; // in BRL (display)
  startDate: string;
  endDate: string;
}

const DEFAULT_DATA: WizardData = {
  name: '',
  objective: 'OUTCOME_TRAFFIC',
  targetAgeMin: 18,
  targetAgeMax: 65,
  targetGender: 'ALL',
  targetInterests: '',
  targetLocations: 'BR',
  adTitle: '',
  adBody: '',
  adImageUrl: '',
  adLinkUrl: '',
  adCallToAction: 'LEARN_MORE',
  placement: 'AUTOMATIC',
  dailyBudget: '50.00',
  startDate: '',
  endDate: '',
};

const CTA_OPTIONS = [
  { value: 'LEARN_MORE', label: 'Saiba Mais' },
  { value: 'SHOP_NOW', label: 'Comprar Agora' },
  { value: 'SIGN_UP', label: 'Cadastre-se' },
  { value: 'CONTACT_US', label: 'Fale Conosco' },
  { value: 'GET_OFFER', label: 'Obter Oferta' },
];

export function CampaignWizard({ open, onOpenChange, draft, onComplete }: CampaignWizardProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [draftId, setDraftId] = useState<number | undefined>(undefined);
  const [data, setData] = useState<WizardData>(DEFAULT_DATA);

  // Initialize from draft if editing
  useEffect(() => {
    if (draft) {
      setDraftId(draft.id);
      setStep(Math.max(0, (draft.wizardStep ?? 1) - 1));
      try {
        const parsed = JSON.parse(draft.draftJson);
        setData({ ...DEFAULT_DATA, ...parsed });
      } catch {
        setData(DEFAULT_DATA);
      }
    } else {
      setDraftId(undefined);
      setStep(0);
      setData(DEFAULT_DATA);
    }
  }, [draft, open]);

  // ── Mutations ────────────────────────────────────────

  const saveDraftMut = useMutation({
    mutationFn: () =>
      metaAdsService.saveDraft(
        {
          name: data.name || 'Rascunho sem nome',
          wizardStep: step + 1,
          draftJson: JSON.stringify(data),
        },
        draftId,
      ),
    onSuccess: (saved) => {
      setDraftId(saved.id);
      queryClient.invalidateQueries({ queryKey: ['meta-ads-drafts'] });
      toast.success('Rascunho salvo!');
    },
    onError: () => toast.error('Erro ao salvar rascunho.'),
  });

  const createCampaignMut = useMutation({
    mutationFn: () => {
      const req: CreateMetaCampaignRequest = {
        name: data.name,
        objective: data.objective,
        dailyBudget: Math.round(parseFloat(data.dailyBudget) * 100),
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        ageMin: data.targetAgeMin,
        ageMax: data.targetAgeMax,
        gender: data.targetGender,
        interestsJson: data.targetInterests || undefined,
        locationsJson: data.targetLocations || undefined,
        headline: data.adTitle || undefined,
        description: data.adBody || undefined,
        callToAction: data.adCallToAction || undefined,
        mediaUrlsJson: data.adImageUrl ? JSON.stringify([data.adImageUrl]) : undefined,
      };
      return metaAdsService.createCampaign(req);
    },
    onSuccess: () => {
      toast.success('Campanha criada com sucesso!');
      onComplete();
    },
    onError: () => toast.error('Erro ao criar campanha.'),
  });

  const update = (field: keyof WizardData, value: string | number) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canGoNext = () => {
    if (step === 0) return !!data.name && !!data.objective;
    if (step === 1) return !!data.adTitle && !!data.adBody;
    if (step === 2) return !!data.dailyBudget && parseFloat(data.dailyBudget) > 0;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {draft ? 'Continuar Campanha' : 'Nova Campanha Meta Ads'}
          </DialogTitle>
          <DialogDescription>
            Crie uma campanha em 3 passos: defina o público, monte o criativo e ajuste o orçamento.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-colors ${
                  i <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Audience */}
        {step === 0 && (
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="campaignName">Nome da Campanha *</Label>
              <Input
                id="campaignName"
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Ex: Black Friday - Tráfego para loja"
              />
            </div>
            <div>
              <Label>Objetivo *</Label>
              <Select value={data.objective} onValueChange={(v) => update('objective', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Idade Mínima</Label>
                <Input
                  type="number"
                  min={13}
                  max={65}
                  value={data.targetAgeMin}
                  onChange={(e) => update('targetAgeMin', parseInt(e.target.value) || 18)}
                />
              </div>
              <div>
                <Label>Idade Máxima</Label>
                <Input
                  type="number"
                  min={13}
                  max={65}
                  value={data.targetAgeMax}
                  onChange={(e) => update('targetAgeMax', parseInt(e.target.value) || 65)}
                />
              </div>
            </div>
            <div>
              <Label>Gênero</Label>
              <Select value={data.targetGender} onValueChange={(v) => update('targetGender', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="MALE">Masculino</SelectItem>
                  <SelectItem value="FEMALE">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Interesses</Label>
              <Input
                value={data.targetInterests}
                onChange={(e) => update('targetInterests', e.target.value)}
                placeholder="Ex: moda, calçados, fitness (separados por vírgula)"
              />
              <p className="text-xs text-muted-foreground mt-1">Deixe vazio para targeting amplo.</p>
            </div>
            <div>
              <Label>Localização</Label>
              <Input
                value={data.targetLocations}
                onChange={(e) => update('targetLocations', e.target.value)}
                placeholder="Ex: BR, US, PT"
              />
            </div>
          </div>
        )}

        {/* Step 2: Creative */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div>
              <Label>Título do Anúncio *</Label>
              <Input
                value={data.adTitle}
                onChange={(e) => update('adTitle', e.target.value)}
                placeholder="Ex: Até 70% OFF na Black Friday!"
                maxLength={40}
              />
              <p className="text-xs text-muted-foreground mt-1">{data.adTitle.length}/40 caracteres</p>
            </div>
            <div>
              <Label>Texto do Anúncio *</Label>
              <Textarea
                value={data.adBody}
                onChange={(e) => update('adBody', e.target.value)}
                placeholder="Descubra as melhores ofertas da temporada. Frete grátis para todo o Brasil."
                rows={3}
                maxLength={125}
              />
              <p className="text-xs text-muted-foreground mt-1">{data.adBody.length}/125 caracteres</p>
            </div>
            <div>
              <Label>URL da Imagem</Label>
              <Input
                value={data.adImageUrl}
                onChange={(e) => update('adImageUrl', e.target.value)}
                placeholder="https://sua-loja.com/imagens/banner.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">Recomendado: 1200×628px para feed, 1080×1920px para stories.</p>
            </div>
            <div>
              <Label>URL de Destino</Label>
              <Input
                value={data.adLinkUrl}
                onChange={(e) => update('adLinkUrl', e.target.value)}
                placeholder="https://sua-loja.com/promocao"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chamada para Ação</Label>
                <Select value={data.adCallToAction} onValueChange={(v) => update('adCallToAction', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CTA_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Posicionamento</Label>
                <Select value={data.placement} onValueChange={(v) => update('placement', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACEMENT_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div>
              <Label>Orçamento Diário (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                min="1"
                value={data.dailyBudget}
                onChange={(e) => update('dailyBudget', e.target.value)}
                placeholder="50.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo recomendado: R$ 20,00/dia.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={data.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Deixe vazio para iniciar imediatamente ao publicar.</p>
              </div>
              <div>
                <Label>Data de Término</Label>
                <Input
                  type="date"
                  value={data.endDate}
                  onChange={(e) => update('endDate', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Deixe vazio para sem limite.</p>
              </div>
            </div>

            {/* Summary box */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h4 className="text-sm font-semibold">Resumo da Campanha</h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p><strong>Nome:</strong> {data.name || '—'}</p>
                <p><strong>Objetivo:</strong> {OBJECTIVE_OPTIONS.find((o) => o.value === data.objective)?.label}</p>
                <p><strong>Público:</strong> {data.targetAgeMin}–{data.targetAgeMax} anos, {data.targetGender === 'ALL' ? 'Todos' : data.targetGender}</p>
                <p><strong>Criativo:</strong> {data.adTitle || '—'}</p>
                <p><strong>Orçamento:</strong> R$ {data.dailyBudget}/dia</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => saveDraftMut.mutate()}
              disabled={saveDraftMut.isPending}
            >
              {saveDraftMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Rascunho
            </Button>
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="gap-1">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canGoNext()} className="gap-1">
                Próximo <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => createCampaignMut.mutate()}
                disabled={createCampaignMut.isPending || !canGoNext()}
                className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createCampaignMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                Criar Campanha
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
