export const validateRequired = (
  value: string,
  label: string
): string | undefined => {
  if (!value.trim()) return `${label} is required`
}

export const validatePositiveInt = (
  value: string,
  label: string
): string | undefined => {
  const n = parseInt(value, 10)
  if (!value || isNaN(n) || n <= 0) return `Enter valid ${label}`
}

export const validatePositiveFloat = (
  value: string,
  label: string
): string | undefined => {
  const n = parseFloat(value)
  if (!value || isNaN(n) || n <= 0) return `Enter valid ${label}`
}
