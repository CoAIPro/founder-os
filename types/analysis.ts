export type Stage = 'idea' | 'mvp' | 'launched'

export interface AnalysisResult {
  score: number
  market_demand: string
  differentiation: string
  execution_risk: string
  insight: string
  risk: string
  blind_spot: string
  next_steps: string[]
  confidence: 'High' | 'Medium' | 'Low'
}

export type AnalyzeResponse =
  | { id: string; result: AnalysisResult }
  | { result: AnalysisResult }
  | { error: string }