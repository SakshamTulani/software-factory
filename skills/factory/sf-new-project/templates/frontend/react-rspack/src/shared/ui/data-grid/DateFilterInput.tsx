import type { CustomDateProps } from "ag-grid-react"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Input } from "@/shared/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"

const FORMAT = "yyyy-MM-dd"

/**
 * The date input inside every date filter: type an ISO date or pick one.
 * The popover carries `ag-custom-component-popup` so clicking it doesn't close the filter.
 */
export function DateFilterInput({ date, onDateChange }: CustomDateProps) {
  const [text, setText] = useState(date ? format(date, FORMAT) : "")
  const [open, setOpen] = useState(false)

  useEffect(() => setText(date ? format(date, FORMAT) : ""), [date])

  const commit = (value: string) => {
    setText(value)
    if (value === "") return onDateChange(null)
    const parsed = parse(value, FORMAT, new Date())
    if (isValid(parsed)) onDateChange(parsed)
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        aria-label="Date"
        className="h-8"
        placeholder={FORMAT}
        value={text}
        onChange={(e) => commit(e.target.value)}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Pick a date">
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ag-custom-component-popup w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={(picked) => {
              onDateChange(picked ?? null)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
