import { useState } from "react"
import { ShieldCheck, Info } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
import { Modal } from "@/components/common/Modal"

export const DataPrivacyNote = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
      >
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
        <span className="flex-1 text-xs font-medium text-primary">
          {t("privacy.buttonText")}
        </span>
        <Info className="h-3.5 w-3.5 shrink-0 text-primary/60" />
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold">{t("privacy.title")}</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <Trans
                i18nKey="privacy.p1"
                components={{ strong: <strong className="text-foreground" /> }}
              />
            </p>
            <p>{t("privacy.p2")}</p>
            <p>
              <Trans
                i18nKey="privacy.p3"
                components={{ strong: <strong className="text-foreground" /> }}
              />
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="mt-5 w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("privacy.gotIt")}
          </button>
        </Modal>
      )}
    </>
  )
}
