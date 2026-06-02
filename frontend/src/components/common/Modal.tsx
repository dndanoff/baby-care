import { createPortal } from "react-dom"

export const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) =>
  createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-xl bg-background p-6 shadow-xl">
        {children}
      </div>
    </div>,
    document.body
  )
