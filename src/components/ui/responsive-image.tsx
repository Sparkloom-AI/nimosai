import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ResponsiveImage component for consistent image rendering across all pages.
 * Ensures fixed proportional sizing across different breakpoints and prevents layout shifts.
 * 
 * Variants:
 * - hero: Large hero images with overlay support
 * - card: Standard card images (32x32)
 * - avatar: Default avatar size (40x40)
 * - avatar-sm: Small avatar (32x32) 
 * - avatar-lg: Large avatar (64x64)
 * - full: Full container coverage
 */

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: "hero" | "card" | "avatar" | "avatar-sm" | "avatar-lg" | "full"
  aspectRatio?: "square" | "video" | "portrait" | "auto"
  overlay?: boolean
  overlayContent?: React.ReactNode
}

const ResponsiveImage = React.forwardRef<HTMLImageElement, ResponsiveImageProps>(
  ({ 
    className, 
    variant = "full", 
    aspectRatio = "auto", 
    overlay = false, 
    overlayContent,
    alt,
    ...props 
  }, ref) => {
    const containerClasses = cn(
      "relative overflow-hidden",
      {
        // Variant-based container styling
        "w-full h-full": variant === "full",
        "w-32 h-32 rounded-lg": variant === "card",
        "w-8 h-8 rounded-full": variant === "avatar-sm",
        "w-10 h-10 rounded-full": variant === "avatar",
        "w-16 h-16 rounded-full": variant === "avatar-lg",
        "min-h-[400px] lg:min-h-[600px]": variant === "hero",
        
        // Aspect ratio classes
        "aspect-square": aspectRatio === "square",
        "aspect-video": aspectRatio === "video", 
        "aspect-[3/4]": aspectRatio === "portrait"
      }
    )

    const imageClasses = cn(
      "object-cover transition-transform duration-300",
      {
        "absolute inset-0 w-full h-full": variant === "full" || variant === "hero",
        "w-full h-full": variant === "card" || variant === "avatar" || variant === "avatar-sm" || variant === "avatar-lg",
      },
      className
    )

    const overlayClasses = cn(
      "absolute inset-0",
      "bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20"
    )

    const overlayBottomClasses = cn(
      "absolute inset-0",
      "bg-gradient-to-t from-background/80 via-transparent to-transparent"
    )

    if (variant === "avatar" || variant === "avatar-sm" || variant === "avatar-lg") {
      return (
        <div className={containerClasses}>
          <img
            ref={ref}
            alt={alt}
            className={imageClasses}
            {...props}
          />
        </div>
      )
    }

    return (
      <div className={containerClasses}>
        <img
          ref={ref}
          alt={alt}
          className={imageClasses}
          {...props}
        />
        
        {overlay && (
          <>
            <div className={overlayClasses} />
            <div className={overlayBottomClasses} />
          </>
        )}
        
        {overlayContent && (
          <div className="absolute bottom-8 left-8 right-8 text-white">
            {overlayContent}
          </div>
        )}
      </div>
    )
  }
)

ResponsiveImage.displayName = "ResponsiveImage"

export { ResponsiveImage }