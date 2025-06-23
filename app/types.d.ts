declare type Param = {
  name: string
  type: 'number' | 'colour' | 'boolean'
  value: number | string
  min?: number
  max?: number
  step?: number
}

declare type Effect = {
  name: string
  params: Record<string, Param>
  frameBuffer: any
  programInfo: any
  folded: boolean
  animated: boolean
}
