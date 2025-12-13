import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { formatCNPJ, formatPhone } from '@/utils/container-utils'
import { useCreateClient } from '@/hooks/useCreateClient'

const clientSchema = z.object({
  name: z
    .string()
    .min(1, 'Razão Social é obrigatória')
    .max(200, 'Máximo de 200 caracteres'),
  fantasy_name: z.string().max(200, 'Máximo de 200 caracteres').optional(),
  tax_id: z
    .string()
    .min(14, 'CNPJ deve ter 14 dígitos')
    .transform((val) => val.replace(/\D/g, '')),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'Máximo de 100 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z.string().max(20, 'Máximo de 20 caracteres').optional(),
  address: z.string().max(300, 'Máximo de 300 caracteres').optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

interface NewClientDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClientCreated?: (client: any) => void
  trigger?: React.ReactNode
}

export function NewClientDialog({
  open,
  onOpenChange,
  onClientCreated,
  trigger,
}: NewClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const { createClient, isSubmitting } = useCreateClient()

  // Determine if controlled or uncontrolled
  const isControlled = open !== undefined
  const show = isControlled ? open : internalOpen
  const setShow = isControlled ? onOpenChange! : setInternalOpen

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      fantasy_name: '',
      tax_id: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (show) {
      form.reset()
    }
  }, [show, form])

  const onSubmit = async (data: ClientFormValues) => {
    await createClient(data, {
      onSuccess: (newClient) => {
        onClientCreated?.(newClient)
        setShow(false)
        form.reset()
      },
    })
  }

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Cadastre um novo cliente preenchendo as informações abaixo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fantasy_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome fantasia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00.000.000/0000-00"
                      {...field}
                      onChange={(e) => {
                        field.onChange(formatCNPJ(e.target.value))
                      }}
                      maxLength={18}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="contato@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={(e) => {
                          field.onChange(formatPhone(e.target.value))
                        }}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShow(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
