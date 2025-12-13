import { supabase } from '@/lib/supabase/client'

export const statusConfig: Record<
  string,
  {
    label: string
    color: string
    badge: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  active: { label: 'Ativo', color: 'text-green-600', badge: 'default' },
  inactive: { label: 'Inativo', color: 'text-gray-600', badge: 'secondary' },
  closed: { label: 'Fechado', color: 'text-red-600', badge: 'destructive' },
  // Fallback
  default: { label: 'Desconhecido', color: 'text-gray-500', badge: 'outline' },
}

export async function getContainerSpecs(code: string) {
  try {
    const { data } = await supabase
      .from('container_types')
      .select('name')
      .eq('code', code)
      .single()
    return data?.name || code
  } catch (error) {
    console.error('Error fetching container specs:', error)
    return code
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatNumber(value: number, decimals = 2) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCNPJ(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18)
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').substring(0, 11)

  if (digits.length > 10) {
    // (11) 91234-5678
    return digits.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (digits.length > 6) {
    // (11) 1234-5678
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }
  if (digits.length > 2) {
    // (11) 1234...
    return digits.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
  }
  if (digits.length > 0) {
    // (1...
    return digits.replace(/^(\d*)/, '($1')
  }
  return digits
}
