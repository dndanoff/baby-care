import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

const NotFound = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-6xl">🍼</span>
      <h1 className="text-3xl font-bold">
        {t("notFound.title", "Page not found")}
      </h1>
      <p className="max-w-sm text-muted-foreground">
        {t(
          "notFound.description",
          "The page you're looking for doesn't exist or has been moved."
        )}
      </p>
      <Button onClick={() => navigate("/dashboard", { replace: true })}>
        {t("notFound.goHome", "Go to Dashboard")}
      </Button>
    </div>
  )
}

export default NotFound
