import { ExternalLink } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  helpText?: string
  helpHref?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, helpText, helpHref, actions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {helpText && helpHref && (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <a href={helpHref} className="text-primary hover:underline flex items-center gap-1 font-medium">
            {helpText}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )
}
