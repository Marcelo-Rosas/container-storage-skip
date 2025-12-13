import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

interface CreateClientData {
  name: string
  fantasy_name?: string
  tax_id: string
  phone?: string
  email?: string
  address?: string
}

export function useCreateClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createClient = async (
    data: CreateClientData,
    options?: {
      onSuccess?: (client: any) => void
      onError?: (error: any) => void
    },
  ) => {
    setIsSubmitting(true)
    try {
      // Strip non-numeric characters from tax_id
      const cleanTaxId = data.tax_id.replace(/\D/g, '')

      const payload = {
        name: data.name,
        fantasy_name: data.fantasy_name || null,
        tax_id: cleanTaxId,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        status: 'active',
      }

      const { data: newClient, error } = await supabase
        .from('clients')
        .insert(payload)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new Error('Cliente já cadastrado com este CNPJ')
        }
        throw error
      }

      toast.success('Cliente criado com sucesso!')

      // Note: If using React Query, we would invalidate queries here.
      // queryClient.invalidateQueries({ queryKey: ['clients'] })

      options?.onSuccess?.(newClient)
      return { data: newClient, error: null }
    } catch (error: any) {
      console.error('Error creating client:', error)
      const errorMessage = error.message || 'Erro desconhecido'
      toast.error(`Erro ao criar cliente: ${errorMessage}`)
      options?.onError?.(error)
      return { data: null, error }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    createClient,
    isSubmitting,
  }
}
