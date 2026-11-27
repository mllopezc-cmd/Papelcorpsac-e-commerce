import { useEffect, useId, useRef } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      cancelRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }

    return () => {
      if (dialog.open) dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-sm border border-line bg-page p-6 text-ink shadow-2xl backdrop:bg-graphite/70 sm:p-8"
    >
      <h2
        id={titleId}
        className="font-display text-2xl font-medium text-ink"
      >
        {title}
      </h2>

      <p
        id={descriptionId}
        className="mt-4 whitespace-pre-line wrap-break-word text-sm leading-7 text-muted"
      >
        {description}
      </p>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-sm border border-line px-5 py-2 text-sm font-semibold text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className={`min-h-11 rounded-sm px-5 py-2 text-sm font-semibold text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text ${
            destructive
              ? 'bg-graphite hover:bg-deep-blue'
              : 'bg-deep-blue hover:bg-graphite'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
