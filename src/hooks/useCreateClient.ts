import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import useAuthStore from '@/stores/useAuthStore'

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
  const { user, token } = useAuthStore()

  const createClient = async (
    data: CreateClientData,
    options?: {
      onSuccess?: (client: any) => void
      onError?: (error: any) => void
    },
  ) => {
    setIsSubmitting(true)
    try {
      if (!user?.id || !token) {
        throw new Error('Usuário não autenticado')
      }

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
        user_id: user.id,
      }

      let newClient: any

      try {
        // Use api.db.insert which uses the auth token
        const result = await api.db.insert<any[]>('clients', payload, token)
        // Ensure we get the object (supabase return=representation returns array)
        if (Array.isArray(result) && result.length > 0) {
          newClient = result[0]
        } else {
          newClient = result
        }
      } catch (error: any) {
        // Handle duplicate key error manually since api wraps the error
        if (
          error.message?.includes('duplicate key') ||
          error.message?.includes('23505')
        ) {
          throw new Error('Cliente já cadastrado com este CNPJ')
        }
        throw error
      }

      toast.success('Cliente criado com sucesso!')

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
