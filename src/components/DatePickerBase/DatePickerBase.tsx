import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  add,
  endOfMonth,
  endOfWeek,
  format,
  isEqual,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"

export type DatePickerBaseProps = {
  value?: Date | null
  onChange?: (d: Date | null) => void
  placeholder?: string
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    width: 320,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
    fontSize: 14,
    color: "rgba(0,0,0,0.88)",
  },
  input: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #d9d9d9",
    borderRadius: 6,
    padding: "4px 12px",
    background: "#fff",
    height: 32,
    cursor: "pointer",
    transition: "border-color .3s, box-shadow .3s",
  },
  inputActive: {
    borderColor: "#4096ff",
    boxShadow: "0 0 0 2px rgba(24, 144, 255, 0.2)",
  },
  value: {
    lineHeight: "22px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  placeholder: {
    color: "rgba(0,0,0,0.25)",
    lineHeight: "22px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  pop: {
    position: "absolute",
    zIndex: 50,
    top: "100%",
    marginTop: 4,
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 8,
    width: 304,
    boxShadow: "0 6px 16px rgba(0,0,0,.08)",
    padding: "16px 12px 12px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    padding: "0 8px",
    fontWeight: 500,
    gap: 4,
  },
  headerLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    color: "rgba(0,0,0,0.88)",
  },
  iconButton: {
    width: 24,
    height: 24,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    color: "rgba(0,0,0,0.45)",
    borderRadius: 4,
    cursor: "pointer",
    transition: "background-color .2s, color .2s",
    padding: 0,
    fontSize: 12,
    lineHeight: "24px",
  },
  iconGlyph: {
    display: "inline-block",
    width: "100%",
    textAlign: "center",
    lineHeight: "24px",
  },
  gridHead: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    marginBottom: 8,
    padding: "0 8px",
    fontSize: 12,
    color: "rgba(0,0,0,0.45)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    columnGap: 8,
    rowGap: 8,
    padding: "0 8px",
  },
  dayBtn: {
    width: "100%",
    height: 32,
    padding: 0,
    border: "none",
    background: "transparent",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    lineHeight: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(0,0,0,0.88)",
    transition:
      "background-color .2s, color .2s, border-color .2s, box-shadow .2s",
  },
  footer: {
    borderTop: "1px solid #f0f0f0",
    marginTop: 12,
    paddingTop: 12,
    textAlign: "center",
    color: "#1677ff",
    cursor: "pointer",
    fontWeight: 600,
  },
  suffix: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "rgba(0,0,0,0.45)",
  },
  field: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
  },
  clearButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.06)",
    color: "rgba(0,0,0,0.45)",
    cursor: "pointer",
    fontSize: 12,
    transition: "background-color .2s, color .2s",
  },
}

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function monthMatrix(anchor: Date) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 })
  const days: Date[] = []
  let cur = start
  while (cur <= end) {
    days.push(cur)
    cur = add(cur, { days: 1 })
  }
  return days
}

