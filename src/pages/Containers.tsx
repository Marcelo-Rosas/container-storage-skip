import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Search, FilterX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function Containers() {
  const { user, token } = useAuthStore()
  const [containers, setContainers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user || !token) return
      setLoading(true)
      try {
        let query = 'select=*,clients(name)' // Join to get client name

        if (user.role === 'operator' && user.client_id) {
          query += `&client_id=eq.${user.client_id}`
        }

        const data = await api.db.select<any>('containers', query, token)
        setContainers(data)

        if (user.role === 'admin') {
          const clientsData = await api.db.select<any>(
            'clients',
            'select=id,name',
            token,
          )
          setClients(clientsData)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [user, token])

  const filteredContainers = containers.filter((c) => {
    const matchesSearch = c.container_number
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    const matchesType = typeFilter === 'all' || c.type === typeFilter
    const matchesClient = clientFilter === 'all' || c.client_id === clientFilter
    return matchesSearch && matchesStatus && matchesType && matchesClient
  })

  // Unique types and statuses for filter options
  const uniqueTypes = Array.from(new Set(containers.map((c) => c.type)))
  const uniqueStatuses = Array.from(new Set(containers.map((c) => c.status)))

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setClientFilter('all')
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'maintenance':
        return 'destructive'
      case 'in transit':
        return 'default'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Contêineres</h1>
        {filteredContainers.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {filteredContainers.length} registros encontrados
          </span>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            Filtros e Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar número..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {user?.role === 'admin' && (
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {uniqueTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {uniqueStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <FilterX className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                {user?.role === 'admin' && <TableHead>Cliente</TableHead>}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    {user?.role === 'admin' && (
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredContainers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Nenhum contêiner encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredContainers.map((container) => (
                  <TableRow key={container.id} className="group">
                    <TableCell className="font-medium">
                      {container.container_number}
                    </TableCell>
                    <TableCell>{container.type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(container.status) as any}>
                        {container.status}
                      </Badge>
                    </TableCell>
                    {user?.role === 'admin' && (
                      <TableCell>{container.clients?.name || '-'}</TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/containers/${container.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> Ver Detalhes
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
