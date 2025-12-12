export interface Container {
  id: string
  container_number: string
  container_code: string
  bl_number?: string | null
  start_date: string
  status: string
  yard_location: string | null
  nominal_volume_m3: number | null
  base_cost_brl: number | null
  client_id: string
  container_type: string
}

export interface ContainerWithStats extends Container {
  client_name: string
  container_type_name: string
  items_count: number
  used_volume: number
  total_gross_weight: number
  // Calculated frontend properties can be optional or derived
  occupancyPercent?: number
}
