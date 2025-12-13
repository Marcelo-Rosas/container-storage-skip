import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, FilterX, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { toast } from 'sonner'
import { ContainerWithStats } from '@/types/container'
import { ContainerCard } from '@/components/ContainerCard'
import { NewContainerDialog } from '@/components/NewContainerDialog'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function Containers() {
  const [containers, setContainers] = useState<ContainerWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [isNewContainerOpen, setIsNewContainerOpen] = useState(false)

  // Filters state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Lists for dropdowns
  const [clientsList, setClientsList] = useState<
    { id: string; name: string }[]
  >([])

  useEffect(() => {
    // Fetch clients list for filter
    const fetchClients = async () => {
      const { data } = await supabase
        .from('clients')
        .select('id, name')
        .order('name')
      if (data) setClientsList(data)
    }
    fetchClients()
  }, [])

  const fetchContainers = useCallback(async () => {
    setLoading(true)
    try {
      // Query the new View instead of the raw table
      let query = supabase
        .from('containers_stats_view')
        .select('*', { count: 'exact' })

      // Apply Search (Container Number or Client Name)
      if (search) {
        query = query.or(
          `container_number.ilike.%${search}%,client_name.ilike.%${search}%`,
        )
      }

      // Apply Status Filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Apply Client Filter
      if (clientFilter !== 'all') {
        query = query.eq('client_id', clientFilter)
      }

      // Apply Sorting
      // Default sort by start_date desc if not specified, but state has default
      if (sortColumn === 'created_at') {
        // View doesn't have created_at, fallback to start_date or id
        query = query.order('start_date', { ascending: false })
      } else {
        query = query.order(sortColumn, {
          ascending: sortDirection === 'asc',
        })
      }

      // Apply Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, count, error } = await query

      if (error) throw error

      setContainers((data as any[]) || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching containers:', error)
      toast.error('Erro ao carregar lista de contêineres')
    } finally {
      setLoading(false)
    }
  }, [
    page,
    pageSize,
    search,
    statusFilter,
    clientFilter,
    sortColumn,
    sortDirection,
  ])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchContainers()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [fetchContainers])

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setClientFilter('all')
    setPage(1)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contêineres</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore todos os contêineres do sistema.
          </p>
        </div>
        <Button onClick={() => setIsNewContainerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Contêiner
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar número ou cliente..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={clientFilter}
              onValueChange={(val) => {
                setClientFilter(val)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Clientes</SelectItem>
                {clientsList.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select
                value={sortColumn}
                onValueChange={(val) => {
                  setSortColumn(val)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Recentes</SelectItem>
                  <SelectItem value="container_number">Número</SelectItem>
                  <SelectItem value="client_name">Cliente</SelectItem>
                  <SelectItem value="start_date">Data Início</SelectItem>
                  <SelectItem value="items_count">Qtd Itens</SelectItem>
                  <SelectItem value="used_volume">Volume Usado</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                }
                title={sortDirection === 'asc' ? 'Ascendente' : 'Descendente'}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-muted-foreground w-full md:w-auto lg:col-span-4 lg:w-full"
            >
              <FilterX className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Container Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : containers.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-lg text-muted-foreground">
            Nenhum contêiner encontrado.
          </p>
          <Button variant="link" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up">
          {containers.map((container) => (
            <ContainerCard key={container.id} container={container} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Itens por página:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => {
              setPageSize(Number(val))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>
            Mostrando {containers.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(page * pageSize, totalCount)} de {totalCount}
          </span>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) setPage(page - 1)
                  }}
                  className={
                    page <= 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const p = i + 1
                if (p > totalPages) return null
                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={page === p}
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(p)
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) setPage(page + 1)
                  }}
                  className={
                    page >= totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <NewContainerDialog
        open={isNewContainerOpen}
        onOpenChange={setIsNewContainerOpen}
        onSuccess={fetchContainers}
      />
    </div>
  )
}
