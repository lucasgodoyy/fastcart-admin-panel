'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Megaphone,
  Plug,
  CreditCard,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { t } from '@/lib/admin-language';

type Category = 'products' | 'orders' | 'marketing' | 'integrations' | 'payments';

interface TutorialArticle {
  title: string;
  description: string;
  steps: string[];
  tips?: string[];
  warnings?: string[];
  relatedLink?: string;
  relatedLabel?: string;
}

interface CategoryData {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  articles: TutorialArticle[];
}

const categoriesData: Record<Category, CategoryData> = {
  products: {
    title: t('Produtos e Catálogo', 'Products & Catalog'),
    description: t('Tudo sobre gerenciamento de produtos na sua loja.', 'Everything about managing products in your store.'),
    icon: <Package className="h-6 w-6" />,
    color: 'from-emerald-500 to-emerald-600',
    articles: [
      {
        title: t('Como cadastrar um produto', 'How to register a product'),
        description: t('Passo a passo para criar seu primeiro produto.', 'Step by step to create your first product.'),
        steps: [
          t('Acesse Catálogo > Todos os Produtos no menu lateral.', 'Go to Catalog > All Products in the sidebar.'),
          t('Clique no botão "Novo Produto" no topo da página.', 'Click "New Product" at the top of the page.'),
          t('Preencha o título, descrição e preço do produto.', 'Fill in the title, description, and price.'),
          t('Adicione fotos de alta qualidade (mínimo 800x800px).', 'Add high quality photos (minimum 800x800px).'),
          t('Defina o estoque e SKU (se aplicável).', 'Set inventory and SKU (if applicable).'),
          t('Selecione ou crie categorias para organizar.', 'Select or create categories to organize.'),
          t('Clique em "Salvar" para publicar o produto.', 'Click "Save" to publish the product.'),
        ],
        tips: [
          t('Use títulos descritivos para melhorar o SEO.', 'Use descriptive titles to improve SEO.'),
          t('Adicione pelo menos 4 fotos de diferentes ângulos.', 'Add at least 4 photos from different angles.'),
          t('Preencha o peso e dimensões para cálculo correto de frete.', 'Fill in weight and dimensions for correct shipping calculation.'),
        ],
        relatedLink: '/admin/products/new',
        relatedLabel: t('Criar Produto', 'Create Product'),
      },
      {
        title: t('Como criar variações (tamanho, cor)', 'How to create variations (size, color)'),
        description: t('Configure variantes como tamanho, cor e material.', 'Set up variants like size, color, and material.'),
        steps: [
          t('Na edição do produto, role até "Variações".', 'In product editing, scroll to "Variations".'),
          t('Clique em "Adicionar opção" (ex: Tamanho).', 'Click "Add option" (e.g. Size).'),
          t('Insira os valores (P, M, G, GG).', 'Enter values (S, M, L, XL).'),
          t('Repita para outras opções como Cor.', 'Repeat for other options like Color.'),
          t('O sistema gera todas as combinações automaticamente.', 'The system generates all combinations automatically.'),
          t('Defina preço e estoque individual de cada variação.', 'Set individual price and stock for each variation.'),
        ],
        tips: [
          t('Cada variação pode ter seu próprio preço e foto.', 'Each variation can have its own price and photo.'),
        ],
        relatedLink: '/admin/products',
        relatedLabel: t('Ver Produtos', 'View Products'),
      },
      {
        title: t('Gerenciamento de estoque', 'Inventory management'),
        description: t('Controle o estoque de todos os produtos.', 'Control inventory for all products.'),
        steps: [
          t('Acesse Catálogo > Estoque.', 'Go to Catalog > Inventory.'),
          t('Visualize o estoque de todos os produtos em uma tabela.', 'View stock for all products in a table.'),
          t('Edite estoque individualmente ou em massa.', 'Edit stock individually or in bulk.'),
          t('Ative alertas de estoque baixo nas configurações.', 'Enable low stock alerts in settings.'),
        ],
        warnings: [
          t('Produtos com estoque zerado ficam indisponíveis automaticamente.', 'Products with zero stock become unavailable automatically.'),
        ],
        relatedLink: '/admin/products/inventory',
        relatedLabel: t('Ver Estoque', 'View Inventory'),
      },
      {
        title: t('Categorias e coleções', 'Categories and collections'),
        description: t('Organize seus produtos para facilitar a navegação.', 'Organize products to facilitate browsing.'),
        steps: [
          t('Acesse Catálogo > Categorias para criar e gerenciar.', 'Go to Catalog > Categories to create and manage.'),
          t('Crie categorias hierárquicas (ex: Roupas > Camisetas).', 'Create hierarchical categories (e.g. Clothing > T-shirts).'),
          t('Associe produtos a categorias na edição do produto.', 'Associate products to categories in product editing.'),
          t('Coleções são agrupamentos manuais para destaques e promoções.', 'Collections are manual groupings for highlights and promotions.'),
        ],
        relatedLink: '/admin/products/categories',
        relatedLabel: t('Ver Categorias', 'View Categories'),
      },
    ],
  },
  orders: {
    title: t('Pedidos e Vendas', 'Orders & Sales'),
    description: t('Como gerenciar pedidos, devoluções e atendimento.', 'How to manage orders, returns, and fulfillment.'),
    icon: <ShoppingBag className="h-6 w-6" />,
    color: 'from-orange-500 to-orange-600',
    articles: [
      {
        title: t('Fluxo de um pedido', 'Order workflow'),
        description: t('Entenda o ciclo de vida de um pedido.', 'Understand the order lifecycle.'),
        steps: [
          t('PENDENTE — cliente finalizou a compra, aguardando pagamento.', 'PENDING — customer completed purchase, awaiting payment.'),
          t('PAGO/CONFIRMADO — pagamento aprovado, preparar para envio.', 'PAID/CONFIRMED — payment approved, prepare for shipping.'),
          t('EM PREPARO — separando e embalando os itens.', 'PREPARING — picking and packing items.'),
          t('ENVIADO — pacote despachado, código de rastreio gerado.', 'SHIPPED — package dispatched, tracking code generated.'),
          t('ENTREGUE — cliente recebeu o pedido.', 'DELIVERED — customer received the order.'),
          t('CANCELADO/DEVOLVIDO — em caso de cancelamento ou devolução.', 'CANCELLED/RETURNED — in case of cancellation or return.'),
        ],
        relatedLink: '/admin/sales',
        relatedLabel: t('Ver Pedidos', 'View Orders'),
      },
      {
        title: t('Como processar um pedido', 'How to process an order'),
        description: t('Passo a passo para atender um pedido.', 'Step by step to fulfill an order.'),
        steps: [
          t('Acesse Pedidos > clique no pedido.', 'Go to Orders > click on the order.'),
          t('Verifique o status do pagamento (deve ser "Pago").', 'Check payment status (should be "Paid").'),
          t('Marque como "Em preparo" ao iniciar a separação.', 'Mark as "Preparing" when starting picking.'),
          t('Gere a etiqueta de frete pelo Melhor Envio (se configurado).', 'Generate shipping label via Melhor Envio (if configured).'),
          t('Insira o código de rastreio e marque como "Enviado".', 'Enter tracking code and mark as "Shipped".'),
          t('O cliente recebe e-mail automático em cada alteração de status.', 'Customer receives automatic email on each status change.'),
        ],
        tips: [
          t('Imprima a nota fiscal junto com a etiqueta de envio.', 'Print the invoice along with the shipping label.'),
        ],
        relatedLink: '/admin/sales',
        relatedLabel: t('Ver Pedidos', 'View Orders'),
      },
      {
        title: t('Carrinhos abandonados', 'Abandoned carts'),
        description: t('Recupere vendas perdidas.', 'Recover lost sales.'),
        steps: [
          t('Acesse Pedidos > Carrinhos Abandonados.', 'Go to Orders > Abandoned Carts.'),
          t('Visualize todas as sessões onde o cliente não finalizou.', 'View all sessions where the customer didn\'t complete.'),
          t('Ative e-mails de recuperação automática.', 'Enable automatic recovery emails.'),
          t('Envie cupons personalizados para incentivar a compra.', 'Send personalized coupons to encourage purchase.'),
        ],
        tips: [
          t('E-mails enviados nas primeiras horas têm maior taxa de conversão.', 'Emails sent in the first hours have higher conversion rates.'),
        ],
        relatedLink: '/admin/sales/abandoned-carts',
        relatedLabel: t('Ver Carrinhos', 'View Carts'),
      },
      {
        title: t('Devoluções e reembolsos', 'Returns and refunds'),
        description: t('Gerencie devoluções e estornos.', 'Manage returns and refunds.'),
        steps: [
          t('Acesse Pedidos > Devoluções.', 'Go to Orders > Returns.'),
          t('Analise a solicitação do cliente.', 'Review the customer request.'),
          t('Aprove ou recuse a devolução com motivo.', 'Approve or deny the return with reason.'),
          t('Se aprovado, o reembolso é processado automaticamente via Stripe.', 'If approved, refund is processed automatically via Stripe.'),
        ],
        warnings: [
          t('Reembolsos levam 5-10 dias úteis para aparecer no cartão do cliente.', 'Refunds take 5-10 business days to appear on customer card.'),
        ],
        relatedLink: '/admin/sales/returns',
        relatedLabel: t('Devoluções', 'Returns'),
      },
    ],
  },
  marketing: {
    title: t('Marketing e Promoções', 'Marketing & Promotions'),
    description: t('Estratégias e ferramentas para vender mais.', 'Strategies and tools to sell more.'),
    icon: <Megaphone className="h-6 w-6" />,
    color: 'from-purple-500 to-purple-600',
    articles: [
      {
        title: t('Cupons de desconto', 'Discount coupons'),
        description: t('Crie cupons para atrair e fidelizar clientes.', 'Create coupons to attract and retain customers.'),
        steps: [
          t('Acesse Promoções > Cupons > Novo cupom.', 'Go to Promotions > Coupons > New coupon.'),
          t('Escolha tipo: porcentagem ou valor fixo.', 'Choose type: percentage or fixed value.'),
          t('Defina o código (ex: BEMVINDO10).', 'Set the code (e.g. WELCOME10).'),
          t('Configure condições: valor mínimo, limite de uso, data de validade.', 'Set conditions: minimum order, usage limit, expiration date.'),
          t('Opcionalmente, restrinja a categorias ou produtos específicos.', 'Optionally, restrict to specific categories or products.'),
        ],
        relatedLink: '/admin/discounts/coupons',
        relatedLabel: t('Criar Cupom', 'Create Coupon'),
      },
      {
        title: t('Programa de Afiliados', 'Affiliate Program'),
        description: t('Como funciona o programa de afiliados.', 'How the affiliate program works.'),
        steps: [
          t('Acesse Marketing > Afiliados.', 'Go to Marketing > Affiliates.'),
          t('Ative o programa na aba Configurações.', 'Enable the program in the Settings tab.'),
          t('Defina a taxa de comissão padrão (ex: 10%).', 'Set default commission rate (e.g. 10%).'),
          t('Cadastre afiliados manualmente ou ative a auto-aprovação.', 'Register affiliates manually or enable auto-approval.'),
          t('Cada afiliado recebe um link único com código de referência.', 'Each affiliate gets a unique link with referral code.'),
          t('Acompanhe cliques, conversões e comissões na aba Dashboard.', 'Track clicks, conversions, and commissions in Dashboard tab.'),
          t('Pague comissões via PIX ou transferência bancária na aba Pagamentos.', 'Pay commissions via PIX or bank transfer in Payouts tab.'),
        ],
        tips: [
          t('Comissões entre 5-15% são padrão no mercado brasileiro.', 'Commissions between 5-15% are standard in Brazil.'),
          t('Links de afiliados com UTM facilitam tracking no Google Analytics.', 'Affiliate links with UTM facilitate Google Analytics tracking.'),
        ],
        relatedLink: '/admin/marketing/affiliates',
        relatedLabel: t('Ver Afiliados', 'View Affiliates'),
      },
      {
        title: t('E-mail Marketing', 'Email Marketing'),
        description: t('Envie campanhas para sua base.', 'Send campaigns to your customer base.'),
        steps: [
          t('Acesse Marketing > E-mail Marketing.', 'Go to Marketing > Email Marketing.'),
          t('Crie uma nova campanha.', 'Create a new campaign.'),
          t('Selecione o template ou crie do zero.', 'Select a template or create from scratch.'),
          t('Defina o público-alvo (todos, novos, inativos).', 'Define the audience (all, new, inactive).'),
          t('Agende o envio ou envie imediatamente.', 'Schedule sending or send immediately.'),
        ],
        relatedLink: '/admin/marketing/email-campaigns',
        relatedLabel: t('E-mail Marketing', 'Email Marketing'),
      },
      {
        title: t('Programa de Fidelidade', 'Loyalty Program'),
        description: t('Fidelize clientes com pontos e recompensas.', 'Retain customers with points and rewards.'),
        steps: [
          t('Acesse Marketing > Fidelidade.', 'Go to Marketing > Loyalty.'),
          t('Configure quantos pontos o cliente ganha por R$ gasto.', 'Configure how many points the customer earns per R$ spent.'),
          t('Defina as recompensas disponíveis para troca.', 'Set available rewards for redemption.'),
          t('O cliente acumula pontos automaticamente a cada compra.', 'Customer accumulates points automatically with each purchase.'),
        ],
        relatedLink: '/admin/loyalty',
        relatedLabel: t('Fidelidade', 'Loyalty'),
      },
    ],
  },
  integrations: {
    title: t('Integrações e Canais de Venda', 'Integrations & Sales Channels'),
    description: t('Conecte sua loja com plataformas externas.', 'Connect your store with external platforms.'),
    icon: <Plug className="h-6 w-6" />,
    color: 'from-indigo-500 to-indigo-600',
    articles: [
      {
        title: t('Stripe (pagamentos)', 'Stripe (payments)'),
        description: t('Configure pagamentos via cartão, PIX e boleto.', 'Set up payments via card, PIX, and boleto.'),
        steps: [
          t('Acesse Configurações > Integrações.', 'Go to Settings > Integrations.'),
          t('Clique em "Conectar Stripe".', 'Click "Connect Stripe".'),
          t('Você será redirecionado para criar/conectar uma conta Stripe.', 'You will be redirected to create/connect a Stripe account.'),
          t('Após aprovar, os meios de pagamento ficam disponíveis.', 'After approval, payment methods become available.'),
          t('Configure quais métodos aceitar em Meios de Pagamento.', 'Configure which methods to accept in Payment Methods.'),
        ],
        warnings: [
          t('Em modo de teste, use cartões de teste do Stripe (4242 4242 4242 4242).', 'In test mode, use Stripe test cards (4242 4242 4242 4242).'),
        ],
        relatedLink: '/admin/settings/integrations',
        relatedLabel: t('Integrações', 'Integrations'),
      },
      {
        title: t('Melhor Envio (frete)', 'Melhor Envio (shipping)'),
        description: t('Calcule frete automaticamente.', 'Calculate shipping automatically.'),
        steps: [
          t('Acesse Configurações > Integrações.', 'Go to Settings > Integrations.'),
          t('Clique em "Conectar Melhor Envio".', 'Click "Connect Melhor Envio".'),
          t('Autorize o acesso e configure centros de distribuição.', 'Authorize access and configure distribution centers.'),
          t('Os Correios e transportadoras ficam disponíveis automaticamente.', 'Post office and carriers become available automatically.'),
        ],
        relatedLink: '/admin/settings/integrations',
        relatedLabel: t('Integrações', 'Integrations'),
      },
      {
        title: t('Facebook & Instagram', 'Facebook & Instagram'),
        description: t('Venda nas redes sociais.', 'Sell on social media.'),
        steps: [
          t('Acesse Canais de Venda > Facebook e Instagram.', 'Go to Sales Channels > Facebook & Instagram.'),
          t('Configure o catálogo do Facebook Shops.', 'Set up the Facebook Shops catalog.'),
          t('Instale o Facebook Pixel para tracking de conversões.', 'Install Facebook Pixel for conversion tracking.'),
          t('Otimize seus anúncios com os dados de conversão.', 'Optimize your ads with conversion data.'),
        ],
        relatedLink: '/admin/marketing/meta-ads',
        relatedLabel: t('Meta Ads', 'Meta Ads'),
      },
      {
        title: t('Google Analytics e Ads', 'Google Analytics & Ads'),
        description: t('Acompanhe tráfego e anuncie no Google.', 'Track traffic and advertise on Google.'),
        steps: [
          t('Acesse Integrações > Google Analytics.', 'Go to Integrations > Google Analytics.'),
          t('Insira seu ID de medição (G-XXXX).', 'Enter your measurement ID (G-XXXX).'),
          t('Para Google Ads, configure a tag de conversão.', 'For Google Ads, set up the conversion tag.'),
          t('Ative o Google Shopping para listar produtos gratuitamente.', 'Enable Google Shopping to list products for free.'),
        ],
        relatedLink: '/admin/integrations/google-analytics',
        relatedLabel: t('Google Analytics', 'Google Analytics'),
      },
    ],
  },
  payments: {
    title: t('Pagamentos e Financeiro', 'Payments & Finance'),
    description: t('Gerencie o financeiro da sua loja.', 'Manage your store finances.'),
    icon: <CreditCard className="h-6 w-6" />,
    color: 'from-pink-500 to-pink-600',
    articles: [
      {
        title: t('Meios de pagamento disponíveis', 'Available payment methods'),
        description: t('O que sua loja pode aceitar.', 'What your store can accept.'),
        steps: [
          t('Cartão de crédito (Visa, Mastercard, Elo, Amex) — via Stripe.', 'Credit card (Visa, Mastercard, Elo, Amex) — via Stripe.'),
          t('PIX — pagamento instantâneo, sem taxas para o comprador.', 'PIX — instant payment, no fees for the buyer.'),
          t('Boleto bancário — emitido automaticamente via Stripe.', 'Boleto — issued automatically via Stripe.'),
          t('Pagamento manual — transferência bancária com confirmação manual.', 'Manual payment — bank transfer with manual confirmation.'),
        ],
        relatedLink: '/admin/settings/payment-methods',
        relatedLabel: t('Configurar', 'Configure'),
      },
      {
        title: t('Entendendo as taxas', 'Understanding fees'),
        description: t('Taxas e custos da plataforma.', 'Platform rates and costs.'),
        steps: [
          t('Taxa da plataforma: definida pelo seu plano (veja em Meu Plano).', 'Platform fee: defined by your plan (see My Plan).'),
          t('Taxa do Stripe: ~3.99% + R$0.39 por transação de cartão.', 'Stripe fee: ~3.99% + R$0.39 per card transaction.'),
          t('PIX via Stripe: ~0.99% por transação.', 'PIX via Stripe: ~0.99% per transaction.'),
          t('Os valores são debitados automaticamente antes do repasse.', 'Amounts are debited automatically before payout.'),
        ],
        warnings: [
          t('As taxas do Stripe podem variar. Consulte stripe.com/br/pricing.', 'Stripe fees may vary. Check stripe.com/pricing.'),
        ],
        relatedLink: '/admin/billing',
        relatedLabel: t('Meu Plano', 'My Plan'),
      },
      {
        title: t('Notas Fiscais Eletrônicas (NF-e)', 'Electronic Invoices (NF-e)'),
        description: t('Emita notas fiscais pelo painel.', 'Issue invoices from the panel.'),
        steps: [
          t('Configure os dados fiscais em Configurações > Dados Fiscais.', 'Set up fiscal data in Settings > Fiscal Data.'),
          t('Acesse Ferramentas > Notas Fiscais.', 'Go to Tools > Invoices.'),
          t('Selecione o pedido e emita a NF-e.', 'Select the order and issue the NF-e.'),
          t('A nota é enviada automaticamente ao e-mail do cliente.', 'The invoice is sent automatically to the customer email.'),
        ],
        relatedLink: '/admin/nfe',
        relatedLabel: t('Notas Fiscais', 'Invoices'),
      },
    ],
  },
};

