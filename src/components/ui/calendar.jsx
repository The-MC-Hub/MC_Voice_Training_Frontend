import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  size = "default",
  ...props
}) {
  const isDropdown = props.captionLayout === "dropdown";
  const isLarge = size === "lg";

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "relative flex flex-col sm:flex-row gap-4",
        month: "space-y-4 w-full",
        month_caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: isDropdown
          ? "sr-only"
          : "text-sm font-medium text-white",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          isLarge
            ? "absolute left-1 top-0 h-9 w-9"
            : "absolute left-1 top-0 h-7 w-7",
          "bg-transparent p-0 text-slate-400 hover:text-white border-white/10",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          isLarge
            ? "absolute right-1 top-0 h-9 w-9"
            : "absolute right-1 top-0 h-7 w-7",
          "bg-transparent p-0 text-slate-400 hover:text-white border-white/10",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: cn(
          "text-slate-500 rounded-md font-medium",
          isLarge ? "w-12 text-sm" : "w-9 text-[0.8rem]",
        ),
        week: cn("flex w-full", isLarge ? "mt-1" : "mt-2"),
        day: cn(
          "relative p-0 text-center focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[var(--accent-gold)]/10 [&:has([aria-selected].day-outside)]:bg-[var(--accent-gold)]/5",
          isLarge ? "text-base" : "text-sm",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "p-0 font-normal text-slate-300 hover:text-white aria-selected:opacity-100",
          isLarge ? "h-12 w-12 text-base" : "h-9 w-9",
        ),
        range_end: "day-range-end",
        range_start: "day-range-start",
        selected:
          "bg-[var(--accent-gold)] text-slate-950 hover:bg-[var(--accent-gold)] hover:text-slate-950 focus:bg-[var(--accent-gold)] focus:text-slate-950 rounded-md font-semibold",
        today: "bg-white/10 text-white rounded-md font-semibold",
        outside:
          "day-outside text-slate-600 aria-selected:bg-[var(--accent-gold)]/10 aria-selected:text-slate-400",
        disabled: "text-slate-700 opacity-50",
        range_middle:
          "aria-selected:bg-[var(--accent-gold)]/10 aria-selected:text-white",
        hidden: "invisible",
        dropdowns: "flex items-center gap-3",
        dropdown:
          "bg-slate-800 text-white border border-white/10 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)] cursor-pointer",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
