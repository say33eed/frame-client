
"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type Option = {
  value: string;
  label: string;
};

type FrameSelectProps = {
  id?: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export default function FrameSelect({
  id,
  label,
  value,
  onValueChange,
  options,
  disabled = false,
  required = false,
  placeholder = "Select an option",
  className = "",
}: FrameSelectProps) {
  const generatedId = useId();

  const triggerId = id ?? `frame-select-${generatedId}`;
  const listId = `${triggerId}-options`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const optionRefs = useRef<
    Array<HTMLButtonElement | null>
  >([]);

  const selectedIndex = options.findIndex(
    (option) => option.value === value
  );

  const selected =
    selectedIndex >= 0
      ? options[selectedIndex]
      : undefined;

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (
        !rootRef.current?.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener(
      "pointerdown",
      onPointerDown
    );

    document.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      document.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [open]);

  // Focus the active option.
  useEffect(() => {
    if (open) {
      optionRefs.current[activeIndex]?.focus();
    }
  }, [open, activeIndex]);

  function openAt(index: number) {
    if (disabled || options.length === 0) return;

    setActiveIndex(
      Math.max(
        0,
        Math.min(options.length - 1, index)
      )
    );

    setOpen(true);
  }

  function choose(option: Option) {
    onValueChange(option.value);
    setOpen(false);

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  function handleListKeyDown(
    event: KeyboardEvent<HTMLDivElement>
  ) {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      setActiveIndex((index) => {
        const direction =
          event.key === "ArrowDown" ? 1 : -1;

        return (
          (index + direction + options.length) %
          options.length
        );
      });
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={`relative min-w-0 ${className}`}
    >
      {/* Dropdown trigger */}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openAt(
              selectedIndex >= 0
                ? selectedIndex
                : 0
            );
          }
        }}
        onKeyDown={(event) => {
          if (
            !open &&
            [
              "ArrowDown",
              "ArrowUp",
              " ",
              "Enter",
            ].includes(event.key)
          ) {
            event.preventDefault();

            openAt(
              selectedIndex >= 0
                ? selectedIndex
                : 0
            );
          }
        }}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 text-left text-sm font-medium text-neutral-950 transition-colors duration-200 hover:bg-neutral-100 focus-visible:border-[#E60023] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#242426] dark:text-white dark:hover:bg-[#303033] ${open
            ? "border-[#E60023]"
            : "border-neutral-300 dark:border-white/20"
          }`}
      >
        <span
          className={`truncate ${!selected
              ? "text-neutral-500 dark:text-neutral-400"
              : ""
            }`}
        >
          {selected?.label ?? placeholder}
        </span>

        <ChevronDown
          size={17}
          aria-hidden="true"
          className={`shrink-0 text-neutral-500 transition-transform duration-200 dark:text-neutral-400 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Dropdown options */}
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          aria-required={required || undefined}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={handleListKeyDown}
          className="
            absolute left-0 right-0
            top-[calc(100%+8px)]
            z-[120]
            flex max-h-72 flex-col
            gap-2
            overflow-y-auto
            overscroll-contain
            rounded-2xl
            border border-neutral-200
            bg-white
            p-2
            shadow-xl shadow-black/10
            dark:border-white/15
            dark:bg-[#242426]
            dark:shadow-black/30
          "
        >
          {options.map((option, index) => {
            const chosen = option.value === value;

            return (
              <button
                key={option.value}
                id={`${listId}-${index}`}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                aria-selected={chosen}
                type="button"
                tabIndex={
                  index === activeIndex ? 0 : -1
                }
                onMouseEnter={() => {
                  setActiveIndex(index);
                }}
                onClick={() => choose(option)}
                className={`flex min-h-11 w-full shrink-0 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors duration-200 focus-visible:outline-none ${chosen
                    ? "bg-[#F4CDD3] text-neutral-950 dark:bg-[#49151C] dark:text-white"
                    : "text-neutral-800 hover:bg-[#E8E8EB] focus:bg-[#E8E8EB] dark:text-neutral-100 dark:hover:bg-white/10 dark:focus:bg-white/10"
                  }`}
              >
                <span>{option.label}</span>

                {chosen && (
                  <Check
                    size={16}
                    className="shrink-0 text-[#E60023] dark:text-red-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
