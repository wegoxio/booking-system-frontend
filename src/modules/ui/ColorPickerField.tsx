"use client";

import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Droplets } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ColorPickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  presets?: string[];
};

type HsvColor = {
  h: number;
  s: number;
  v: number;
};

const HEX_COLOR_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const DEFAULT_PRESETS = [
  "#dd4040",
  "#efc35f",
  "#2d4680",
  "#3a5a78",
  "#4f6d7a",
  "#6b8f71",
  "#8f6a5a",
  "#b7605d",
  "#2f3543",
  "#5f6470",
  "#c08b5c",
  "#e9e9ed",
];
const HUE_STRIP =
  "linear-gradient(90deg, #ff0000 0%, #ffff00 16.67%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.67%, #ff00ff 83.33%, #ff0000 100%)";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseHexValue(value: string | undefined | null): string | null {
  if (!value) return null;

  const normalized = value.trim();
  const match = HEX_COLOR_REGEX.exec(normalized);
  if (!match) return null;

  const hex = match[1].toLowerCase();
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  return `#${hex}`;
}

function normalizeHex(value: string | undefined | null, fallback = "#000000") {
  return parseHexValue(value) ?? fallback;
}

function hexToRgb(value: string) {
  const hex = normalizeHex(value);
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const channelToHex = (channel: number) =>
    clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0");

  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

function withAlpha(value: string, alpha: number) {
  const { r, g, b } = hexToRgb(value);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getReadableTextColor(background: string) {
  const { r, g, b } = hexToRgb(background);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.64 ? "#0f172a" : "#ffffff";
}

function rgbToHsv(value: string): HsvColor {
  const { r, g, b } = hexToRgb(value);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
  }

  const normalizedHue = Math.round(hue * 60);
  const saturation = max === 0 ? 0 : (delta / max) * 100;
  const valueChannel = max * 100;

  return {
    h: normalizedHue < 0 ? normalizedHue + 360 : normalizedHue,
    s: saturation,
    v: valueChannel,
  };
}

function hsvToHex({ h, s, v }: HsvColor) {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const brightness = clamp(v, 0, 100) / 100;
  const chroma = brightness * saturation;
  const huePrime = hue / 60;
  const secondary = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const match = brightness - chroma;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = secondary;
  } else if (huePrime < 2) {
    red = secondary;
    green = chroma;
  } else if (huePrime < 3) {
    green = chroma;
    blue = secondary;
  } else if (huePrime < 4) {
    green = secondary;
    blue = chroma;
  } else if (huePrime < 5) {
    red = secondary;
    blue = chroma;
  } else {
    red = chroma;
    blue = secondary;
  }

  return rgbToHex((red + match) * 255, (green + match) * 255, (blue + match) * 255);
}

