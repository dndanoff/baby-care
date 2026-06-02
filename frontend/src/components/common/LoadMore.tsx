import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export const LoadMore = ({
  hasMore,
  onLoadMore,
  label,
}: {
  hasMore: boolean
  onLoadMore: () => void
  label?: string
}) => {
  const { t } = useTranslation()
  if (!hasMore) return null
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onLoadMore}
      className="mt-2 w-full text-muted-foreground"
    >
      {label ?? t("common.loadMore")}
    </Button>
  )
}
