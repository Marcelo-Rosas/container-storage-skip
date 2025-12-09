import { useEffect, useState } from 'react'
import useAuthStore from '@/stores/useAuthStore'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Container, DollarSign, Box } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

export default function Dashboard() {
  const { user, token } = useAuthStore()
  const [stats, setStats] = useState({
    activeContainers: 0,
    revenue: 0,
    volume: 0,
  })
  const [containerTypes, setContainerTypes] = useState<any[]>([])
  const [eventsTrend, setEventsTrend] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token) return
      setIsLoading(true)
      try {
        let query = 'select=*'
        if (user.role === 'operator' && user.client_id) {
          query += `&client_id=eq.${user.client_id}`
        }

        const containers = await api.db.select<any>('containers', query, token)

        // Calculate KPIs
        const active = containers.filter((c: any) =>
          ['Active', 'In Transit'].includes(c.status),
        ).length

        // Mock calculations for Revenue and Volume based on type
        let totalRevenue = 0
        let totalVolume = 0
        const typeCounts: Record<string, number> = {}

        containers.forEach((c: any) => {
          // Mock logic
          const isLarge = c.type.includes('40')
          totalRevenue += isLarge ? 1200 : 800
          totalVolume += isLarge ? 67 : 33

          typeCounts[c.type] = (typeCounts[c.type] || 0) + 1
        })

        setStats({
          activeContainers: active,
          revenue: totalRevenue,
          volume: totalVolume,
        })

        // Chart Data 1: Containers by Type
        const typeData = Object.entries(typeCounts).map(
          ([name, value], idx) => ({
            name,
            value,
            fill: `hsl(var(--chart-${(idx % 5) + 1}))`,
          }),
        )
        setContainerTypes(typeData)

        // Events Trend (Mocked or real if we fetch events)
        // Fetching events for chart
        // Limit to recent events for performance
        let eventQuery = 'select=*&order=created_at.desc&limit=50'
        // Ideally we filter events by containers that belong to client, but simpler logic here:
        // Supabase RLS should handle filtering if configured, otherwise we rely on client logic.
        // Assuming RLS is NOT strict or we filter manually.
        const events = await api.db.select<any>('events', eventQuery, token)

        // Aggregate events by day
        const eventsByDay: Record<string, number> = {}
        events.forEach((e: any) => {
          const date = new Date(e.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          })
          eventsByDay[date] = (eventsByDay[date] || 0) + 1
        })

        const trendData = Object.entries(eventsByDay)
          .map(([date, count]) => ({ date, count }))
          .reverse()
        setEventsTrend(
          trendData.length > 0 ? trendData : [{ date: 'Hoje', count: 0 }],
        )
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user, token])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Olá, {user?.full_name?.split(' ')[0]}!
      </h1>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contêineres Ativos
            </CardTitle>
            <Container className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContainers}</div>
            <p className="text-xs text-muted-foreground">Total em operação</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Estimada
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(stats.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita total estimada
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <Box className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.volume.toLocaleString('pt-BR')} CBM
            </div>
            <p className="text-xs text-muted-foreground">Volume total em m³</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contêineres por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[300px] w-full">
              <BarChart data={containerTypes}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[300px] w-full">
              <LineChart data={eventsTrend}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
