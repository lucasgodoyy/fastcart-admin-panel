export type ShippingLabelOrderRef = {
  id: string
}

export type ShippingLabelSummary = {
  id: string
  protocol?: string | null
  status?: string | null
  tracking?: string | null
  created_at?: string | null
  paid_at?: string | null
  generated_at?: string | null
  printed_at?: string | null
  [key: string]: unknown
}

export type ShippingLabelListResponse = {
  data?: ShippingLabelSummary[]
  [key: string]: unknown
}
