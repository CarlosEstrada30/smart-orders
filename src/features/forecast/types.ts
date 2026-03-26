export interface ForecastPoint {
  date: string
  predicted: number
  recommended: number           // ceil(predicted * 1.10) — what to actually produce
  last_week_actual: number | null  // real units sold same weekday last week
  is_no_delivery_day: boolean   // true when this weekday historically has no orders
}

export interface RouteBreakdown {
  route_id: number | null
  route_name: string
  predicted: number
  recommended: number
}

export interface ProductForecast {
  product_id: number
  product_name: string
  forecast: ForecastPoint[]
  by_route: RouteBreakdown[]
  trend_direction: 'up' | 'down' | 'stable'
  trend_percentage: number
  confidence: 'alta' | 'media' | 'baja'
  history_days_available: number
}

export interface ForecastResponse {
  products: ProductForecast[]
  days_ahead: number
  history_days_used: number
  generated_at: string
  total_recommended_tomorrow: number
}
