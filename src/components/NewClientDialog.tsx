import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { formatCNPJ } from '@/utils/container-utils'

const clientSchema = z.object({
  name: z.string().min(1, 'Razão Social é obrigatória'),
  tax_id: z
    .string()
    .min(14, 'CNPJ deve ter 14 dígitos')
    .transform((val) => val.replace(/\D/g, '')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

interface NewClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (client: { id: string; name: string; tax_id: string }) => void
}

export function NewClientDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewClientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      tax_id: '',
      email: '',
      phone: '',
    },
  })

  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true)
    try {
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
          name: data.name,
          tax_id: data.tax_id,
          email: data.email || null,
          phone: data.phone || null,
        })
        .select('id, name, tax_id')
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error('Cliente já cadastrado com este CNPJ')
          return
        }
        throw error
      }

      toast.success('Cliente cadastrado com sucesso!')
      onSuccess(newClient)
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      console.error('Error creating client:', error)
      toast.error('Erro ao cadastrar cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Cadastre um novo cliente rapidamente para continuar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Cliente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
