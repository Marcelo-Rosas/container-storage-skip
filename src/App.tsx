import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Containers from './pages/Containers'
import ContainerDetails from './pages/ContainerDetails'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { AuthProvider } from '@/stores/useAuthStore'
import useAuthStore from '@/stores/useAuthStore'

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    )
  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/containers"
              element={
                <ProtectedRoute>
                  <Containers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/containers/:id"
              element={
                <ProtectedRoute>
                  <ContainerDetails />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
