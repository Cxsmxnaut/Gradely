import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaAutosizeProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

const TextareaAutosize = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ className, minRows = 1, maxRows = 10, value, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [height, setHeight] = React.useState<string>("auto")

    React.useImperativeHandle(ref, () => textareaRef.current!)

    React.useEffect(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      const updateHeight = () => {
        textarea.style.height = "auto"
        const newHeight = Math.min(
          Math.max(textarea.scrollHeight, minRows * 24),
          maxRows * 24
        )
        textarea.style.height = `${newHeight}px`
        setHeight(`${newHeight}px`)
      }

      updateHeight()

      // Add event listeners
      textarea.addEventListener("input", updateHeight)
      window.addEventListener("resize", updateHeight)

      return () => {
        textarea.removeEventListener("input", updateHeight)
        window.removeEventListener("resize", updateHeight)
      }
    }, [value, minRows, maxRows])

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={textareaRef}
        value={value}
        onChange={onChange}
        style={{ height }}
        {...props}
      />
    )
  }
)
TextareaAutosize.displayName = "TextareaAutosize"

export { TextareaAutosize }
