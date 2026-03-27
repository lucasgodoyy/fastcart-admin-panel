"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Crown,
  LoaderCircle,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { superAdminService } from "@/services/super-admin";
import type { CreateOrUpdatePlanRequest, SubscriptionPlan } from "@/types/super-admin";
import { SaCard, SaEmptyState, SaPageHeader, SaSkeleton } from "../ui/sa-components";

const emptyPlanForm: CreateOrUpdatePlanRequest = {
  name: "",
  slug: "",
  description: "",
  priceCents: 0,
  annualPriceCents: null,
  sortOrder: 0,
  maxProducts: 100,
  maxStores: 1,
  maxStaff: 2,
  trialPeriodDays: 0,
  features: [],
  isActive: true,
  isPopular: false,
  stripeProductId: null,
  stripePriceId: null,
  annualStripePriceId: null,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function centsToBrl(cents?: number | null) {
  return `R$ ${((cents ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function errorMessage(error: unknown, fallback: string) {
  const maybeAxios = error as { response?: { data?: { message?: string } } };
  return maybeAxios.response?.data?.message ?? fallback;
}

function mapPlanToForm(plan: SubscriptionPlan): CreateOrUpdatePlanRequest {
  return {
    name: plan.name,
    slug: plan.slug,
    description: plan.description ?? "",
    priceCents: plan.priceCents,
    annualPriceCents: plan.annualPriceCents,
    billingPeriod: plan.billingPeriod,
    sortOrder: plan.sortOrder,
    isPopular: plan.isPopular,
    isActive: plan.isActive,
    maxStores: plan.maxStores,
    maxProducts: plan.maxProducts,
    maxStaff: plan.maxStaff,
    trialPeriodDays: plan.trialPeriodDays,
    features: plan.features,
    stripeProductId: plan.stripeProductId,
    stripePriceId: plan.stripePriceId,
    annualStripePriceId: plan.annualStripePriceId,
  };
}

export function SaSubscriptionPlanEditorPage({ planId }: { planId?: number }) {
  const isEditing = typeof planId === "number" && Number.isFinite(planId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateOrUpdatePlanRequest>({ ...emptyPlanForm });
  const [featuresText, setFeaturesText] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const { data: plan, isLoading, isError } = useQuery({
    queryKey: ["sa-plan", planId],
    queryFn: () => superAdminService.getPlan(planId as number),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!plan) {
      return;
    }

    setFormData(mapPlanToForm(plan));
    setFeaturesText((plan.features ?? []).join("\n"));
    setSlugEdited(true);
  }, [plan]);

  const saveMutation = useMutation({
    mutationFn: async (body: CreateOrUpdatePlanRequest) => {
      if (isEditing) {
        return superAdminService.updatePlan(planId as number, body);
      }
      return superAdminService.createPlan(body);
    },
    onSuccess: async (savedPlan) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sa-plans"] }),
        queryClient.invalidateQueries({ queryKey: ["sa-plan", savedPlan.id] }),
      ]);
      toast.success(isEditing ? "Plano atualizado com sucesso." : "Plano criado com sucesso.");
      router.push(`/super-admin/subscriptions/plans/${savedPlan.id}`);
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Não foi possível salvar o plano."));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: () => superAdminService.togglePlanActive(planId as number),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sa-plans"] }),
        queryClient.invalidateQueries({ queryKey: ["sa-plan", planId] }),
      ]);
      toast.success("Status do plano atualizado.");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Não foi possível alterar o status do plano."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => superAdminService.deletePlan(planId as number),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sa-plans"] });
      toast.success("Plano excluído com sucesso.");
      router.push("/super-admin/subscriptions");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Não foi possível excluir o plano."));
    },
  });

  const featureItems = featuresText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const monthlyPrice = centsToBrl(formData.priceCents);
  const annualPrice = centsToBrl(formData.annualPriceCents);
  const isBusy = saveMutation.isPending || toggleMutation.isPending || deleteMutation.isPending;

  function updateField<K extends keyof CreateOrUpdatePlanRequest>(field: K, value: CreateOrUpdatePlanRequest[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function handleNameChange(value: string) {
    setFormData((current) => ({
      ...current,
      name: value,
      slug: !isEditing && !slugEdited ? slugify(value) : current.slug,
    }));
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    updateField("slug", slugify(value));
  }

  function handleSave() {
    const normalizedSlug = slugify(formData.slug || formData.name);
    const body: CreateOrUpdatePlanRequest = {
      ...formData,
      name: formData.name.trim(),
      slug: normalizedSlug,
      description: formData.description?.trim() || null,
      features: featureItems,
      annualPriceCents: formData.annualPriceCents ?? null,
      maxProducts: formData.maxProducts ?? null,
      stripeProductId: formData.stripeProductId?.trim() || null,
      stripePriceId: formData.stripePriceId?.trim() || null,
      annualStripePriceId: formData.annualStripePriceId?.trim() || null,
      sortOrder: formData.sortOrder ?? 0,
    };

    saveMutation.mutate(body);
  }

  if (isEditing && isLoading) {
    return (
      <div className="space-y-8">
        <SaPageHeader title="Carregando plano" description="Buscando as configurações salvas do plano." />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
          <SaSkeleton className="h-[620px] rounded-lg" />
          <SaSkeleton className="h-[620px] rounded-lg" />
        </div>
      </div>
    );
  }

  if (isEditing && isError) {
    return (
      <SaEmptyState
        icon={Ticket}
        title="Plano não encontrado"
        description="Não foi possível carregar esse plano. Volte para a listagem e tente novamente."
      />
    );
  }

  return (
    <div className="space-y-8">
      <SaPageHeader
        title={
          isEditing
            ? `Editar Plano: ${plan?.name ?? formData.name ?? "Plano"}`
            : "Novo plano de assinatura"
        }
        description="Use uma página dedicada para organizar preço, limites, Stripe e benefícios sem sobrepor a listagem de planos."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" className="rounded-lg border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]">
              <Link href="/super-admin/subscriptions">
                <ArrowLeft className="h-4 w-4" /> Voltar para planos
              </Link>
            </Button>
            <Button
              onClick={handleSave}
              disabled={isBusy || !formData.name.trim() || !slugify(formData.slug || formData.name)}
              className="rounded-lg bg-[hsl(var(--sa-accent))] text-white hover:bg-[hsl(var(--sa-accent-hover))]"
            >
              {saveMutation.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> {isEditing ? "Salvar alterações" : "Criar plano"}
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
        <div className="space-y-6">
          <SaCard className="overflow-hidden rounded-lg border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-0">
            <div className="border-b border-[hsl(var(--sa-border-subtle))] bg-linear-to-r from-[hsl(var(--sa-accent-subtle))] via-[hsl(var(--sa-surface))] to-[hsl(var(--sa-success-subtle))] px-6 py-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[hsl(var(--sa-accent))] text-white">Plano SaaS</Badge>
                {formData.isPopular && <Badge variant="secondary">Destaque comercial</Badge>}
                <Badge variant="outline" className="border-[hsl(var(--sa-border))] text-[hsl(var(--sa-text-secondary))]">
                  {formData.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <h2 className="mt-4 text-[24px] font-bold tracking-tight text-[hsl(var(--sa-text))]">
                {formData.name || "Configure um plano profissional"}
              </h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[hsl(var(--sa-text-muted))]">
                Estruture posicionamento, capacidade operacional, IDs de cobrança e benefícios de forma clara. Isso evita formulários sobrepostos e facilita manutenção futura.
              </p>
            </div>

            <div className="grid gap-6 px-6 py-6">
              <section className="space-y-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-[hsl(var(--sa-text))]">Identidade do plano</h3>
                  <p className="mt-1 text-[12px] text-[hsl(var(--sa-text-muted))]">
                    Nome comercial, slug técnico e descrição curta que aparecem para o time e em integrações.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="plan-name">Nome</Label>
                    <Input
                      id="plan-name"
                      value={formData.name}
                      onChange={(event) => handleNameChange(event.target.value)}
                      placeholder="Ex: Plus"
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-slug">Slug</Label>
                    <Input
                      id="plan-slug"
                      value={formData.slug}
                      onChange={(event) => handleSlugChange(event.target.value)}
                      placeholder="Ex: plus"
                      className="h-11 rounded-lg"
                    />
                    <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                      URL técnica: {slugify(formData.slug || formData.name) || "preencha o nome do plano"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-description">Descrição</Label>
                  <Textarea
                    id="plan-description"
                    value={formData.description ?? ""}
                    onChange={(event) => updateField("description", event.target.value)}
                    placeholder="Ideal para lojas em crescimento com operação recorrente e catálogo robusto."
                    className="min-h-28 rounded-lg"
                  />
                </div>
              </section>

              <Separator className="bg-[hsl(var(--sa-border-subtle))]" />

              <section className="space-y-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-[hsl(var(--sa-text))]">Precificação e posicionamento</h3>
                  <p className="mt-1 text-[12px] text-[hsl(var(--sa-text-muted))]">
                    Cadastre preços e ordenação de exibição para refletir seu catálogo comercial.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="plan-price">Preço mensal (centavos)</Label>
                    <Input
                      id="plan-price"
                      type="number"
                      value={formData.priceCents}
                      onChange={(event) => updateField("priceCents", Number.parseInt(event.target.value, 10) || 0)}
                      placeholder="4900"
                      className="h-11 rounded-lg"
                    />
                    <p className="text-[11px] text-[hsl(var(--sa-success))]">{monthlyPrice} / mês</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-annual">Preço anual (centavos)</Label>
                    <Input
                      id="plan-annual"
                      type="number"
                      value={formData.annualPriceCents ?? ""}
                      onChange={(event) =>
                        updateField(
                          "annualPriceCents",
                          event.target.value ? Number.parseInt(event.target.value, 10) : null,
                        )
                      }
                      placeholder="47000"
                      className="h-11 rounded-lg"
                    />
                    <p className="text-[11px] text-[hsl(var(--sa-success))]">{annualPrice} / ano</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-order">Ordem de exibição</Label>
                    <Input
                      id="plan-order"
                      type="number"
                      value={formData.sortOrder ?? 0}
                      onChange={(event) => updateField("sortOrder", Number.parseInt(event.target.value, 10) || 0)}
                      placeholder="0"
                      className="h-11 rounded-lg"
                    />
                    <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">Menor número aparece primeiro.</p>
                  </div>
                </div>
              </section>

              <Separator className="bg-[hsl(var(--sa-border-subtle))]" />

              <section className="space-y-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-[hsl(var(--sa-text))]">Limites operacionais</h3>
                  <p className="mt-1 text-[12px] text-[hsl(var(--sa-text-muted))]">
                    Defina a capacidade do plano para produtos, lojas, equipe e trial.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-products">Máx. produtos</Label>
                    <Input
                      id="plan-products"
                      type="number"
                      value={formData.maxProducts ?? ""}
                      onChange={(event) =>
                        updateField(
                          "maxProducts",
                          event.target.value ? Number.parseInt(event.target.value, 10) : null,
                        )
                      }
                      placeholder="vazio = ilimitado"
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-stores">Máx. lojas</Label>
                    <Input
                      id="plan-stores"
                      type="number"
                      value={formData.maxStores ?? 1}
                      onChange={(event) => updateField("maxStores", Number.parseInt(event.target.value, 10) || 1)}
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-staff">Máx. membros</Label>
                    <Input
                      id="plan-staff"
                      type="number"
                      value={formData.maxStaff ?? 1}
                      onChange={(event) => updateField("maxStaff", Number.parseInt(event.target.value, 10) || 1)}
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-trial">Dias de trial</Label>
                    <Input
                      id="plan-trial"
                      type="number"
                      value={formData.trialPeriodDays ?? 0}
                      onChange={(event) =>
                        updateField("trialPeriodDays", Number.parseInt(event.target.value, 10) || 0)
                      }
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>
              </section>

              <Separator className="bg-[hsl(var(--sa-border-subtle))]" />

              <section className="space-y-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-[hsl(var(--sa-text))]">Stripe e cobrança</h3>
                  <p className="mt-1 text-[12px] text-[hsl(var(--sa-text-muted))]">
                    Registre os identificadores usados por checkout, webhook e sincronização comercial.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="stripe-product">Stripe Product ID</Label>
                    <Input
                      id="stripe-product"
                      value={formData.stripeProductId ?? ""}
                      onChange={(event) => updateField("stripeProductId", event.target.value)}
                      placeholder="prod_..."
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-monthly">Stripe Price ID mensal</Label>
                    <Input
                      id="stripe-monthly"
                      value={formData.stripePriceId ?? ""}
                      onChange={(event) => updateField("stripePriceId", event.target.value)}
                      placeholder="price_..."
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-annual">Stripe Price ID anual</Label>
                    <Input
                      id="stripe-annual"
                      value={formData.annualStripePriceId ?? ""}
                      onChange={(event) => updateField("annualStripePriceId", event.target.value)}
                      placeholder="price_..."
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>
              </section>

              <Separator className="bg-[hsl(var(--sa-border-subtle))]" />

              <section className="space-y-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-[hsl(var(--sa-text))]">Benefícios e destaque</h3>
                  <p className="mt-1 text-[12px] text-[hsl(var(--sa-text-muted))]">
                    Escreva uma feature por linha e marque o posicionamento comercial do plano.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-features">Lista de benefícios</Label>
                  <Textarea
                    id="plan-features"
                    value={featuresText}
                    onChange={(event) => setFeaturesText(event.target.value)}
                    placeholder={"Até 500 produtos\nCertificado SSL\nPIX automático\nSuporte prioritário"}
                    className="min-h-40 rounded-lg"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-6 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="plan-active"
                      checked={formData.isActive ?? true}
                      onCheckedChange={(checked) => updateField("isActive", checked)}
                    />
                    <div>
                      <Label htmlFor="plan-active">Plano ativo</Label>
                      <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">Disponível para seleção.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="plan-popular"
                      checked={formData.isPopular ?? false}
                      onCheckedChange={(checked) => updateField("isPopular", checked)}
                    />
                    <div>
                      <Label htmlFor="plan-popular">Plano em destaque</Label>
                      <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">Usa badge comercial de “mais popular”.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </SaCard>
        </div>

        <div className="space-y-6">
          <SaCard className="rounded-lg border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--sa-text-muted))]">Pré-visualização</p>
                <h3 className="mt-1 text-[18px] font-semibold text-[hsl(var(--sa-text))]">
                  {formData.name || "Seu novo plano"}
                </h3>
              </div>
              <Badge className="bg-[hsl(var(--sa-success-subtle))] text-[hsl(var(--sa-success))]">
                {formData.isActive ? "Publicado" : "Rascunho"}
              </Badge>
            </div>

            <div className="mt-5 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-linear-to-br from-[hsl(var(--sa-accent-subtle))] via-[hsl(var(--sa-surface))] to-[hsl(var(--sa-success-subtle))] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))] shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-[hsl(var(--sa-text-muted))]">Preço mensal</p>
                  <p className="text-[28px] font-bold tracking-tight text-[hsl(var(--sa-text))]">{monthlyPrice}</p>
                </div>
              </div>
              <p className="mt-4 text-[12px] leading-6 text-[hsl(var(--sa-text-secondary))]">
                {formData.description?.trim() || "Adicione uma descrição curta para facilitar a decisão comercial e o entendimento do time."}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <InfoRow icon={WalletCards} label="Cobrança anual" value={formData.annualPriceCents ? annualPrice : "Não configurada"} />
              <InfoRow icon={Boxes} label="Produtos" value={formData.maxProducts == null ? "Ilimitado" : `${formData.maxProducts}`} />
              <InfoRow icon={Store} label="Lojas" value={`${formData.maxStores ?? 1}`} />
              <InfoRow icon={Users} label="Membros" value={`${formData.maxStaff ?? 1}`} />
              <InfoRow icon={ShieldCheck} label="Trial" value={`${formData.trialPeriodDays ?? 0} dia(s)`} />
            </div>
          </SaCard>

          <SaCard className="rounded-lg border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-6">
            <h3 className="text-[15px] font-semibold text-[hsl(var(--sa-text))]">Benefícios listados</h3>
            <p className="mt-1 text-[12px] text-[hsl(var(--sa-text-muted))]">
              O que será percebido por quem compara os planos.
            </p>
            <div className="mt-4 space-y-2">
              {featureItems.length > 0 ? (
                featureItems.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-2 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] px-3 py-3"
                  >
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--sa-success))]" />
                    <span className="text-[12px] leading-5 text-[hsl(var(--sa-text-secondary))]">{feature}</span>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-[hsl(var(--sa-border-subtle))] px-4 py-6 text-center text-[12px] text-[hsl(var(--sa-text-muted))]">
                  Adicione benefícios para enriquecer a comparação entre planos.
                </p>
              )}
            </div>
          </SaCard>

          {isEditing && (
            <SaCard className="rounded-lg border border-red-500/20 bg-[hsl(var(--sa-surface))] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-[hsl(var(--sa-text))]">Ações rápidas</h3>
                  <p className="mt-1 text-[12px] text-[hsl(var(--sa-text-muted))]">
                    Controle o status do plano ou remova-o do catálogo com segurança.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <Button
                  variant="outline"
                  onClick={() => toggleMutation.mutate()}
                  disabled={isBusy}
                  className="justify-start rounded-lg border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))]"
                >
                  {toggleMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {formData.isActive ? "Desativar este plano" : "Reativar este plano"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={isBusy}
                  className="justify-start rounded-lg"
                >
                  {deleteMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Excluir plano
                </Button>
              </div>
            </SaCard>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof WalletCards;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))]">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{label}</span>
      </div>
      <span className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{value}</span>
    </div>
  );
}