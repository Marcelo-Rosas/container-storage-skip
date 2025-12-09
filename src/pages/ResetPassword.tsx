import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import useAuthStore from '@/stores/useAuthStore'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canResetPassword, setCanResetPassword] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    const handleRecoverySession = async () => {
      // Extract authentication parameters from the URL hash
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      // Check if we have the recovery parameters
      if (type === 'recovery' && accessToken && refreshToken) {
        try {
          // Attempt to establish a session with the extracted tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            throw error
          }

          // Session established successfully
          setCanResetPassword(true)
        } catch (error) {
          console.error('Failed to establish session:', error)
          toast.error('Link expirado ou inválido', {
            description:
              'Por favor, solicite um novo link de recuperação de senha.',
          })
          navigate('/')
        }
      } else {
        // Fallback: Check if there's already an active session
        // This handles cases where Supabase might have already processed the hash
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          setCanResetPassword(true)
        } else {
          // No valid tokens and no session - redirect to login
          navigate('/')
        }
      }
      setIsChecking(false)
    }

    handleRecoverySession()
  }, [navigate])

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsSubmitting(true)
    try {
      // Update the user's password using the established session
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        throw error
      }

      toast.success('Senha redefinida com sucesso!', {
        description: 'Você será redirecionado para o sistema.',
      })

      // Ensure the auth store is synced with the current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setSession(session.access_token)
      }

      navigate('/')
    } catch (error: any) {
      console.error('Update password error:', error)
      toast.error('Erro ao redefinir senha', {
        description: error.message || 'Ocorreu um erro ao atualizar sua senha.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Verificando link de recuperação...
        </p>
      </div>
    )
  }

  if (!canResetPassword) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Nova Senha</CardTitle>
          <p className="text-sm text-muted-foreground">
            Defina sua nova senha de acesso
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="******"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="******"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Redefinir Senha'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
