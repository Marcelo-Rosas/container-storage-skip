import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { formatCurrency, formatCNPJ } from '@/utils/container-utils'
import { NewClientDialog } from './NewClientDialog'

const containerSchema = z.object({
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  container_number: z.string().min(1, 'Número do contêiner é obrigatório'),
  container_code: z.string().optional(),
  container_type: z.string().min(1, 'Tipo de contêiner é obrigatório'),
  start_date: z.date({
    required_error: 'Data de início é obrigatória',
  }),
  end_date: z.date().optional(),
  status: z.enum(['active', 'inactive', 'closed']),
  nominal_volume_m3: z.coerce.number().min(0).optional(),
  base_cost_brl: z.coerce.number().min(0, 'Custo base deve ser positivo'),
  measurement_day: z.coerce
    .number()
    .min(1, 'Dia deve ser entre 1 e 31')
    .max(31, 'Dia deve ser entre 1 e 31')
    .optional()
    .or(z.literal(0).transform(() => undefined)),
  yard_location: z.string().optional(),
  notes: z.string().optional(),
})

type ContainerFormValues = z.infer<typeof containerSchema>

interface ContainerType {
  code: string
  name: string
  default_base_cost_brl: number | null
}

interface Client {
  id: string
  name: string
  tax_id: string
}

interface NewContainerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NewContainerDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewContainerDialogProps) {
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([])
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)

  const form = useForm<ContainerFormValues>({
    resolver: zodResolver(containerSchema),
    defaultValues: {
      status: 'active',
      container_number: '',
      container_code: '',
      yard_location: '',
      notes: '',
      start_date: new Date(),
    },
  })

  // Load initial data
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    try {
      const [clientsRes, typesRes] = await Promise.all([
        supabase.from('clients').select('id, name, tax_id').order('name'),
        supabase
          .from('container_types')
          .select('code, name, default_base_cost_brl')
          .order('name'),
      ])

      if (clientsRes.error) throw clientsRes.error
      if (typesRes.error) throw typesRes.error

      setClients(clientsRes.data || [])
      setContainerTypes(typesRes.data || [])
    } catch (error) {
      console.error('Error loading form data:', error)
      toast.error('Erro ao carregar dados do formulário')
    }
  }

  // Watch for Container Type changes to pre-fill cost
  const selectedType = form.watch('container_type')
  useEffect(() => {
    if (selectedType) {
      const typeData = containerTypes.find((t) => t.code === selectedType)
      if (typeData && typeData.default_base_cost_brl) {
        form.setValue('base_cost_brl', typeData.default_base_cost_brl)
      }
    }
  }, [selectedType, containerTypes, form])

  // Get selected client for displaying tax_id
  const selectedClientId = form.watch('client_id')
  const selectedClient = clients.find((c) => c.id === selectedClientId)

  const onSubmit = async (data: ContainerFormValues) => {
    if (!user) return
    setIsSubmitting(true)

    try {
      const payload = {
        ...data,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        end_date: data.end_date ? format(data.end_date, 'yyyy-MM-dd') : null,
        created_by: user.id,
        // Optional conversions
        measurement_day: data.measurement_day || null,
        nominal_volume_m3: data.nominal_volume_m3 || null,
        container_code: data.container_code || null,
        notes: data.notes || null,
        yard_location: data.yard_location || null,
      }

      const { error } = await supabase.from('containers').insert(payload)

      if (error) {
        if (error.code === '23505') {
          form.setError('container_number', {
            message: 'Este número de contêiner já existe.',
          })
          toast.error('Número de contêiner duplicado')
          return
        }
        throw error
      }

      toast.success('Contêiner criado com sucesso!')
      form.reset()
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error creating container:', error)
      toast.error('Erro ao criar contêiner', {
        description: error.message || 'Ocorreu um erro inesperado.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClientCreated = (newClient: Client) => {
    setClients((prev) =>
      [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)),
    )
    form.setValue('client_id', newClient.id)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Contêiner</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para registrar um novo contêiner no
              sistema.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Container Identification */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Identificação
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="container_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Contêiner *</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: ABCD1234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="container_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Interno (Opcional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Código de referência"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Client Selection */}
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel>Cliente *</FormLabel>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => setIsNewClientOpen(true)}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Novo Cliente
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedClient && (
                          <FormDescription>
                            CNPJ: {formatCNPJ(selectedClient.tax_id)}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Container Type & Cost */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 mt-2">
                    Especificações
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="container_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Contêiner *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {containerTypes.map((type) => (
                                <SelectItem key={type.code} value={type.code}>
                                  {type.name}
                                  {type.default_base_cost_brl
                                    ? ` - ${formatCurrency(type.default_base_cost_brl)}`
                                    : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="base_cost_brl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custo Base (BRL) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Dates & Location */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 mt-2">
                    Operacional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Início *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'dd/MM/yyyy')
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date('1900-01-01')
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yard_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localização no Pátio</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ex: Setor A, Rua 3"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 mt-2">
                    Adicionais (Opcional)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nominal_volume_m3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Volume Nominal (m³)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="measurement_day"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia de Medição (1-31)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={31}
                              placeholder="1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Fim</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'dd/MM/yyyy')
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date('1900-01-01')
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informações adicionais..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Criar Contêiner
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <NewClientDialog
        open={isNewClientOpen}
        onOpenChange={setIsNewClientOpen}
        onSuccess={handleClientCreated}
      />
    </>
  )
}
