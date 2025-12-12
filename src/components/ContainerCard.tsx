import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  MoreVertical,
  Box,
  Scale,
  Calendar,
  DollarSign,
  FileText,
  Activity,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'

import { ContainerWithStats } from '@/types/container'
import {
  statusConfig,
  formatCurrency,
  formatNumber,
} from '@/utils/container-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ContainerCardProps {
  container: ContainerWithStats
}

export function ContainerCard({ container }: ContainerCardProps) {
  const {
    id,
    container_number,
    client_name,
    status,
    container_type_name,
    bl_number,
    nominal_volume_m3,
    items_count,
    used_volume,
    total_gross_weight,
    start_date,
    base_cost_brl,
  } = container

  const config = statusConfig[status] || statusConfig.default

  // Calculate Occupancy Percent
  const nominalVolume = nominal_volume_m3 || 0
  const occupancyPercent =
    nominalVolume > 0 ? (used_volume / nominalVolume) * 100 : 0

  // Determine Progress Bar Color
  let progressColorClass = 'bg-red-500'
  if (occupancyPercent > 75) {
    progressColorClass = 'bg-green-500'
  } else if (occupancyPercent > 40) {
    progressColorClass = 'bg-yellow-500'
  }

  const handleAction = (action: string) => {
    toast.info('Funcionalidade em breve', {
      description: `A ação "${action}" será implementada em atualizações futuras.`,
    })
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-t-4 border-t-primary/10">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-none tracking-tight">
                {container_number}
              </h3>
              <Badge variant={config.badge}>{config.label}</Badge>
            </div>
            <p
              className="text-sm text-muted-foreground line-clamp-1"
              title={client_name}
            >
              {client_name}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/containers/${id}`} className="cursor-pointer">
                  Ver detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('Registrar saída')}>
                Registrar saída
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('Simular medição')}>
                Simular medição
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('Exportar')}>
                Exportar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Box className="h-3 w-3" /> Tipo
            </span>
            <span className="font-medium truncate" title={container_type_name}>
              {container_type_name}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <FileText className="h-3 w-3" /> BL Number
            </span>
            <span className="font-medium truncate">{bl_number || '-'}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Início
            </span>
            <span className="font-medium">
              {start_date ? format(new Date(start_date), 'dd/MM/yy') : '-'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Custo Base
            </span>
            <span className="font-medium">
              {base_cost_brl ? formatCurrency(base_cost_brl) : '-'}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" /> Ocupação
            </span>
            <span
              className={cn('font-semibold', {
                'text-green-600': occupancyPercent > 75,
                'text-yellow-600':
                  occupancyPercent > 40 && occupancyPercent <= 75,
                'text-red-600': occupancyPercent <= 40,
              })}
            >
              {formatNumber(occupancyPercent, 1)}%
            </span>
          </div>
          <Progress
            value={occupancyPercent}
            className="h-2"
            indicatorClassName={progressColorClass}
          />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 bg-muted/20 border-t flex justify-between items-center text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-4 w-full pt-3">
          <div className="flex items-center gap-1" title="Qtd SKUs">
            <Package className="h-3 w-3" />
            <span>{items_count} SKUs</span>
          </div>
          <div className="flex items-center gap-1" title="Volume Usado">
            <Box className="h-3 w-3" />
            <span>{formatNumber(used_volume)} m³</span>
          </div>
          <div
            className="flex items-center gap-1 ml-auto"
            title="Peso Bruto Total"
          >
            <Scale className="h-3 w-3" />
            <span>{formatNumber(total_gross_weight)} kg</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
