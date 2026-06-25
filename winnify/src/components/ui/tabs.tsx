import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn("", className)} data-value={value} data-onchange={onValueChange as unknown as string}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ value?: string; activeValue?: string; onValueChange?: (v: string) => void }>, {
            activeValue: value,
            onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  activeValue?: string
  onValueChange?: (v: string) => void
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, activeValue, onValueChange, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("inline-flex items-center gap-1 rounded-lg p-1", className)}
      style={{ background: 'var(--surface-muted)' }}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ activeValue?: string; onValueChange?: (v: string) => void }>, {
            activeValue,
            onValueChange,
          })
        }
        return child
      })}
    </div>
  )
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  activeValue?: string
  onValueChange?: (v: string) => void
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, activeValue, onValueChange, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold font-[family-name:var(--font-heading)] transition-all cursor-pointer",
        className
      )}
      style={{
        background: activeValue === value ? 'var(--card)' : 'transparent',
        color: activeValue === value ? 'var(--text)' : 'var(--text-muted)',
        boxShadow: activeValue === value ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
      }}
      onClick={() => onValueChange?.(value)}
      {...props}
    />
  )
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  activeValue?: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, activeValue, ...props }, ref) => {
    if (activeValue !== value) return null
    return <div ref={ref} className={cn("mt-4", className)} {...props} />
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
