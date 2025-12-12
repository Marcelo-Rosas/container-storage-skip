import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Save, X, ArrowLeft } from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const containerSchema = z.object({
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  container_number: z.string().min(1, 'Número do contêiner é obrigatório'),
  container_code: z.string().min(1, 'Código do contêiner é obrigatório'),
  container_type: z.string().min(1, 'Tipo de contêiner é obrigatório'),
  start_date: z.date({
    required_error: 'Data de início é obrigatória',
  }),
  end_date: z.date().optional(),
  status: z.enum(['active', 'inactive', 'closed']),
  nominal_volume_m3: z.coerce.number().min(0).optional(),
  base_cost_brl: z.coerce.number().min(0).optional(),
  measurement_day: z.coerce
    .number()
    .min(1, 'Dia deve ser entre 1 e 31')
    .max(31, 'Dia deve ser entre 1 e 31')
    .optional()
    .or(z.literal(0).transform(() => undefined)), // Handle empty input converting to 0
  yard_location: z.string().optional(),
  notes: z.string().optional(),
})

type ContainerFormValues = z.infer<typeof containerSchema>

export default function ContainerNew() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [containerTypes, setContainerTypes] = useState<
    { code: string; name: string }[]
  >([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const form = useForm<ContainerFormValues>({
    resolver: zodResolver(containerSchema),
    defaultValues: {
      status: 'active',
      container_number: '',
      container_code: '',
      yard_location: '',
      notes: '',
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, typesRes] = await Promise.all([
          supabase.from('clients').select('id, name').order('name'),
          supabase.from('container_types').select('code, name').order('name'),
        ])

        if (clientsRes.error) throw clientsRes.error
        if (typesRes.error) throw typesRes.error

        setClients(clientsRes.data || [])
        setContainerTypes(typesRes.data || [])
      } catch (error) {
        console.error('Error loading form data:', error)
        toast.error('Erro ao carregar dados do formulário')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  const onSubmit = async (data: ContainerFormValues) => {
    if (!user) return
    setIsSubmitting(true)

    try {
      // Clean up optional number fields if they are NaN or 0 if that's undesired
      const payload = {
        ...data,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        end_date: data.end_date ? format(data.end_date, 'yyyy-MM-dd') : null,
        created_by: user.id,
        // Ensure empty optional numbers are undefined or null
        measurement_day: data.measurement_day || null,
        nominal_volume_m3: data.nominal_volume_m3 || null,
        base_cost_brl: data.base_cost_brl || null,
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
      navigate('/containers')
    } catch (error: any) {
      console.error('Error creating container:', error)
      toast.error('Erro ao criar contêiner', {
        description: error.message || 'Ocorreu um erro inesperado.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/containers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Novo Contêiner</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Contêiner</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <FormLabel>Código Interno *</FormLabel>
                      <FormControl>
                        <Input placeholder="Código de referência" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="container_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Contêiner *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {containerTypes.map((type) => (
                            <SelectItem key={type.code} value={type.code}>
                              {type.name} ({type.code})
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
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
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
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Fim (Opcional)</FormLabel>
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
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date('1900-01-01')}
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
                  name="base_cost_brl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo Base (BRL)</FormLabel>
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
                      <FormDescription>
                        Dia do mês para faturamento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yard_location"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Localização no Pátio</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Setor A, Rua 3" {...field} />
                      </FormControl>
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
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/containers')}
                  disabled={isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Criar Contêiner
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