export function TutorialsCategoryClient({ category }: { category: Category }) {
  const data = categoriesData[category];
  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      {/* Back + Header */}
      <div className="rounded-lg border border-border bg-card/60 px-5 py-4">
        <Link
          href="/admin/tutorials"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('Voltar aos Tutoriais', 'Back to Tutorials')}
        </Link>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {data.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{data.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{data.description}</p>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-6">
        {data.articles.map((article, idx) => (
          <div key={idx} className="overflow-hidden rounded-lg border border-border bg-card">
            {/* Article Header */}
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">{article.title}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{article.description}</p>
            </div>

            {/* Steps */}
            <div className="space-y-2.5 px-5 py-4">
              {article.steps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="text-[10px] font-bold text-foreground">{sIdx + 1}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            {/* Tips */}
            {article.tips && article.tips.length > 0 && (
              <div className="border-t border-border bg-muted/20 px-5 py-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-foreground">
                    {t('Dicas', 'Tips')}
                  </span>
                </div>
                {article.tips.map((tip, tIdx) => (
                  <p key={tIdx} className="ml-5 text-xs leading-relaxed text-muted-foreground">
                    • {tip}
                  </p>
                ))}
              </div>
            )}

            {/* Warnings */}
            {article.warnings && article.warnings.length > 0 && (
              <div className="border-t border-border bg-muted/20 px-5 py-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-foreground">
                    {t('Importante', 'Important')}
                  </span>
                </div>
                {article.warnings.map((warn, wIdx) => (
                  <p key={wIdx} className="ml-5 text-xs leading-relaxed text-muted-foreground">
                    • {warn}
                  </p>
                ))}
              </div>
            )}

            {/* Related Link */}
            {article.relatedLink && (
              <div className="border-t border-border px-5 py-3">
                <Link
                  href={article.relatedLink}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  {article.relatedLabel}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
