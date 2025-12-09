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
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    // Check initial session in case user refreshes or token is already processed
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsReady(true)
      }
    })

    // Listen for auth state changes as required by user story
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true)
      } else if (event === 'SIGNED_IN' && session) {
        // Recovery links often sign the user in immediately
        setIsReady(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Timeout to handle invalid links or missing session
  useEffect(() => {
    if (isReady) return

    const timeout = setTimeout(async () => {
      // Double check session before failing
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session && !isReady) {
        toast.error('Link inválido ou expirado', {
          description:
            'Por favor, solicite um novo link de recuperação de senha.',
        })
        navigate('/recuperar-senha')
      }
    }, 4000)

    return () => clearTimeout(timeout)
  }, [isReady, navigate])

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        throw error
      }

      // Check if session is still valid and get the token
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Automatically log the user in by updating the store
        // This will trigger the auth store to fetch user profile and redirect logic in App/Index
        setSession(session.access_token)

        toast.success('Senha redefinida com sucesso!', {
          description: 'Você será redirecionado para o sistema.',
        })

        // Redirect to main app route as requested
        navigate('/')
      } else {
        // Fallback if session is lost
        toast.success('Senha redefinida com sucesso!', {
          description: 'Por favor, faça login com sua nova senha.',
        })
        navigate('/')
      }
    } catch (error: any) {
      console.error('Update password error:', error)
      toast.error('Erro ao redefinir senha', {
        description: error.message || 'Ocorreu um erro ao atualizar sua senha.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Verificando link de recuperação...
        </p>
      </div>
    )
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
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
