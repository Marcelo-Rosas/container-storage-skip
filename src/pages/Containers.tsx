import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, FilterX, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import useAuthStore from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type Container = {
  id: string
  container_number: string
  container_code: string
  start_date: string
  status: string
  yard_location: string
  client_id: string
  clients: {
    name: string
  } | null
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function Containers() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filters state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<string>('container_number')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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

  useEffect(() => {
    const fetchContainers = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('containers')
          .select(
            'id, container_number, container_code, start_date, status, yard_location, client_id, clients(name)',
            {
              count: 'exact',
            },
          )

        // Apply Search (Container Number)
        if (search) {
          query = query.ilike('container_number', `%${search}%`)
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
        if (sortColumn === 'client_name') {
          // Sorting by foreign table column is tricky in simple query builder without specific setup or view.
          // Fallback: we sort by client_id for now as proxy, or we accept simple sorting limitation.
          // However, we can use the foreign table sort syntax if supported or sort locally (not scalable).
          // Supabase supports sorting by referenced table: order('clients(name)')
          query = query.order('clients(name)', {
            ascending: sortDirection === 'asc',
          })
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

        setContainers(data as any[]) // Type assertion needed for joined data
        setTotalCount(count || 0)
      } catch (error) {
        console.error('Error fetching containers:', error)
        toast.error('Erro ao carregar lista de contêineres')
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchContainers()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [
    page,
    pageSize,
    search,
    statusFilter,
    clientFilter,
    sortColumn,
    sortDirection,
  ])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setClientFilter('all')
    setPage(1)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'closed':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contêineres</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore todos os contêineres do sistema.
          </p>
        </div>
        <Button onClick={() => navigate('/containers/new')}>
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
                placeholder="Buscar número..."
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

            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-muted-foreground w-full md:w-auto"
            >
              <FilterX className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('container_number')}
                >
                  Número{' '}
                  {sortColumn === 'container_number' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('client_name')}
                >
                  Cliente{' '}
                  {sortColumn === 'client_name' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Código</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('start_date')}
                >
                  Início{' '}
                  {sortColumn === 'start_date' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('status')}
                >
                  Status{' '}
                  {sortColumn === 'status' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Localização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : containers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum contêiner encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                containers.map((container) => (
                  <TableRow key={container.id} className="group">
                    <TableCell className="font-medium">
                      {container.container_number}
                    </TableCell>
                    <TableCell>{container.clients?.name || '-'}</TableCell>
                    <TableCell>{container.container_code}</TableCell>
                    <TableCell>
                      {container.start_date
                        ? format(new Date(container.start_date), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusColor(container.status) as any}
                        className="capitalize"
                      >
                        {container.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{container.yard_location || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/containers/${container.id}`}>Detalhes</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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

              {/* Simple Pagination Logic for brevity */}
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const p = i + 1
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
    </div>
  )
}
