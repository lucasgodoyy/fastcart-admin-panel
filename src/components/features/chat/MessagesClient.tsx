'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import chatService, {
  Conversation,
  ChatMessage,
  PaginatedResult,
  ChatStats,
  StoreMember,
} from '@/services/chatService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export function MessagesClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stats
  const { data: stats } = useQuery<ChatStats>({
    queryKey: ['chat-stats'],
    queryFn: chatService.getStats,
  });

  // Conversations list Â TEAM channel only (Lojista ? Equipe)
  const { data: convData, isLoading: loadingConvs } = useQuery<PaginatedResult<Conversation>>({
    queryKey: ['chat-conversations', statusFilter],
    queryFn: () =>
      chatService.listConversations({
        size: 50,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        channel: 'TEAM',
      }),
  });

  // Selected conversation messages
  const { data: messagesData, isLoading: loadingMessages } = useQuery<PaginatedResult<ChatMessage>>({
    queryKey: ['chat-messages', selectedId],
    queryFn: () => chatService.listMessages(selectedId!, { size: 100 }),
    enabled: !!selectedId,
  });

  // Mark as read when opening conversation
  useEffect(() => {
    if (selectedId) {
      chatService.markAsRead(selectedId).catch(() => {});
    }
  }, [selectedId]);

  // Send message
  const sendMutation = useMutation({
    mutationFn: () => chatService.sendMessage(selectedId!, newMessage),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-stats'] });
    },
    onError: () => toast.error('Erro ao enviar mensagem.'),
  });

  // Create conversation
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    subject: '',
    initialMessage: '',
  });

  // Store members for autocomplete
  const { data: storeMembers = [] } = useQuery<StoreMember[]>({
    queryKey: ['store-members'],
    queryFn: chatService.listStoreMembers,
    staleTime: 60_000,
  });

  const [memberPickerOpen, setMemberPickerOpen] = useState(false);

  const selectMember = (member: StoreMember) => {
    setForm((prev) => ({
      ...prev,
      customerName: member.email.split('@')[0],
      customerEmail: member.email,
    }));
    setMemberPickerOpen(false);
  };

  const createConv = useMutation({
    mutationFn: () =>
      chatService.createConversation({
        ...form,
        channel: 'TEAM',
      }),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-stats'] });
      setDialogOpen(false);
      setSelectedId(conv.id);
      setForm({ customerName: '', customerEmail: '', subject: '', initialMessage: '' });
      toast.success('Conversa criada!');
    },
    onError: () => toast.error('Erro ao criar conversa.'),
  });

  // Update status
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'OPEN' | 'CLOSED' | 'ARCHIVED' }) =>
      chatService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-stats'] });
      toast.success('Status atualizado.');
    },
  });

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const conversations = convData?.content ?? [];
  const messages = messagesData?.content ?? [];
  const selectedConv = conversations.find((c) => c.id === selectedId);
  const filteredMembers = storeMembers.filter((m) => m.email !== user?.email);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Mensagens da Equipe</h1>
          <p className="text-sm text-muted-foreground">ComunicaÃ§Ã£o interna entre os membros da sua loja</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nova conversa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Iniciar conversa Â Equipe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Membro da equipe</Label>
                <Popover open={memberPickerOpen} onOpenChange={setMemberPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={memberPickerOpen}
                      className="w-full justify-between text-sm font-normal"
                    >
                      {form.customerEmail
                        ? `${form.customerName} (${form.customerEmail})`
                        : 'Buscar membro por e-mail...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar membro por e-mail..." />
                      <CommandList>
                        <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
                        <CommandGroup className="max-h-48 overflow-y-auto">
                          {filteredMembers.map((member) => (
                            <CommandItem
                              key={member.id}
                              value={member.email}
                              onSelect={() => selectMember(member)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <div
                                  className={cn(
                                    'h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center',
                                    form.customerEmail === member.email
                                      ? 'bg-primary border-primary text-primary-foreground'
                                      : 'border-muted-foreground/30',
                                  )}
                                >
                                  {form.customerEmail === member.email && <Check className="h-3 w-3" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm truncate">{member.email}</p>
                                  <p className="text-xs text-muted-foreground">{member.role === 'ADMIN' ? 'Administrador' : member.role === 'STAFF' ? 'Equipe' : member.role}</p>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label>Assunto</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                />
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
              <Button
                className="w-full"
                onClick={() => createConv.mutate()}
                disabled={!form.customerName || !form.customerEmail || !form.initialMessage || createConv.isPending}
              >
                {createConv.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar conversa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalConversations ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Abertos</CardTitle>
            <Inbox className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{stats?.openConversations ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Fechados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats?.closedConversations ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">NÃ£o lidas</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">{stats?.unreadMessages ?? 0}</div></CardContent>
        </Card>
      </div>

      {/* Messages layout */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-440px)] min-h-100">
        {/* Conversation list */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="p-3 border-b">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <ScrollArea className="flex-1">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhuma conversa.
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      'w-full text-left p-3 hover:bg-muted/50 transition-colors',
                      selectedId === conv.id && 'bg-muted',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{conv.customerName}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(conv.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.subject || conv.customerEmail}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground truncate max-w-50">
                        {conv.lastMessagePreview || 'Sem mensagens'}
                      </p>
                      {conv.unreadAdminCount > 0 && (
                        <Badge variant="default" className="h-4 px-1 text-[10px] rounded-full">
                          {conv.unreadAdminCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Message panel */}
        <Card className="flex flex-col overflow-hidden">
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <Users className="h-5 w-5" />
              <p>Selecione uma conversa para ver as mensagens.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <CardHeader className="p-3 border-b flex flex-row items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{selectedConv?.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedConv?.subject || selectedConv?.customerEmail}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {selectedConv?.status !== 'CLOSED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => updateStatus.mutate({ id: selectedId, status: 'CLOSED' })}
                    >
                      Fechar
                    </Button>
                  )}
                  {selectedConv?.status === 'CLOSED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => updateStatus.mutate({ id: selectedId, status: 'OPEN' })}
                    >
                      Reabrir
                    </Button>
                  )}
                  {selectedConv?.status !== 'ARCHIVED' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => updateStatus.mutate({ id: selectedId, status: 'ARCHIVED' })}
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Nenhuma mensagem nesta conversa.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isAdmin = msg.senderType === 'ADMIN';
                      return (
                        <div key={msg.id} className={cn('flex', isAdmin ? 'justify-end' : 'justify-start')}>
                          <div className={cn(
                            'max-w-[75%] rounded-lg px-3 py-2',
                            isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted',
                          )}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {!isAdmin && <User className="h-3 w-3" />}
                              <span className="text-[10px] font-medium">{msg.senderName}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={cn(
                              'text-[10px] mt-1',
                              isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground',
                            )}>
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

              {/* Input */}
              <div className="border-t px-3 py-3 flex items-end gap-2">
                <div className="flex-1 rounded-lg border border-input bg-muted/30 px-3 py-2 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/40 transition-colors">
                  <textarea
                    placeholder={selectedConv?.status === 'CLOSED' ? 'Conversa encerrada. Reabra para responder.' : 'Escreva uma mensagem... (Enter para enviar, Shift+Enter para nova linha)'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
                        e.preventDefault();
                        sendMutation.mutate();
                      }
                    }}
                    rows={2}
                    disabled={selectedConv?.status === 'CLOSED'}
                    className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">Enter para enviar Â· Shift+Enter para nova linha</span>
                    <Button
                      size="sm"
                      className="h-7 gap-1.5 px-3 text-xs"
                      disabled={!newMessage.trim() || sendMutation.isPending || selectedConv?.status === 'CLOSED'}
                      onClick={() => sendMutation.mutate()}
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
