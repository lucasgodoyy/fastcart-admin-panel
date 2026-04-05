"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, Link2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import affiliateService from "@/services/affiliateService";
import { toast } from "sonner";

export default function AffiliateLinksPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ slug: "", destinationUrl: "", utmSource: "", utmMedium: "", utmCampaign: "" });

  const { data: linksData } = useQuery({
    queryKey: ["affiliate-my-links-all"],
    queryFn: () => affiliateService.listLinks({ size: 100 }),
  });

  const createMut = useMutation({
    mutationFn: () =>
      affiliateService.createLink({
        affiliateId: 0, // backend resolves from auth
        slug: form.slug,
        destinationUrl: form.destinationUrl,
        utmSource: form.utmSource || undefined,
        utmMedium: form.utmMedium || undefined,
        utmCampaign: form.utmCampaign || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliate-my-links-all"] });
      setCreateOpen(false);
      setForm({ slug: "", destinationUrl: "", utmSource: "", utmMedium: "", utmCampaign: "" });
      toast.success("Link criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar link"),
  });

  const links = linksData?.content ?? [];

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/ref/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Links</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie seus links de afiliado e acompanhe performance
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Link
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Links de Afiliado ({links.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Slug</TableHead>
                  <TableHead className="text-xs">Destino</TableHead>
                  <TableHead className="text-xs">UTM</TableHead>
                  <TableHead className="text-xs text-right">Cliques</TableHead>
                  <TableHead className="text-xs text-right">Conversões</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                      Nenhum link criado ainda. Crie seu primeiro link!
                    </TableCell>
                  </TableRow>
                )}
                {links.map((lk) => (
                  <TableRow key={lk.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      /{lk.slug}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {lk.destinationUrl || lk.targetUrl}
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      {[lk.utmSource, lk.utmMedium, lk.utmCampaign].filter(Boolean).join(" / ") || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-right">
                      {(lk.totalClicks ?? lk.clicks)?.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-600 text-right">
                      {lk.totalConversions ?? lk.conversions}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        lk.active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      }`}>
                        {lk.active ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyLink(lk.slug)} title="Copiar link">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" asChild title="Abrir destino">
                          <a href={lk.destinationUrl || lk.targetUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Link Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Slug (identificador único)</Label>
              <Input
                placeholder="meu-link-promo"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>URL de Destino</Label>
              <Input
                placeholder="https://loja.com/produto"
                value={form.destinationUrl}
                onChange={(e) => setForm((f) => ({ ...f, destinationUrl: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">UTM Source</Label>
                <Input
                  placeholder="instagram"
                  value={form.utmSource}
                  onChange={(e) => setForm((f) => ({ ...f, utmSource: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">UTM Medium</Label>
                <Input
                  placeholder="social"
                  value={form.utmMedium}
                  onChange={(e) => setForm((f) => ({ ...f, utmMedium: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">UTM Campaign</Label>
                <Input
                  placeholder="lancamento"
                  value={form.utmCampaign}
                  onChange={(e) => setForm((f) => ({ ...f, utmCampaign: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.slug || !form.destinationUrl}>
              {createMut.isPending ? "Criando..." : "Criar Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
