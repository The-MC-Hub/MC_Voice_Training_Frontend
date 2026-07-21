import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate) => {
    onDateChange?.(selectedDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-[240px] justify-start text-left font-normal rounded-md px-4 py-2.5 border-white/10 bg-slate-800/50 hover:bg-slate-800 hover:border-[var(--accent-gold)]/30 transition-all",
            !date && "text-slate-500",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
          <span className="truncate">
            {date ? format(date, "PPP") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2030, 11)}
          defaultMonth={date || new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