export const DatePickerBase: React.FC<DatePickerBaseProps> = ({
  value = null,
  onChange,
  placeholder = "Select date",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [panelMonth, setPanelMonth] = useState<Date>(value ?? new Date())

  const days = useMemo(() => monthMatrix(panelMonth), [panelMonth])

  useEffect(() => {
    if (value) {
      setPanelMonth(value)
    }
  }, [value])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [open])

  const pick = (d: Date) => {
    onChange?.(d)
    setOpen(false)
  }

  const handleIconHover = (
    event: React.MouseEvent<HTMLButtonElement>,
    hovering: boolean,
  ) => {
    event.currentTarget.style.backgroundColor = hovering
      ? "rgba(64,150,255,0.08)"
      : "transparent"
    event.currentTarget.style.color = hovering
      ? "#1677ff"
      : "rgba(0,0,0,0.45)"
  }

  const today = new Date()
  const highlighted = open || focused
  const formattedValue = value ? format(value, "yyyy-MM-dd") : ""
  const valueLabel = formattedValue || undefined

  return (
    <div ref={containerRef} style={styles.container}>
      <div
        role="combobox"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Date picker"
        aria-valuetext={valueLabel}
        style={{
          ...styles.input,
          ...(highlighted ? styles.inputActive : {}),
        }}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          const next = event.relatedTarget as Node | null
          if (!containerRef.current || !next) {
            setFocused(false)
            return
          }
          if (!containerRef.current.contains(next)) {
            setFocused(false)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setOpen((v) => !v)
          }
          if (event.key === "Escape") {
            setOpen(false)
          }
        }}
      >
        <span style={styles.suffix} aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 1024 1024"
            fill="currentColor"
          >
            <path d="M928 160h-64V96a32 32 0 1 0-64 0v64H224V96a32 32 0 1 0-64 0v64H96a32 32 0 0 0-32 32v672a64 64 0 0 0 64 64h768a64 64 0 0 0 64-64V192a32 32 0 0 0-32-32ZM160 224v96h704v-96h32v192H128V224h32Zm704 608H160a32 32 0 0 1-32-32V448h768v352a32 32 0 0 1-32 32Z" />
          </svg>
        </span>
        <div style={styles.field}>
          {formattedValue ? (
            <span style={styles.value}>{formattedValue}</span>
          ) : (
            <span style={styles.placeholder}>{placeholder}</span>
          )}
        </div>
        <div style={styles.suffix}>
          {value && (
            <button
              type="button"
              style={styles.clearButton}
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.stopPropagation()
                onChange?.(null)
              }}
              aria-label="clear date"
            >
              ×
            </button>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 1024 1024"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="m512 672 320-320-60.8-60.8L512 550.4 252.8 291.2 192 352z" />
          </svg>
        </div>
      </div>

      {open && (
        <div style={styles.pop}>
          <div style={styles.header}>
            <button
              type="button"
              style={styles.iconButton}
              onMouseEnter={(event) => handleIconHover(event, true)}
              onMouseLeave={(event) => handleIconHover(event, false)}
              onClick={() => setPanelMonth(add(panelMonth, { years: -1 }))}
              aria-label="previous year"
            >
              <span style={styles.iconGlyph}>«</span>
            </button>
            <button
              type="button"
              style={styles.iconButton}
              onMouseEnter={(event) => handleIconHover(event, true)}
              onMouseLeave={(event) => handleIconHover(event, false)}
              onClick={() => setPanelMonth(add(panelMonth, { months: -1 }))}
              aria-label="previous month"
            >
              <span style={styles.iconGlyph}>‹</span>
            </button>
            <div style={styles.headerLabel}>{format(panelMonth, "MMMM yyyy")}</div>
            <button
              type="button"
              style={styles.iconButton}
              onMouseEnter={(event) => handleIconHover(event, true)}
              onMouseLeave={(event) => handleIconHover(event, false)}
              onClick={() => setPanelMonth(add(panelMonth, { months: 1 }))}
              aria-label="next month"
            >
              <span style={styles.iconGlyph}>›</span>
            </button>
            <button
              type="button"
              style={styles.iconButton}
              onMouseEnter={(event) => handleIconHover(event, true)}
              onMouseLeave={(event) => handleIconHover(event, false)}
              onClick={() => setPanelMonth(add(panelMonth, { years: 1 }))}
              aria-label="next year"
            >
              <span style={styles.iconGlyph}>»</span>
            </button>
          </div>

          <div style={styles.gridHead}>
            {weekDays.map((d) => (
              <div key={d} style={{ textAlign: "center" }}>
                {d}
              </div>
            ))}
          </div>

          <div style={styles.grid}>
            {days.map((d, i) => {
              const inMonth = isSameMonth(d, panelMonth)
              const isSelected = !!value && isEqual(d, value)
              const isToday = isSameDay(d, today)
              const baseBtnStyle = {
                ...styles.dayBtn,
                backgroundColor: isSelected ? "#1677ff" : "transparent",
                color: isSelected
                  ? "#fff"
                  : inMonth
                    ? "rgba(0,0,0,0.88)"
                    : "rgba(0,0,0,0.25)",
                boxShadow: isToday && !isSelected ? "inset 0 0 0 1px #4096ff" : "none",
              } satisfies React.CSSProperties
              return (
                <button
                  key={i}
                  onClick={() => pick(new Date(d))}
                  style={baseBtnStyle}
                  onMouseEnter={(event) => {
                    if (!isSelected) {
                      event.currentTarget.style.backgroundColor =
                        "rgba(64,150,255,0.1)"
                      event.currentTarget.style.color = "rgba(0,0,0,0.88)"
                    }
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor =
                      baseBtnStyle.backgroundColor as string
                    event.currentTarget.style.color = baseBtnStyle.color as string
                  }}
                >
                  {format(d, "d")}
                </button>
              )
            })}
          </div>

          <div
            style={styles.footer}
            onClick={() => {
              const n = new Date()
              setPanelMonth(n)
              onChange?.(n)
              setOpen(false)
            }}
          >
            Today
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePickerBase
