import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, Package, LayoutDashboard, LogOut, User } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/containers', label: 'Contêineres', icon: Package },
  ]

  const NavContent = () => (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center h-16 px-4 border-b">
        <Package className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg">Gestão Contêineres</span>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  if (!user) return <Outlet />

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card shadow-sm fixed h-full z-20">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-3 left-3 z-40"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-card">
          <NavContent />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-end px-6 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold">{user.full_name}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {user.role}
              </span>
            </div>
            <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Sair"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="mx-auto max-w-7xl animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
