'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SaPageHeader,
  SaCard,
  SaStatCard,
  SaSkeleton,
  fadeInUp,
  staggerContainer,
} from '../ui/sa-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Plus,
  Loader2,
  Send,
  Inbox,
  Archive,
  CheckCircle2,
  User,
  Clock,
  Users,
  Headphones,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api';

/* ── Types (reuse from chat) ── */
type Conversation = {
  id: number;
  customerName: string;
  customerEmail: string;
  status: string;
  channel: string;
  subject: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadAdminCount: number;
  unreadCustomerCount: number;
  totalMessages: number;
  createdAt: string;
  updatedAt: string;
};

type ChatMessage = {
  id: number;
  conversationId: number;
  senderType: string;
  senderName: string;
  senderEmail: string;
  content: string;
  contentType: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

type PaginatedResult<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type ChatStats = {
  totalConversations: number;
  openConversations: number;
  closedConversations: number;
  archivedConversations: number;
  unreadMessages: number;
};

/* ── SA Chat API (uses apiClient instead of admin apiClient) ── */
const saChatService = {
  listConversations: async (params?: {
    page?: number;
    size?: number;
    status?: string;
    channel?: string;
  }): Promise<PaginatedResult<Conversation>> => {
    const res = await apiClient.get('/admin/chat/conversations', { params });
    return res.data;
  },
  listMessages: async (id: number, params?: { page?: number; size?: number }): Promise<PaginatedResult<ChatMessage>> => {
    const res = await apiClient.get(`/admin/chat/conversations/${id}/messages`, { params });
    return res.data;
  },
  sendMessage: async (id: number, content: string): Promise<Conversation> => {
    const res = await apiClient.post(`/admin/chat/conversations/${id}/messages`, { content });
    return res.data;
  },
  createConversation: async (data: {
    customerName: string;
    customerEmail: string;
    subject?: string;
    initialMessage: string;
    channel?: string;
  }): Promise<Conversation> => {
    const res = await apiClient.post('/admin/chat/conversations', data);
    return res.data;
  },
  updateStatus: async (id: number, status: string): Promise<Conversation> => {
    const res = await apiClient.put(`/admin/chat/conversations/${id}/status`, { status });
    return res.data;
  },
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/admin/chat/conversations/${id}/read`);
  },
  getStats: async (): Promise<ChatStats> => {
    const res = await apiClient.get('/admin/chat/stats');
    return res.data;
  },
};

/* ── Channel types ── */
type Channel = 'SUPPORT' | 'TEAM';
const channelsConfig: { value: Channel; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'SUPPORT', label: 'SA ↔ Lojista', description: 'Mensagens entre Super Admin e lojistas', icon: <Headphones className="h-4 w-4" /> },
  { value: 'TEAM', label: 'Lojista ↔ Equipe', description: 'Mensagens internas dos times', icon: <Users className="h-4 w-4" /> },
];

const statusFilters = [
  { value: 'ALL', label: 'Todos' },
  { value: 'OPEN', label: 'Abertos' },
  { value: 'CLOSED', label: 'Fechados' },
  { value: 'ARCHIVED', label: 'Arquivados' },
];

function timeAgo(iso: string | null) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function SaMessagesPage() {
  const queryClient = useQueryClient();
  const [activeChannel, setActiveChannel] = useState<Channel>('SUPPORT');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedId(null);
    setNewMessage('');
  }, [activeChannel]);

  const { data: stats, isLoading: loadingStats } = useQuery<ChatStats>({
    queryKey: ['sa-chat-stats'],
    queryFn: saChatService.getStats,
  });

  const { data: convData, isLoading: loadingConvs } = useQuery<PaginatedResult<Conversation>>({
    queryKey: ['sa-chat-conversations', statusFilter, activeChannel],
    queryFn: () =>
      saChatService.listConversations({
        size: 50,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        channel: activeChannel,
      }),
  });

  const { data: messagesData, isLoading: loadingMessages } = useQuery<PaginatedResult<ChatMessage>>({
    queryKey: ['sa-chat-messages', selectedId],
    queryFn: () => saChatService.listMessages(selectedId!, { size: 100 }),
    enabled: !!selectedId,
  });

  useEffect(() => {
    if (selectedId) saChatService.markAsRead(selectedId).catch(() => {});
  }, [selectedId]);

  const sendMutation = useMutation({
    mutationFn: () => saChatService.sendMessage(selectedId!, newMessage),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['sa-chat-messages', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['sa-chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['sa-chat-stats'] });
    },
    onError: () => toast.error('Erro ao enviar mensagem.'),
  });

  const [form, setForm] = useState({ customerName: '', customerEmail: '', subject: '', initialMessage: '' });
  const createConv = useMutation({
    mutationFn: () => saChatService.createConversation({ ...form, channel: activeChannel }),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ['sa-chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['sa-chat-stats'] });
      setDialogOpen(false);
      setSelectedId(conv.id);
      setForm({ customerName: '', customerEmail: '', subject: '', initialMessage: '' });
      toast.success('Conversa criada!');
    },
    onError: () => toast.error('Erro ao criar conversa.'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => saChatService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['sa-chat-stats'] });
      toast.success('Status atualizado.');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const conversations = convData?.content ?? [];
  const messages = messagesData?.content ?? [];
  const selectedConv = conversations.find((c) => c.id === selectedId);
  const channelInfo = channelsConfig.find((c) => c.value === activeChannel)!;

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeInUp}>
        <SaPageHeader
          title="Mensagens"
          description="Central de mensagens da plataforma"
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Nova conversa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova conversa — {channelInfo.label}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label>{activeChannel === 'SUPPORT' ? 'Nome do lojista' : 'Nome do membro'}</Label>
                    <Input value={form.customerName} onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-mail</Label>
                    <Input type="email" value={form.customerEmail} onChange={(e) => setForm((p) => ({ ...p, customerEmail: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Assunto</Label>
                    <Input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mensagem inicial</Label>
                    <textarea
                      value={form.initialMessage}
                      onChange={(e) => setForm((p) => ({ ...p, initialMessage: e.target.value }))}
                      placeholder="Escreva a primeira mensagem..."
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  </div>
                  <Button className="w-full" onClick={() => createConv.mutate()} disabled={!form.customerName || !form.customerEmail || !form.initialMessage || createConv.isPending}>
                    {createConv.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar conversa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />
      </motion.div>

      {/* Channel tabs */}
      <motion.div variants={fadeInUp} className="flex gap-2">
        {channelsConfig.map((ch) => (
          <button
            key={ch.value}
            onClick={() => setActiveChannel(ch.value)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
              activeChannel === ch.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            {ch.icon}
            {ch.label}
          </button>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <SaSkeleton key={i} className="h-24 rounded-lg" />)
        ) : (
          <>
            <SaStatCard title="Total" value={stats?.totalConversations ?? 0} icon={MessageSquare} />
            <SaStatCard title="Abertos" value={stats?.openConversations ?? 0} icon={Inbox} />
            <SaStatCard title="Fechados" value={stats?.closedConversations ?? 0} icon={CheckCircle2} />
            <SaStatCard title="Não lidas" value={stats?.unreadMessages ?? 0} icon={Clock} />
          </>
        )}
      </motion.div>

      {/* Conversation list + messages */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-480px)] min-h-[400px]">
        {/* Left panel */}
        <SaCard className="flex flex-col overflow-hidden p-0">
          <div className="p-3 border-b border-border">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusFilters.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="flex-1">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Nenhuma conversa neste canal.</div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn('w-full text-left p-3 hover:bg-muted/50 transition-colors', selectedId === conv.id && 'bg-muted')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{conv.customerName}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(conv.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.subject || conv.customerEmail}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{conv.lastMessagePreview || 'Sem mensagens'}</p>
                      {conv.unreadAdminCount > 0 && (
                        <Badge variant="default" className="h-4 px-1 text-[10px] rounded-full">{conv.unreadAdminCount}</Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </SaCard>

        {/* Right panel */}
        <SaCard className="flex flex-col overflow-hidden p-0">
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              {channelInfo.icon}
              <p>Selecione uma conversa para ver as mensagens.</p>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-border flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{selectedConv?.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedConv?.subject || selectedConv?.customerEmail}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {selectedConv?.status !== 'CLOSED' && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: selectedId, status: 'CLOSED' })}>
                      Fechar
                    </Button>
                  )}
                  {selectedConv?.status === 'CLOSED' && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: selectedId, status: 'OPEN' })}>
                      Reabrir
                    </Button>
                  )}
                  {selectedConv?.status !== 'ARCHIVED' && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: selectedId, status: 'ARCHIVED' })}>
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">Nenhuma mensagem nesta conversa.</div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isAdmin = msg.senderType === 'ADMIN';
                      return (
                        <div key={msg.id} className={cn('flex', isAdmin ? 'justify-end' : 'justify-start')}>
                          <div className={cn('max-w-[75%] rounded-lg px-3 py-2', isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {!isAdmin && <User className="h-3 w-3" />}
                              <span className="text-[10px] font-medium">{msg.senderName}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={cn('text-[10px] mt-1', isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                              {new Date(msg.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="border-t border-border p-3 flex gap-2">
                <textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
                      e.preventDefault();
                      sendMutation.mutate();
                    }
                  }}
                  rows={1}
                  className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
                <Button size="icon" disabled={!newMessage.trim() || sendMutation.isPending} onClick={() => sendMutation.mutate()}>
                  {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </SaCard>
      </motion.div>
    </motion.div>
  );
}
