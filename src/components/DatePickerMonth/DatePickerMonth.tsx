import React, { useEffect, useMemo, useRef, useState } from "react"
import { format, isSameMonth, setMonth, setYear, startOfMonth } from "date-fns"

export type DatePickerMonthProps = {
  value?: Date | null
  onChange?: (month: Date | null) => void
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
    border: "1px solid #d9d9d9",
    borderRadius: 6,
    padding: "4px 12px",
    background: "#fff",
    height: 32,
    cursor: "pointer",
    transition: "border-color .3s, box-shadow .3s",
    gap: 8,
  },
  inputActive: {
    borderColor: "#4096ff",
    boxShadow: "0 0 0 2px rgba(24, 144, 255, 0.2)",
  },
  icon: {
    color: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
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
  suffix: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "rgba(0,0,0,0.45)",
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
  pop: {
    position: "absolute",
    zIndex: 60,
    top: "100%",
    marginTop: 4,
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 8,
    width: 280,
    boxShadow: "0 6px 16px rgba(0,0,0,.08)",
    padding: 16,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    fontWeight: 500,
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  monthBtn: {
    border: "none",
    borderRadius: 6,
    background: "transparent",
    cursor: "pointer",
    height: 36,
    fontSize: 14,
    color: "rgba(0,0,0,0.88)",
    transition:
      "background-color .2s, color .2s, box-shadow .2s, border-color .2s",
  },
}

const monthIndexes = Array.from({ length: 12 }, (_, idx) => idx)

export const DatePickerMonth: React.FC<DatePickerMonthProps> = ({
  value = null,
  onChange,
  placeholder = "Select month",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [panelYear, setPanelYear] = useState(
    value ? value.getFullYear() : new Date().getFullYear()
  )
  const [hovering, setHovering] = useState<number | null>(null)

  useEffect(() => {
    if (value) {
      setPanelYear(value.getFullYear())
    }
  }, [value])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        setHovering(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const months = useMemo(() => {
    const base = setYear(startOfMonth(new Date()), panelYear)
    return monthIndexes.map((monthIndex) => setMonth(base, monthIndex))
  }, [panelYear])

  const formattedValue = value ? format(value, "MMMM yyyy") : ""

  const handleIconHover = (
    event: React.MouseEvent<HTMLButtonElement>,
    hoveringButton: boolean
  ) => {
    event.currentTarget.style.backgroundColor = hoveringButton
      ? "rgba(64,150,255,0.08)"
      : "transparent"
    event.currentTarget.style.color = hoveringButton
      ? "#1677ff"
      : "rgba(0,0,0,0.45)"
  }

  const selectMonth = (monthDate: Date) => {
    onChange?.(startOfMonth(monthDate))
    setOpen(false)
    setHovering(null)
  }

  return (
    <div ref={containerRef} style={styles.container}>
      <div
        role="combobox"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Month picker"
        style={{
          ...styles.input,
          ...(open ? styles.inputActive : {}),
        }}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setOpen((prev) => !prev)
          }
          if (event.key === "Escape") {
            setOpen(false)
            setHovering(null)
          }
        }}
      >
        <span style={styles.icon} aria-hidden="true">
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
                setHovering(null)
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = "rgba(0,0,0,0.12)"
                event.currentTarget.style.color = "rgba(0,0,0,0.65)"
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)"
                event.currentTarget.style.color = "rgba(0,0,0,0.45)"
              }}
              aria-label="clear month"
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
              onClick={() => setPanelYear((year) => year - 1)}
              aria-label="previous year"
            >
              «
            </button>
            <div style={styles.headerLabel}>{panelYear}</div>
            <button
              type="button"
              style={styles.iconButton}
              onMouseEnter={(event) => handleIconHover(event, true)}
              onMouseLeave={(event) => handleIconHover(event, false)}
              onClick={() => setPanelYear((year) => year + 1)}
              aria-label="next year"
            >
              »
            </button>
          </div>

          <div style={styles.grid}>
            {months.map((monthDate, index) => {
              const selected = value ? isSameMonth(monthDate, value) : false
              const hovered = hovering === index
              const baseStyle: React.CSSProperties = {
                ...styles.monthBtn,
                backgroundColor: selected
                  ? "#1677ff"
                  : hovered
                  ? "rgba(64,150,255,0.12)"
                  : "transparent",
                color: selected ? "#fff" : "rgba(0,0,0,0.88)",
              }
              return (
                <button
                  key={index}
                  type="button"
                  style={baseStyle}
                  onMouseEnter={() => setHovering(index)}
                  onMouseLeave={() => setHovering(null)}
                  onClick={() => selectMonth(monthDate)}
                >
                  {format(monthDate, "MMM")}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePickerMonth
