'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Plus,
  Archive,
  CheckCircle2,
  Circle,
  Clock,
  MailOpen,
  Loader2,
  User,
  Headphones,
  X,
  MessagesSquare,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import chatService from '@/services/chatService';
import type {
  Conversation,
  ChatMessage,
  ConversationStatus,
  ChatStats,
} from '@/types/chat';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ═══════════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<ConversationStatus, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  OPEN: { icon: <Circle className="h-3 w-3 fill-green-500 text-green-500" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/40', label: 'Aberta' },
  CLOSED: { icon: <CheckCircle2 className="h-3 w-3" />, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', label: 'Fechada' },
  ARCHIVED: { icon: <Archive className="h-3 w-3" />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40', label: 'Arquivada' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
  } catch {
    return '';
  }
}

function formatTime(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'HH:mm', { locale: ptBR });
  } catch {
    return '';
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    return format(d, "dd 'de' MMM", { locale: ptBR });
  } catch {
    return '';
  }
}

// ═══════════════════════════════════════════════════════════════
//  Stat Card
// ═══════════════════════════════════════════════════════════════

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  New Conversation Dialog
// ═══════════════════════════════════════════════════════════════

function NewConversationDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (c: Conversation) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Preencha nome, email e mensagem.');
      return;
    }
    setLoading(true);
    try {
      const conversation = await chatService.createConversation({
        customerName: name.trim(),
        customerEmail: email.trim(),
        subject: subject.trim() || undefined,
        initialMessage: message.trim(),
      });
      toast.success('Conversa criada com sucesso!');
      onCreated(conversation);
      onOpenChange(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      toast.error('Erro ao criar conversa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conversa</DialogTitle>
          <DialogDescription>Inicie uma conversa com um cliente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Input placeholder="Nome do cliente" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email do cliente" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Assunto (opcional)" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea
            placeholder="Mensagem inicial..."
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Iniciar conversa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Conversation List Item
// ═══════════════════════════════════════════════════════════════

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[conversation.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 transition-colors hover:bg-accent/50 border-b border-border/50 ${
        isActive ? 'bg-accent' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(conversation.customerName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium">{conversation.customerName}</span>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {timeAgo(conversation.lastMessageAt)}
            </span>
          </div>
          {conversation.subject && (
            <p className="truncate text-xs text-muted-foreground mt-0.5">{conversation.subject}</p>
          )}
          <div className="flex items-center justify-between gap-2 mt-1">
            <p className="truncate text-xs text-muted-foreground">
              {conversation.lastMessagePreview || 'Sem mensagens'}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {conversation.unreadAdminCount > 0 && (
                <Badge variant="default" className="h-5 min-w-[20px] justify-center rounded-full px-1.5 text-[10px]">
                  {conversation.unreadAdminCount}
                </Badge>
              )}
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.color}`}>
                {cfg.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Message Bubble
// ═══════════════════════════════════════════════════════════════

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isAdmin = msg.senderType === 'ADMIN';
  const isSystem = msg.senderType === 'SYSTEM';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[11px] text-muted-foreground bg-muted rounded-full px-3 py-1">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
          isAdmin
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        }`}
      >
        {!isAdmin && (
          <p className="text-[11px] font-medium opacity-70 mb-0.5">{msg.senderName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] opacity-60">{formatTime(msg.createdAt)}</span>
          {isAdmin && msg.read && <CheckCircle2 className="h-3 w-3 opacity-60" />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Date Separator
// ═══════════════════════════════════════════════════════════════

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <Separator className="flex-1" />
      <span className="text-[11px] text-muted-foreground shrink-0">{formatDate(date)}</span>
      <Separator className="flex-1" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ChatClient (main)
// ═══════════════════════════════════════════════════════════════

export function ChatClient() {
  // ── State ────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<ChatStats | null>(null);

  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | ''>('');
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [showActions, setShowActions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load conversations ───────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { size: 100 };
      if (statusFilter) params.status = statusFilter;
      const result = await chatService.listConversations(params);
      setConversations(result.content);
    } catch {
      // silent – polling
    }
  }, [statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const s = await chatService.getStats();
      setStats(s);
    } catch {
      // silent
    }
  }, []);

  // ── Initial load ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoadingConvs(true);
      await Promise.all([loadConversations(), loadStats()]);
      setLoadingConvs(false);
    };
    init();
  }, [loadConversations, loadStats]);

  // ── Polling every 10s ────────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(() => {
      loadConversations();
      loadStats();
    }, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadConversations, loadStats]);

  // ── Load messages for active conversation ────────────────
  const loadMessages = useCallback(
    async (convId: number) => {
      setLoadingMsgs(true);
      try {
        const result = await chatService.listMessages(convId, { size: 200 });
        setMessages(result.content);
        // mark as read
        await chatService.markAsRead(convId).catch(() => {});
        // refresh unread counters
        loadConversations();
        loadStats();
      } catch {
        toast.error('Erro ao carregar mensagens.');
      } finally {
        setLoadingMsgs(false);
      }
    },
    [loadConversations, loadStats]
  );

  // Poll messages for the active conversation
  useEffect(() => {
    if (!activeConv) return;
    const interval = setInterval(() => {
      loadMessages(activeConv.id);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeConv, loadMessages]);

  // ── Scroll to bottom ────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Select conversation ─────────────────────────────────
  const selectConversation = (conv: Conversation) => {
    setActiveConv(conv);
    setShowActions(false);
    loadMessages(conv.id);
  };

  // ── Send message ────────────────────────────────────────
  const handleSend = async () => {
    if (!msgInput.trim() || !activeConv) return;
    setSendingMsg(true);
    try {
      await chatService.sendMessage(activeConv.id, { content: msgInput.trim() });
      setMsgInput('');
      await loadMessages(activeConv.id);
    } catch {
      toast.error('Erro ao enviar mensagem.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Status update ───────────────────────────────────────
  const handleStatusChange = async (status: ConversationStatus) => {
    if (!activeConv) return;
    try {
      const updated = await chatService.updateStatus(activeConv.id, status);
      setActiveConv(updated);
      loadConversations();
      loadStats();
      toast.success(`Conversa ${STATUS_CONFIG[status].label.toLowerCase()}.`);
    } catch {
      toast.error('Erro ao atualizar status.');
    }
    setShowActions(false);
  };

  // ── New conversation created ────────────────────────────
  const handleConvCreated = (conv: Conversation) => {
    loadConversations();
    loadStats();
    selectConversation(conv);
  };

  // ── Filter ──────────────────────────────────────────────
  const filteredConversations = conversations.filter((c) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(term) ||
        c.customerEmail.toLowerCase().includes(term) ||
        (c.subject ?? '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  // ── Date grouping helper for messages ───────────────────
  function groupedMessages(msgs: ChatMessage[]) {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';
    for (const m of msgs) {
      const d = new Date(m.createdAt).toDateString();
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: m.createdAt, messages: [m] });
      } else {
        groups[groups.length - 1].messages.push(m);
      }
    }
    return groups;
  }

  // ═══════════════════════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* ── Stats Bar ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 p-4 pb-3">
        <StatCard label="Não lidas" value={stats?.totalUnread ?? 0} icon={<MailOpen className="h-4 w-4" />} />
        <StatCard label="Abertas" value={stats?.openConversations ?? 0} icon={<MessagesSquare className="h-4 w-4" />} />
        <StatCard label="Fechadas" value={stats?.closedConversations ?? 0} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      {/* ── Main Chat Area ────────────────────────────── */}
      <div className="flex flex-1 min-h-0 mx-4 mb-4 rounded-lg border bg-card overflow-hidden">
        {/* ── Left Panel: Conversation List ────────────── */}
        <div className="w-80 shrink-0 border-r flex flex-col">
          {/* Header */}
          <div className="p-3 border-b space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversas
              </h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNewConvOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="h-8 pl-8 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Status tabs */}
            <div className="flex gap-1">
              {(['' as const, 'OPEN' as const, 'CLOSED' as const, 'ARCHIVED' as const] as const).map((s) => (
                <Button
                  key={s || 'all'}
                  variant={statusFilter === s ? 'default' : 'ghost'}
                  size="sm"
                  className="h-6 text-[11px] px-2"
                  onClick={() => setStatusFilter(s as ConversationStatus | '')}
                >
                  {s ? STATUS_CONFIG[s as ConversationStatus].label : 'Todas'}
                </Button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <ScrollArea className="flex-1">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma conversa encontrada</p>
                <Button variant="link" size="sm" className="mt-1 text-xs" onClick={() => setNewConvOpen(true)}>
                  Iniciar nova conversa
                </Button>
              </div>
            ) : (
              filteredConversations.map((c) => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  isActive={activeConv?.id === c.id}
                  onClick={() => selectConversation(c)}
                />
              ))
            )}
          </ScrollArea>
        </div>

        {/* ── Right Panel: Messages ────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConv ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Chat com clientes</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Selecione uma conversa ao lado ou inicie uma nova para começar a atender seus clientes.
              </p>
              <Button className="mt-4" onClick={() => setNewConvOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova conversa
              </Button>
            </div>
          ) : (
            <>
              {/* Message header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(activeConv.customerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{activeConv.customerName}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_CONFIG[activeConv.status].color}`}>
                        {STATUS_CONFIG[activeConv.status].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{activeConv.customerEmail}</p>
                  </div>
                </div>
                <div className="relative">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowActions(!showActions)}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {showActions && (
                    <div className="absolute right-0 top-full mt-1 w-44 rounded-md border bg-popover p-1 shadow-md z-50">
                      {activeConv.status !== 'OPEN' && (
                        <button
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                          onClick={() => handleStatusChange('OPEN')}
                        >
                          <Circle className="h-3.5 w-3.5 text-green-500" /> Reabrir
                        </button>
                      )}
                      {activeConv.status !== 'CLOSED' && (
                        <button
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                          onClick={() => handleStatusChange('CLOSED')}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-gray-500" /> Fechar
                        </button>
                      )}
                      {activeConv.status !== 'ARCHIVED' && (
                        <button
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                          onClick={() => handleStatusChange('ARCHIVED')}
                        >
                          <Archive className="h-3.5 w-3.5 text-orange-500" /> Arquivar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <ScrollArea className="flex-1 px-4 py-3">
                {loadingMsgs && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-6 w-6 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  groupedMessages(messages).map((group) => (
                    <div key={group.date}>
                      <DateSeparator date={group.date} />
                      {group.messages.map((m) => (
                        <MessageBubble key={m.id} msg={m} />
                      ))}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input area */}
              <div className="border-t p-3">
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    className="min-h-[40px] max-h-[120px] resize-none text-sm"
                    rows={1}
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sendingMsg || activeConv.status === 'ARCHIVED'}
                  />
                  <Button
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={handleSend}
                    disabled={!msgInput.trim() || sendingMsg || activeConv.status === 'ARCHIVED'}
                  >
                    {sendingMsg ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {activeConv.status === 'ARCHIVED' && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Conversa arquivada. Reabra para enviar mensagens.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── New Conversation Dialog ───────────────────── */}
      <NewConversationDialog open={newConvOpen} onOpenChange={setNewConvOpen} onCreated={handleConvCreated} />
    </div>
  );
}
