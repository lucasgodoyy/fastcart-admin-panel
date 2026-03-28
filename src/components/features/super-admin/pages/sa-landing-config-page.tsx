"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  Megaphone,
  Sparkles,
  BarChart3,
  MessageSquareQuote,
  Globe,
  Search,
} from "lucide-react";
import {
  SaPageHeader,
  SaCard,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import superAdminService from "@/services/super-admin/superAdminService";
import type { LandingConfig, LandingConfigUpdateRequest } from "@/types/super-admin";

function SettingRow({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-4 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
      <div className="flex-1 min-w-0 sm:mr-4">
        <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">
          {label}
        </p>
        {desc && (
          <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mt-0.5">
            {desc}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function SettingSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeInUp}>
      <SaCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--sa-accent))]/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
          </div>
          <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">
            {title}
          </h3>
        </div>
        {children}
      </SaCard>
    </motion.div>
  );
}

export function SaLandingConfigPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("announcement");

  // ── Form state ──────────────────────────────
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementLink, setAnnouncementLink] = useState("");
  const [announcementBgColor, setAnnouncementBgColor] = useState("#10B981");

  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroTypewriterPhrases, setHeroTypewriterPhrases] = useState("");
  const [heroCtaText, setHeroCtaText] = useState("");
  const [heroCtaLink, setHeroCtaLink] = useState("");
  const [heroVideoUrl, setHeroVideoUrl] = useState("");

  const [statsStoresCount, setStatsStoresCount] = useState(0);
  const [statsProductsCount, setStatsProductsCount] = useState(0);
  const [statsUptime, setStatsUptime] = useState("");

  const [testimonials, setTestimonials] = useState("");
  const [showcaseStores, setShowcaseStores] = useState("");

  const [footerInstagram, setFooterInstagram] = useState("");
  const [footerYoutube, setFooterYoutube] = useState("");
  const [footerLinkedin, setFooterLinkedin] = useState("");
  const [footerTiktok, setFooterTiktok] = useState("");

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoOgImage, setSeoOgImage] = useState("");

  const { data: config, isLoading } = useQuery<LandingConfig>({
    queryKey: ["sa-landing-config"],
    queryFn: superAdminService.getLandingConfig,
    retry: false,
  });

  useEffect(() => {
    if (config) {
      setAnnouncementActive(config.announcementActive ?? false);
      setAnnouncementText(config.announcementText ?? "");
      setAnnouncementLink(config.announcementLink ?? "");
      setAnnouncementBgColor(config.announcementBgColor ?? "#10B981");
      setHeroTitle(config.heroTitle ?? "");
      setHeroSubtitle(config.heroSubtitle ?? "");
      setHeroTypewriterPhrases(config.heroTypewriterPhrases ?? "");
      setHeroCtaText(config.heroCtaText ?? "");
      setHeroCtaLink(config.heroCtaLink ?? "");
      setHeroVideoUrl(config.heroVideoUrl ?? "");
      setStatsStoresCount(config.statsStoresCount ?? 0);
      setStatsProductsCount(config.statsProductsCount ?? 0);
      setStatsUptime(config.statsUptime ?? "");
      setTestimonials(config.testimonials ?? "");
      setShowcaseStores(config.showcaseStores ?? "");
      setFooterInstagram(config.footerInstagram ?? "");
      setFooterYoutube(config.footerYoutube ?? "");
      setFooterLinkedin(config.footerLinkedin ?? "");
      setFooterTiktok(config.footerTiktok ?? "");
      setSeoTitle(config.seoTitle ?? "");
      setSeoDescription(config.seoDescription ?? "");
      setSeoOgImage(config.seoOgImage ?? "");
    }
  }, [config]);

  const saveMut = useMutation({
    mutationFn: (req: LandingConfigUpdateRequest) =>
      superAdminService.updateLandingConfig(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-landing-config"] });
      toast.success("Configurações da landing page salvas!");
    },
    onError: () => toast.error("Erro ao salvar configurações."),
  });

  const handleSave = () => {
    saveMut.mutate({
      announcementActive,
      announcementText,
      announcementLink,
      announcementBgColor,
      heroTitle,
      heroSubtitle,
      heroTypewriterPhrases,
      heroCtaText,
      heroCtaLink,
      heroVideoUrl,
      statsStoresCount,
      statsProductsCount,
      statsUptime,
      testimonials,
      showcaseStores,
      footerInstagram,
      footerYoutube,
      footerLinkedin,
      footerTiktok,
      seoTitle,
      seoDescription,
      seoOgImage,
    });
  };

  const tabItems = [
    { value: "announcement", label: "Anúncio", icon: Megaphone },
    { value: "hero", label: "Hero", icon: Sparkles },
    { value: "stats", label: "Números", icon: BarChart3 },
    { value: "testimonials", label: "Depoimentos", icon: MessageSquareQuote },
    { value: "footer", label: "Footer", icon: Globe },
    { value: "seo", label: "SEO", icon: Search },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--sa-accent))]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Landing Page"
        description="Configure o conteúdo da landing page da plataforma — textos, depoimentos, números e SEO"
        actions={
          <Button
            onClick={handleSave}
            disabled={saveMut.isPending}
            className="bg-linear-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-lg gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90"
          >
            {saveMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-lg p-1 flex-wrap h-auto">
          {tabItems.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="gap-1.5 text-[12px] data-[state=active]:bg-[hsl(var(--sa-accent))]/10 data-[state=active]:text-[hsl(var(--sa-accent))] rounded-md"
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Announcement Bar ── */}
        <TabsContent value="announcement">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <SettingSection icon={Megaphone} title="Barra de Anúncio">
              <SettingRow
                label="Ativa"
                desc="Mostrar barra de anúncio no topo da landing page"
              >
                <Switch
                  checked={announcementActive}
                  onCheckedChange={setAnnouncementActive}
                />
              </SettingRow>
              <SettingRow label="Texto" desc="Texto do anúncio (máx 200 caracteres)">
                <Input
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  maxLength={200}
                  placeholder="🔥 Black Friday: 40% OFF no plano anual"
                  className="max-w-sm bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow label="Link" desc="URL de destino ao clicar no anúncio">
                <Input
                  value={announcementLink}
                  onChange={(e) => setAnnouncementLink(e.target.value)}
                  placeholder="/pricing"
                  className="max-w-sm bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow label="Cor de fundo" desc="Cor HEX da barra">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={announcementBgColor}
                    onChange={(e) => setAnnouncementBgColor(e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer"
                  />
                  <Input
                    value={announcementBgColor}
                    onChange={(e) => setAnnouncementBgColor(e.target.value)}
                    className="w-28 bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                  />
                </div>
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* ── Hero ── */}
        <TabsContent value="hero">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <SettingSection icon={Sparkles} title="Seção Hero">
              <SettingRow label="Título" desc="Título principal do hero">
                <Input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  maxLength={200}
                  placeholder="Mais do que loja online."
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow label="Subtítulo" desc="Texto abaixo do título">
                <Textarea
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="Tudo que você precisa para vender online..."
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow
                label="Frases Typewriter"
                desc='Array JSON de frases rotativas. Ex: ["vender mais","crescer rápido"]'
              >
                <Textarea
                  value={heroTypewriterPhrases}
                  onChange={(e) => setHeroTypewriterPhrases(e.target.value)}
                  rows={2}
                  placeholder='["vender mais","receber na hora","crescer rápido"]'
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px] font-mono"
                />
              </SettingRow>
              <SettingRow label="Texto do CTA" desc="Texto do botão principal">
                <Input
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  maxLength={50}
                  placeholder="Criar loja grátis"
                  className="max-w-xs bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow label="Link do CTA" desc="URL de destino do botão">
                <Input
                  value={heroCtaLink}
                  onChange={(e) => setHeroCtaLink(e.target.value)}
                  placeholder="/signup"
                  className="max-w-xs bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow
                label="URL do Vídeo"
                desc="URL do vídeo 'Como funciona' (opcional)"
              >
                <Input
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* ── Stats ── */}
        <TabsContent value="stats">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <SettingSection icon={BarChart3} title="Números (Social Proof)">
              <SettingRow label="Lojas ativas" desc="Número exibido como 'Lojas ativas'">
                <Input
                  type="number"
                  value={statsStoresCount}
                  onChange={(e) => setStatsStoresCount(Number(e.target.value))}
                  className="w-32 bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow
                label="Produtos cadastrados"
                desc="Número exibido como 'Produtos cadastrados'"
              >
                <Input
                  type="number"
                  value={statsProductsCount}
                  onChange={(e) => setStatsProductsCount(Number(e.target.value))}
                  className="w-32 bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow label="Uptime" desc='Ex: "99.9%"'>
                <Input
                  value={statsUptime}
                  onChange={(e) => setStatsUptime(e.target.value)}
                  maxLength={10}
                  placeholder="99.9%"
                  className="w-28 bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* ── Testimonials & Showcase ── */}
        <TabsContent value="testimonials">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <SettingSection icon={MessageSquareQuote} title="Depoimentos">
              <SettingRow
                label="Depoimentos (JSON)"
                desc='Array JSON: [{"name":"Maria","role":"CEO","company":"Loja X","quote":"Texto...","avatarUrl":"/img.jpg"}]'
              >
                <Textarea
                  value={testimonials}
                  onChange={(e) => setTestimonials(e.target.value)}
                  rows={6}
                  placeholder='[{"name":"Maria Silva","role":"CEO","company":"Loja Fashion","quote":"Em 2 meses triplicamos nossas vendas!"}]'
                  className="w-full bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px] font-mono"
                />
              </SettingRow>
            </SettingSection>

            <SettingSection icon={Globe} title="Lojas em Destaque">
              <SettingRow
                label="Showcase (JSON)"
                desc='Array JSON: [{"name":"Loja X","url":"https://...","imageUrl":"/img.jpg","category":"Moda"}]'
              >
                <Textarea
                  value={showcaseStores}
                  onChange={(e) => setShowcaseStores(e.target.value)}
                  rows={6}
                  placeholder='[{"name":"Moda Fashion","url":"https://modafashion.rapidocart.com.br","imageUrl":"/landing/showcase-1.webp","category":"Moda"}]'
                  className="w-full bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px] font-mono"
                />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* ── Footer ── */}
        <TabsContent value="footer">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <SettingSection icon={Globe} title="Links do Footer">
              <SettingRow label="Instagram" desc="URL do perfil no Instagram">
                <Input
                  value={footerInstagram}
                  onChange={(e) => setFooterInstagram(e.target.value)}
                  placeholder="https://instagram.com/rapidocart"
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow label="YouTube" desc="URL do canal no YouTube">
                <Input
                  value={footerYoutube}
                  onChange={(e) => setFooterYoutube(e.target.value)}
                  placeholder="https://youtube.com/@rapidocart"
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow label="LinkedIn" desc="URL do perfil no LinkedIn">
                <Input
                  value={footerLinkedin}
                  onChange={(e) => setFooterLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/company/rapidocart"
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow label="TikTok" desc="URL do perfil no TikTok">
                <Input
                  value={footerTiktok}
                  onChange={(e) => setFooterTiktok(e.target.value)}
                  placeholder="https://tiktok.com/@rapidocart"
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* ── SEO ── */}
        <TabsContent value="seo">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <SettingSection icon={Search} title="SEO & Open Graph">
              <SettingRow label="Título SEO" desc="Tag <title> da landing page">
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  maxLength={200}
                  placeholder="RapidoCart — Crie sua loja virtual grátis"
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow label="Descrição SEO" desc="Meta description">
                <Textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Plataforma completa de e-commerce..."
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
              <SettingRow label="OG Image URL" desc="Imagem para compartilhamento social (1200x630px)">
                <Input
                  value={seoOgImage}
                  onChange={(e) => setSeoOgImage(e.target.value)}
                  placeholder="/og-image.webp"
                  className="max-w-md bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[13px]"
                />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
