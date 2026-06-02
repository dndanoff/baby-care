import { useTranslation } from "react-i18next"

/** Two-field 24 h time picker — avoids AM/PM browser locale issue with type="time". */
export const Time24Input = ({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) => {
  const { t } = useTranslation()
  const [hStr, mStr] = value.split(":")

  const commit = (rawH: string, rawM: string) => {
    const h = Math.min(23, Math.max(0, parseInt(rawH, 10) || 0))
    const m = Math.min(59, Math.max(0, parseInt(rawM, 10) || 0))
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  }

  return (
    <div className="input flex items-center gap-0.5 px-2">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={23}
        value={hStr ?? "00"}
        onChange={(e) => commit(e.target.value, mStr ?? "00")}
        className="w-7 [appearance:textfield] bg-transparent text-center outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label={t("weight.hours")}
      />
      <span className="font-medium select-none">:</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={59}
        value={mStr ?? "00"}
        onChange={(e) => commit(hStr ?? "00", e.target.value)}
        className="w-7 [appearance:textfield] bg-transparent text-center outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label={t("weight.minutes")}
      />
    </div>
  )
}
