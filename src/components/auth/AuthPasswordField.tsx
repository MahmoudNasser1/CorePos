"use client"

import { useId, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UseFormRegisterReturn, FieldError } from "react-hook-form"

type Props = {
  id: string
  label: string
  hint?: string
  disabled?: boolean
  autoComplete: string
  error?: FieldError
  registration: UseFormRegisterReturn
}

/**
 * حقل كلمة مرور مع إظهار/إخفاء — يستبدل `type="password"` الافتراضي.
 */
export function AuthPasswordField({
  id,
  label,
  hint,
  disabled,
  autoComplete,
  error,
  registration,
}: Props) {
  const [visible, setVisible] = useState(false)
  const errId = useId()

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          disabled={disabled}
          className="pe-12"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errId : undefined}
          {...registration}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute end-0.5 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </Button>
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <span id={errId} className="text-xs text-destructive" role="status">
          {error.message}
        </span>
      ) : null}
    </div>
  )
}
