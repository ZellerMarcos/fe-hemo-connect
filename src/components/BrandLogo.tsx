import { BRAND_LOGO } from '../utils/branding'

interface BrandLogoProps {
  compact?: boolean
  className?: string
}

export function BrandLogo({ compact = false, className = '' }: BrandLogoProps) {
  return (
    <img
      src={BRAND_LOGO.url}
      alt={BRAND_LOGO.alt}
      width={BRAND_LOGO.width}
      height={BRAND_LOGO.height}
      className={`brand-logo${compact ? ' brand-logo--compact' : ''} ${className}`}
      decoding="sync"
    />
  )
}
