import type { LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  variant = "destructive",
  icon: Icon,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  variant?: "destructive" | "default"
  icon?: LucideIcon
  children?: React.ReactNode
}) => {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          {Icon && (
            <div className="flex items-center gap-2">
              <Icon
                className={
                  variant === "destructive"
                    ? "h-4 w-4 text-destructive"
                    : "h-4 w-4 text-amber-500"
                }
              />
              <DialogTitle>{title}</DialogTitle>
            </div>
          )}
          {!Icon && <DialogTitle>{title}</DialogTitle>}
          {description && (
            <DialogDescription asChild={typeof description !== "string"}>
              {typeof description === "string" ? (
                description
              ) : (
                <div>{description}</div>
              )}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel ?? t("common.cancel")}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