export default function ColorPickerField({
  value,
  onChange,
  disabled = false,
  className = "",
  ariaLabel = "Editar color",
  presets = DEFAULT_PRESETS,
}: ColorPickerFieldProps): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState("");
  const boardRef = useRef<HTMLDivElement | null>(null);

  const normalizedValue = useMemo(() => normalizeHex(value), [value]);
  const currentHsv = useMemo(() => rgbToHsv(normalizedValue), [normalizedValue]);
  const accentTextColor = useMemo(
    () => getReadableTextColor(normalizedValue),
    [normalizedValue],
  );
  const palettePresets = useMemo(
    () => Array.from(new Set(presets.map((preset) => normalizeHex(preset)))),
    [presets],
  );

  useEffect(() => {
    setHexInput(normalizedValue);
  }, [normalizedValue]);

  const commitHexInput = () => {
    const parsed = parseHexValue(hexInput);
    if (!parsed) {
      setHexInput(normalizedValue);
      return;
    }

    onChange(parsed);
    setHexInput(parsed);
  };

  const updateSaturationValue = (clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const saturation = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const valueChannel = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);

    onChange(
      hsvToHex({
        h: currentHsv.h,
        s: saturation,
        v: valueChannel,
      }),
    );
  };

  const handleBoardPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;

    event.preventDefault();
    updateSaturationValue(event.clientX, event.clientY);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateSaturationValue(moveEvent.clientX, moveEvent.clientY);
    };

    const stopTracking = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopTracking);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopTracking);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          disabled={disabled}
          className={`inline-flex w-full items-center gap-3 rounded-2xl border border-card-border bg-surface-soft px-3 py-2.5 text-left transition hover:bg-surface disabled:opacity-60 ${className}`.trim()}
        >
          <span
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[16px] border border-card-border shadow-theme-soft-sm"
            style={{ backgroundColor: normalizedValue }}
          >
            <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.38),transparent_60%)]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Color activo
            </span>
            <span className="mt-1 block truncate text-sm font-semibold text-fg-strong">
              {normalizedValue}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-fg-icon" />
        </button>
      </Popover.Trigger>

      {isOpen ? (
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={10}
            collisionPadding={12}
            className="z-[90] w-[340px] rounded-[26px] border border-card-border bg-surface p-4 shadow-theme-modal"
          >
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  <span>Picker visual</span>
                  <span>
                    S {Math.round(currentHsv.s)}% · V {Math.round(currentHsv.v)}%
                  </span>
                </div>
                <div
                  ref={boardRef}
                  onPointerDown={handleBoardPointerDown}
                  className="relative h-44 w-full cursor-crosshair overflow-hidden rounded-[22px] border border-card-border"
                  style={{
                    backgroundColor: hsvToHex({ h: currentHsv.h, s: 100, v: 100 }),
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff,rgba(255,255,255,0))]" />
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,#000000,rgba(0,0,0,0))]" />
                  <span
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.18)]"
                    style={{
                      left: `${currentHsv.s}%`,
                      top: `${100 - currentHsv.v}%`,
                      backgroundColor: normalizedValue,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-[20px] border border-card-border bg-surface-soft p-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  <span>Tono</span>
                  <span>{Math.round(currentHsv.h)}°</span>
                </div>
                <div className="relative mt-2 h-3">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundImage: HUE_STRIP }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={Math.round(currentHsv.h)}
                    onChange={(event) =>
                      onChange(
                        hsvToHex({
                          h: Number(event.target.value),
                          s: currentHsv.s,
                          v: currentHsv.v,
                        }),
                      )
                    }
                    className="color-picker-range absolute inset-0 h-full w-full appearance-none bg-transparent"
                    aria-label="Ajustar tono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-card-border bg-surface-soft px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Saturacion
                  </p>
                  <p className="mt-1 text-sm font-semibold text-fg-strong">
                    {Math.round(currentHsv.s)}%
                  </p>
                </div>
                <div className="rounded-2xl border border-card-border bg-surface-soft px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Brillo
                  </p>
                  <p className="mt-1 text-sm font-semibold text-fg-strong">
                    {Math.round(currentHsv.v)}%
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  HEX
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-card-border bg-surface-soft px-3">
                  <Droplets className="h-4 w-4 text-fg-placeholder" />
                  <input
                    value={hexInput}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setHexInput(nextValue);

                      const parsed = parseHexValue(nextValue);
                      if (parsed) {
                        onChange(parsed);
                      }
                    }}
                    onBlur={commitHexInput}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitHexInput();
                      }
                    }}
                    placeholder="#000000"
                    spellCheck={false}
                    className="h-11 w-full bg-transparent text-sm font-medium text-fg outline-none placeholder:text-fg-placeholder"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  <span>Presets</span>
                  <span>{palettePresets.length} tonos</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {palettePresets.map((preset) => {
                    const isSelected = preset === normalizedValue;

                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => onChange(preset)}
                        className={`group relative h-10 rounded-2xl border transition ${
                          isSelected
                            ? "border-fg-strong shadow-theme-soft-sm"
                            : "border-card-border hover:border-border-strong"
                        }`}
                        style={{ backgroundColor: preset }}
                        aria-label={`Seleccionar ${preset}`}
                      >
                        <span className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.32),transparent_62%)]" />
                        {isSelected ? (
                          <span className="absolute inset-0 grid place-items-center">
                            <Check
                              className="h-4 w-4"
                              style={{ color: getReadableTextColor(preset) }}
                            />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      ) : null}
    </Popover.Root>
  );
}
