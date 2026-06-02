export const Field = ({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-muted-foreground">
      {label}
    </label>
    {children}
    {error && <p className="mt-0.5 text-xs text-destructive">{error}</p>}
  </div>
)
