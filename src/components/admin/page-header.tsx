import { HelpCircle, ExternalLink } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  helpText?: string
  helpHref?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, helpText, helpHref, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground text-balance">{title}</h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {helpText && helpHref && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          <a href={helpHref} className="text-primary hover:underline flex items-center gap-1">
            {helpText}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )
}
