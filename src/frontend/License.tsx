import { useLanguage } from '../i18n/LanguageContext'

// The license page mirrors LICENSE_TERMS.md. Plain, readable copy - no
// legalese walls - rendered through the i18n layer like everything else.
export default function License() {
  const { t } = useLanguage()

  const buyerItems = ['use', 'modify', 'ship'] as const
  const buyerProhibitedItems = ['resell', 'extract', 'authorship'] as const
  const sellerItems = ['original', 'noThirdParty', 'noAiScraped', 'grant'] as const

  return (
    <div className="px-8 py-12 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">{t('license.title')}</h1>
        <p className="text-sm text-black/60 mb-10">{t('license.subtitle')}</p>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight text-black mb-4">
            {t('license.buyerTitle')}
          </h2>
          <p className="text-sm text-black/70 leading-relaxed mb-4">{t('license.buyerIntro')}</p>
          <ul className="flex flex-col gap-2 mb-6">
            {buyerItems.map((key) => (
              <li key={key} className="flex items-start gap-3 text-sm text-black/70 leading-relaxed">
                <span className="mt-1.5 h-2 w-2 shrink-0 bg-[#0000FF]" />
                {t(`license.buyer.${key}`)}
              </li>
            ))}
          </ul>

          <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-3">
            {t('license.prohibitedTitle')}
          </h3>
          <ul className="flex flex-col gap-2">
            {buyerProhibitedItems.map((key) => (
              <li key={key} className="flex items-start gap-3 text-sm text-black/70 leading-relaxed">
                <span className="mt-1.5 h-2 w-2 shrink-0 bg-black" />
                {t(`license.prohibited.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-gray-200 pt-10">
          <h2 className="text-xl font-bold tracking-tight text-black mb-4">
            {t('license.sellerTitle')}
          </h2>
          <p className="text-sm text-black/70 leading-relaxed mb-4">{t('license.sellerIntro')}</p>
          <ul className="flex flex-col gap-2">
            {sellerItems.map((key) => (
              <li key={key} className="flex items-start gap-3 text-sm text-black/70 leading-relaxed">
                <span className="mt-1.5 h-2 w-2 shrink-0 bg-[#0000FF]" />
                {t(`license.seller.${key}`)}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
