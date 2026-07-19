import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../backend/supabase'

interface FounderMetrics {
  gmv_by_month: Array<{ month: string; gmv: number; purchases: number }>
  total_gmv: number
  total_purchases: number
  active_sellers: number
  bounty_fill: {
    posted: number
    accepted: number
    fill_rate: number
    median_hours_to_fill: number
  }
}

function StatTile({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-black p-6 flex flex-col gap-2">
      <span className="text-xs font-medium text-black/40 uppercase tracking-widest">{label}</span>
      <span className={`text-3xl font-bold tracking-tight ${accent ? 'text-[#0000FF]' : 'text-black'}`}>
        {value}
      </span>
    </div>
  )
}

export default function AdminMetrics() {
  const { t } = useLanguage()
  const [metrics, setMetrics] = useState<FounderMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.rpc('get_founder_metrics').then(({ data, error: rpcError }) => {
      if (rpcError) {
        setError(rpcError.message)
        return
      }
      setMetrics(data as FounderMetrics)
    })
  }, [])

  if (error) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-red-600">{error}</span>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black/40">{t('metrics.loading')}</span>
      </div>
    )
  }

  const maxGmv = Math.max(1, ...metrics.gmv_by_month.map((row) => row.gmv))

  return (
    <div className="px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-10">{t('metrics.title')}</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatTile label={t('metrics.gmv')} value={`$${metrics.total_gmv.toFixed(2)}`} accent />
          <StatTile label={t('metrics.purchases')} value={String(metrics.total_purchases)} />
          <StatTile label={t('metrics.activeSellers')} value={String(metrics.active_sellers)} />
          <StatTile
            label={t('metrics.fillRate')}
            value={`${Math.round(metrics.bounty_fill.fill_rate * 100)}%`}
            accent
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12 max-w-md">
          <StatTile label={t('metrics.bountiesPosted')} value={String(metrics.bounty_fill.posted)} />
          <StatTile
            label={t('metrics.medianTimeToFill')}
            value={`${metrics.bounty_fill.median_hours_to_fill}h`}
          />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-black mb-6">{t('metrics.gmvByMonth')}</h2>
        {metrics.gmv_by_month.length === 0 ? (
          <span className="text-sm text-black/40">{t('metrics.noData')}</span>
        ) : (
          <div className="flex flex-col gap-2 max-w-2xl">
            {metrics.gmv_by_month.map((row) => (
              <div key={row.month} className="flex items-center gap-4">
                <span className="text-xs font-medium text-black/60 w-16">{row.month}</span>
                <div className="flex-1 h-6 border border-black">
                  <div
                    className="h-full bg-[#0000FF]"
                    style={{ width: `${Math.round((row.gmv / maxGmv) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-black w-24 text-right">
                  ${row.gmv.toFixed(2)} ({row.purchases})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
