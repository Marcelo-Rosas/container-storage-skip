import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useAuthStore from '@/stores/useAuthStore'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Edit2,
  Plus,
  Package,
  CalendarClock,
  History,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

// Schemas
const inventorySchema = z.object({
  sku: z.string().min(1, 'SKU é obrigatório'),
  product_name: z.string().min(1, 'Nome do produto é obrigatório'),
  quantity: z.coerce.number().min(1, 'Quantidade deve ser maior que 0'),
})

const eventSchema = z.object({
  event_type: z.string().min(1, 'Tipo de evento é obrigatório'),
  quantity: z.coerce.number().optional(),
})

const containerEditSchema = z.object({
  type: z.string().min(1),
  status: z.string().min(1),
})

export default function ContainerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuthStore()

  const [container, setContainer] = useState<any>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isEventOpen, setIsEventOpen] = useState(false)

  // Forms
  const editForm = useForm<z.infer<typeof containerEditSchema>>({
    resolver: zodResolver(containerEditSchema),
  })
  const inventoryForm = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
  })
  const eventForm = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
  })

  // Destructure reset to use in dependency array
  const { reset: resetEditForm } = editForm

  const fetchDetails = useCallback(async () => {
    if (!user || !token || !id) return
    setLoading(true)
    try {
      const c = await api.db.selectOne<any>(
        'containers',
        `id=eq.${id}&select=*,clients(name)`,
        token,
      )

      // Access Check for Operator
      if (user.role === 'operator' && c.client_id !== user.client_id) {
        toast.error('Acesso negado a este contêiner')
        navigate('/containers')
        return
      }

      setContainer(c)
      resetEditForm({ type: c.type, status: c.status })

      const inv = await api.db.select<any>(
        'inventory',
        `container_id=eq.${id}`,
        token,
      )
      setInventory(inv)

      const evs = await api.db.select<any>(
        'events',
        `container_id=eq.${id}&order=created_at.desc`,
        token,
      )
      setEvents(evs)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar detalhes')
    } finally {
      setLoading(false)
    }
  }, [id, user, token, navigate, resetEditForm])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const onEditContainer = async (data: z.infer<typeof containerEditSchema>) => {
    try {
      await api.db.update('containers', id!, data, token!)
      toast.success('Contêiner atualizado')
      setIsEditOpen(false)
      fetchDetails()
    } catch (e) {
      toast.error('Erro ao atualizar')
    }
  }

  const onAddInventory = async (data: z.infer<typeof inventorySchema>) => {
    try {
      await api.db.insert('inventory', { ...data, container_id: id }, token!)
      toast.success('Item adicionado ao inventário')
      setIsInventoryOpen(false)
      inventoryForm.reset()
      fetchDetails()
    } catch (e) {
      toast.error('Erro ao adicionar item')
    }
  }

  const onAddEvent = async (data: z.infer<typeof eventSchema>) => {
    try {
      await api.db.insert('events', { ...data, container_id: id }, token!)
      toast.success('Evento registrado')
      setIsEventOpen(false)
      eventForm.reset()
      fetchDetails()
    } catch (e) {
      toast.error('Erro ao registrar evento')
    }
  }

  if (loading)
    return (
      <div className="p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  if (!container) return <div className="p-8">Contêiner não encontrado</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/containers')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          Detalhes do Contêiner: {container.container_number}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Container Info */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Informações</CardTitle>
            {user?.role === 'admin' && (
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Contêiner</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={editForm.handleSubmit(onEditContainer)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Input {...editForm.register('type')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        defaultValue={container.status}
                        onValueChange={(v) => editForm.setValue('status', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="In Transit">In Transit</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Maintenance">
                            Maintenance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Salvar</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-xs truncate" title={container.id}>
                {container.id}
              </span>

              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">{container.clients?.name}</span>

              <span className="text-muted-foreground">Tipo:</span>
              <span>{container.type}</span>

              <span className="text-muted-foreground">Status:</span>
              <Badge variant="secondary">{container.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {/* Inventory */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Inventário</CardTitle>
              </div>
              <Dialog open={isInventoryOpen} onOpenChange={setIsInventoryOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Adicionar Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={inventoryForm.handleSubmit(onAddInventory)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>SKU</Label>
                      <Input {...inventoryForm.register('sku')} />
                      {inventoryForm.formState.errors.sku && (
                        <span className="text-xs text-red-500">
                          {inventoryForm.formState.errors.sku.message}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Produto</Label>
                      <Input {...inventoryForm.register('product_name')} />
                      {inventoryForm.formState.errors.product_name && (
                        <span className="text-xs text-red-500">
                          {inventoryForm.formState.errors.product_name.message}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        {...inventoryForm.register('quantity')}
                      />
                      {inventoryForm.formState.errors.quantity && (
                        <span className="text-xs text-red-500">
                          {inventoryForm.formState.errors.quantity.message}
                        </span>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="submit">Adicionar</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        Vazio
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.sku}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Eventos Recentes</CardTitle>
              </div>
              <Dialog open={isEventOpen} onOpenChange={setIsEventOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary">
                    <CalendarClock className="h-4 w-4 mr-1" /> Registrar Evento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Novo Evento</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={eventForm.handleSubmit(onAddEvent)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Tipo de Evento</Label>
                      <Select
                        onValueChange={(v) =>
                          eventForm.setValue('event_type', v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gate In">Gate In</SelectItem>
                          <SelectItem value="Gate Out">Gate Out</SelectItem>
                          <SelectItem value="Loading">Loading</SelectItem>
                          <SelectItem value="Discharge">Discharge</SelectItem>
                          <SelectItem value="Inspection">Inspection</SelectItem>
                          <SelectItem value="Maintenance">
                            Maintenance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {eventForm.formState.errors.event_type && (
                        <span className="text-xs text-red-500">
                          {eventForm.formState.errors.event_type.message}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Quantidade Associada (Opcional)</Label>
                      <Input
                        type="number"
                        {...eventForm.register('quantity')}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Registrar</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum evento registrado.
                  </p>
                ) : (
                  events.map((event, i) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{event.event_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(event.created_at),
                            "dd/MM/yyyy 'às' HH:mm",
                          )}
                        </p>
                      </div>
                      {event.quantity > 0 && (
                        <Badge variant="outline">Qtd: {event.quantity}</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
