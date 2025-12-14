"use client";

import { Clock } from "lucide-react";
import { cn } from "@lib/utils";
import Select from "@components/ui/select";
import Label from "@components/ui/label";

interface TimePickerProps {
  value?: string; // formato "HH:MM" (24h)
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  className?: string;
  required?: boolean;
}

export default function TimePicker({
  value,
  onChange,
  id,
  label,
  className,
  required = false,
}: TimePickerProps) {
  // Convertir de 24h a 12h con AM/PM
  const timeToAmPm = (time24?: string) => {
    if (!time24) return { hour: "12", minute: "00", period: "AM" };
    const [hour24, minute] = time24.split(":");
    const h = parseInt(hour24);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return {
      hour: hour12.toString().padStart(2, "0"),
      minute: minute || "00",
      period,
    };
  };

  // Convertir de 12h AM/PM a 24h
  const amPmToTime = (hour: string, minute: string, period: string) => {
    let h = parseInt(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  const current = timeToAmPm(value);

  const handleChange = (
    type: "hour" | "minute" | "period",
    newValue: string
  ) => {
    const updated = { ...current, [type]: newValue };
    onChange(amPmToTime(updated.hour, updated.minute, updated.period));
  };

  // Generar opciones de horas (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return h.toString().padStart(2, "0");
  });

  // Generar opciones de minutos (cada 5 minutos)
  const minutes = Array.from({ length: 12 }, (_, i) => {
    const m = i * 5;
    return m.toString().padStart(2, "0");
  });

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className="text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <Clock className="w-8 h-8 text-slate-400 px-1 mx-3" />

        {/* Hour Select */}
        <Select
          value={current.hour}
          onChange={(e) => handleChange("hour", e.target.value)}
          className="border-0 text-xl bg-transparent p-0 h-auto focus:ring-0 w-16 text-center font-medium text-slate-700 dark:text-slate-200"
          id={id}
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>

        <span className="text-slate-400 font-bold mx-2.5">:</span>

        {/* Minute Select */}
        <Select
          value={current.minute}
          onChange={(e) => handleChange("minute", e.target.value)}
          className="border-0 bg-transparent p-0 h-auto text-xl focus:ring-0 w-16 text-center font-medium text-slate-700 dark:text-slate-200"
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>

        {/* AM/PM Select */}
        <Select
          value={current.period}
          onChange={(e) => handleChange("period", e.target.value)}
          className="border-0 bg-transparent mx-3.5 text-xl p-0 h-auto focus:ring-0 w-16 text-center font-bold text-primary dark:text-blue-400 ml-auto"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </Select>
      </div>
    </div>
  );
}
