import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'whatsapp' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    
    return (
      <Comp
        ref={ref as any}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-brand-primary text-white hover:bg-brand-primary-dark hover:shadow-lg hover:shadow-brand-primary/30 hover:-translate-y-0.5': variant === 'default',
            'bg-brand-secondary text-white hover:bg-brand-secondary-light hover:shadow-lg hover:shadow-brand-secondary/30 hover:-translate-y-0.5': variant === 'secondary',
            'border-2 border-brand-primary/20 bg-transparent text-brand-secondary hover:border-brand-primary hover:bg-brand-primary/5 hover:-translate-y-0.5': variant === 'outline',
            'hover:bg-brand-primary/10 text-brand-secondary hover:text-brand-primary': variant === 'ghost',
            'text-brand-primary underline-offset-4 hover:underline': variant === 'link',
            'bg-[#25D366] text-white hover:bg-[#128C7E] hover:shadow-lg hover:shadow-[#25D366]/30 hover:-translate-y-0.5': variant === 'whatsapp',
            'glass-effect text-brand-secondary hover:bg-white hover:shadow-md': variant === 'glass',
            
            'h-10 px-5 py-2': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-14 px-8 text-base': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
