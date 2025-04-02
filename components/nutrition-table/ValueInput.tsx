"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface ValueInputProps {
  item: {
    id: string;
    value: string;
    unit: string;
  };
  updateItemValue: (id: string, value: string) => void;
  isActive: boolean;
  setActive: (active: boolean) => void;
}

export function ValueInput({
  item,
  updateItemValue,
  isActive,
  setActive,
}: ValueInputProps) {
  const [localValue, setLocalValue] = useState(item.value || "");
  const [displayValue, setDisplayValue] = useState(
    (item.value || "").replace(".", ",")
  );
  const [isValid, setIsValid] = useState(true);
  const valueInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(item.value || "");
    setDisplayValue((item.value || "").replace(".", ","));
  }, [item.value]);

  useEffect(() => {
    if (isActive && valueInputRef.current) {
      valueInputRef.current.focus();
    }
  }, [isActive]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const inputValue = e.target.value;

    if (inputValue.length > 5) return;

    if (inputValue === "" || /^(\d*)(,|\.)?(\d*)$/.test(inputValue)) {
      const internalValue = inputValue.replace(",", ".");

      setLocalValue(internalValue);
      setDisplayValue(inputValue);
      setIsValid(true);

      // update in real-time
      updateItemValue(item.id, internalValue);
    } else {
      setIsValid(false);
    }
  };

  const handleValueBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);

    if (!isValid) {
      setLocalValue(item.value || "");
      setDisplayValue((item.value || "").replace(".", ","));
    }
  };

  const handleValueClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      valueInputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-24" onClick={(e) => e.stopPropagation()}>
      <Input
        ref={valueInputRef}
        type="text"
        placeholder="Valor"
        value={displayValue}
        onChange={handleValueChange}
        onBlur={handleValueBlur}
        onClick={handleValueClick}
        onFocus={() => setActive(true)}
        onKeyDown={handleKeyDown}
        className={`h-7 w-full pl-2 pr-8 text-sm border-primary/20 focus-visible:ring-primary/20 ${
          isValid ? "" : "border-red-500"
        }`}
        inputMode="decimal"
        maxLength={5}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary/60 pointer-events-none">
        {item.unit}
      </span>
    </div>
  );
}
