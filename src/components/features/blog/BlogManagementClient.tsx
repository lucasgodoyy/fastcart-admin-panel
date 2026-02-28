'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import blogService from '@/services/blogService';
import { BlogPost, BlogPostUpsertRequest } from '@/types/blog';

const QUERY_KEY = ['blog-posts'];

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'post';

type BlogFormState = {
  title: string;
  slug: string;
  content: string;
  summary: string;
  featuredImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
};

const emptyForm = (): BlogFormState => ({
  title: '',
  slug: '',
  content: '',
  summary: '',
  featuredImageUrl: '',
  seoTitle: '',
  seoDescription: '',
  published: false,
});

export function BlogManagementClient() {
  const queryClient = useQueryClient();
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [form, setForm] = useState<BlogFormState>(emptyForm());

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: QUERY_KEY,
    queryFn: blogService.list,
  });

  const createMutation = useMutation({
    mutationFn: (payload: BlogPostUpsertRequest) => blogService.create(payload),
    onSuccess: () => {
      toast.success('Post criado com sucesso.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setForm(emptyForm());
    },
    onError: () => toast.error('Não foi possível criar o post.'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: BlogPostUpsertRequest) => {
      if (!editingPostId) throw new Error('post id missing');
      return blogService.update(editingPostId, payload);
    },
    onSuccess: () => {
      toast.success('Post atualizado com sucesso.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setEditingPostId(null);
      setForm(emptyForm());
    },
    onError: () => toast.error('Não foi possível atualizar o post.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: number) => blogService.remove(postId),
    onSuccess: () => {
      toast.success('Post removido.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      if (editingPostId) {
        setEditingPostId(null);
        setForm(emptyForm());
      }
    },
    onError: () => toast.error('Não foi possível remover o post.'),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [posts]
  );

  const onSubmit = () => {
    if (!form.title.trim()) {
      toast.error('Informe o título do post.');
      return;
    }

    if (!form.content.trim()) {
      toast.error('Informe o conteúdo do post.');
      return;
    }

    const payload: BlogPostUpsertRequest = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      content: form.content.trim(),
      summary: form.summary.trim(),
      featuredImageUrl: form.featuredImageUrl.trim(),
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
      published: form.published,
    };

    if (editingPostId) {
      updateMutation.mutate(payload);
      return;
    }

    createMutation.mutate(payload);
  };

  const editPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      summary: post.summary || '',
      featuredImageUrl: post.featuredImageUrl || '',
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      published: post.published,
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Blog</h1>
        <p className="text-sm text-muted-foreground">Crie posts por loja com persistência no backend SaaS.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingPostId ? 'Editar post' : 'Criar post'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog-title">Título</Label>
            <Input
              id="blog-title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  title: event.target.value,
                  slug: prev.slug ? prev.slug : slugify(event.target.value),
                }))
              }
              placeholder="Título do post"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blog-content">Conteúdo</Label>
            <textarea
              id="blog-content"
              className="min-h-[220px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blog-summary">Resumo (opcional)</Label>
            <textarea
              id="blog-summary"
              className="min-h-[92px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              value={form.summary}
              onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blog-image">Imagem principal (URL)</Label>
            <Input
              id="blog-image"
              value={form.featuredImageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, featuredImageUrl: event.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="blog-seo-title">Título SEO</Label>
              <Input
                id="blog-seo-title"
                value={form.seoTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))}
                placeholder="Título SEO"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-slug">Slug</Label>
              <Input
                id="blog-slug"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
                placeholder="slug-do-post"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blog-seo-description">Descrição SEO</Label>
            <textarea
              id="blog-seo-description"
              className="min-h-[92px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              value={form.seoDescription}
              onChange={(event) => setForm((prev) => ({ ...prev, seoDescription: event.target.value }))}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => setForm((prev) => ({ ...prev, published: event.target.checked }))}
            />
            Publicar post
          </label>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={onSubmit} disabled={isSaving}>
              {editingPostId ? 'Salvar alterações' : 'Criar post'}
            </Button>
            {editingPostId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingPostId(null);
                  setForm(emptyForm());
                }}
                disabled={isSaving}
              >
                Cancelar edição
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando posts...</p>}

          {!isLoading && sortedPosts.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum post criado ainda.</p>
          )}

          {sortedPosts.map((post) => (
            <div key={post.id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{post.title}</p>
                  <p className="text-xs text-muted-foreground">/{post.slug}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {post.published ? 'Publicado' : 'Rascunho'} · Atualizado em {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => editPost(post)}>
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(post.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
