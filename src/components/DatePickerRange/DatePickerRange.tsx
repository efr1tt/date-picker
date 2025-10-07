import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  add,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns"

export type DatePickerRangeProps = {
  value?: [Date | null, Date | null]
  onChange?: (range: [Date | null, Date | null]) => void
  placeholder?: [string, string]
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
  icon: {
    color: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  divider: {
    width: 1,
    height: 16,
    background: "#d9d9d9",
    margin: "0 6px",
  },
  separator: {
    color: "rgba(0,0,0,0.25)",
    fontSize: 12,
    textAlign: "center",
  },
  pop: {
    position: "absolute",
    zIndex: 60,
    top: "100%",
    marginTop: 4,
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 8,
    width: 640,
    boxShadow: "0 6px 16px rgba(0,0,0,.08)",
    padding: "16px 12px 12px",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
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
    transition:
      "background-color .2s, color .2s, border-color .2s, box-shadow .2s",
  },
  footer: {
    gridColumn: "1 / span 2",
    borderTop: "1px solid #f0f0f0",
    marginTop: 12,
    paddingTop: 12,
    textAlign: "center",
    color: "#1677ff",
    cursor: "pointer",
    fontWeight: 600,
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

export const DatePickerRange: React.FC<DatePickerRangeProps> = ({
  value = [null, null],
  onChange,
  placeholder = ["Start date", "End date"],
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [panelMonth, setPanelMonth] = useState<Date>(value[0] ?? new Date())

  const [draftRange, setDraftRange] =
    useState<[Date | null, Date | null]>(value)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const firstMonth = useMemo(() => add(panelMonth, { months: 0 }), [panelMonth])
  const secondMonth = useMemo(
    () => add(panelMonth, { months: 1 }),
    [panelMonth]
  )

  const firstMatrix = useMemo(() => monthMatrix(firstMonth), [firstMonth])
  const secondMatrix = useMemo(() => monthMatrix(secondMonth), [secondMonth])

  useEffect(() => {
    setDraftRange(value)
    setHoverDate(null)
    if (value[0]) {
      setPanelMonth(value[0])
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
        setDraftRange(value)
        setHoverDate(null)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [open, value])

  const handleIconHover = (
    event: React.MouseEvent<HTMLButtonElement>,
    hovering: boolean
  ) => {
    event.currentTarget.style.backgroundColor = hovering
      ? "rgba(64,150,255,0.08)"
      : "transparent"
    event.currentTarget.style.color = hovering ? "#1677ff" : "rgba(0,0,0,0.45)"
  }

  const pickDay = (date: Date) => {
    let [start, end] = draftRange
    if (!start || (start && end)) {
      start = date
      end = null
      setDraftRange([start, end])
      setHoverDate(null)
      return
    }
    if (!end) {
      if (isBefore(date, start)) {
        end = start
        start = date
      } else {
        end = date
      }
      const nextRange: [Date, Date] = [start, end]
      setDraftRange(nextRange)
      onChange?.(nextRange)
      setOpen(false)
      setHoverDate(null)
    }
  }

  const applyToday = () => {
    const today = new Date()
    const range: [Date, Date] = [today, today]
    setDraftRange(range)
    onChange?.(range)
    setPanelMonth(today)
    setOpen(false)
    setHoverDate(null)
  }

  const renderGrid = (matrix: Date[], month: Date) => {
    const [start, end] = draftRange
    const today = new Date()
    let previewInterval: { start: Date; end: Date } | null = null
    if (start && end) {
      previewInterval =
        isBefore(start, end) || isSameDay(start, end)
          ? { start, end }
          : { start: end, end: start }
    } else if (start && hoverDate) {
      previewInterval = isBefore(hoverDate, start)
        ? { start: hoverDate, end: start }
        : { start, end: hoverDate }
    }
    return (
      <>
        <div style={styles.gridHead}>
          {weekDays.map((d) => (
            <div key={d} style={{ textAlign: "center" }}>
              {d}
            </div>
          ))}
        </div>
        <div style={styles.grid}>
          {matrix.map((d, index) => {
            const inMonth = isSameMonth(d, month)
            const isStart = start ? isSameDay(d, start) : false
            const isEnd = end ? isSameDay(d, end) : false
            const isBetween =
              previewInterval && start
                ? isWithinInterval(d, previewInterval)
                : false
            const isRange = isBetween && !isStart && !isEnd

            const baseColor = inMonth ? "rgba(0,0,0,0.88)" : "rgba(0,0,0,0.25)"

            const baseBtnStyle = {
              ...styles.dayBtn,
              backgroundColor: isRange
                ? "rgba(64,150,255,0.12)"
                : isStart || isEnd
                ? "#1677ff"
                : "transparent",
              color:
                isStart || isEnd
                  ? "#fff"
                  : isRange
                  ? "rgba(0,0,0,0.88)"
                  : baseColor,
              borderRadius:
                isStart && isEnd
                  ? 4
                  : isStart
                  ? "4px 0 0 4px"
                  : isEnd
                  ? "0 4px 4px 0"
                  : 4,
              boxShadow: isSameDay(d, today)
                ? "inset 0 0 0 1px #4096ff"
                : "none",
            } satisfies React.CSSProperties

            return (
              <button
                key={index}
                style={baseBtnStyle}
                onClick={() => pickDay(new Date(d))}
                onMouseEnter={(event) => {
                  if (start && !end) {
                    setHoverDate(new Date(d))
                  }
                  if (!isStart && !isEnd) {
                    event.currentTarget.style.backgroundColor =
                      "rgba(64,150,255,0.16)"
                    event.currentTarget.style.color = "rgba(0,0,0,0.88)"
                  }
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor =
                    baseBtnStyle.backgroundColor as string
                  event.currentTarget.style.color = baseBtnStyle.color as string
                  if (start && !end) {
                    setHoverDate(null)
                  }
                }}
              >
                {format(d, "d")}
              </button>
            )
          })}
        </div>
      </>
    )
  }

  const formattedStart = draftRange[0]
    ? format(draftRange[0], "yyyy-MM-dd")
    : ""
  const formattedEnd = draftRange[1] ? format(draftRange[1], "yyyy-MM-dd") : ""

  const openPanel = () => {
    setOpen(true)
    setHoverDate(null)
  }

  return (
    <div ref={containerRef} style={styles.container}>
      <div
        role="group"
        tabIndex={0}
        style={{
          ...styles.input,
          ...(open ? styles.inputActive : {}),
        }}
        onClick={() => (open ? setOpen(false) : openPanel())}
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
          {formattedStart ? (
            <span style={styles.value}>{formattedStart}</span>
          ) : (
            <span style={styles.placeholder}>{placeholder[0]}</span>
          )}
        </div>
        <span style={styles.separator}>→</span>
        <div style={styles.field}>
          {formattedEnd ? (
            <span style={styles.value}>{formattedEnd}</span>
          ) : (
            <span style={styles.placeholder}>{placeholder[1]}</span>
          )}
        </div>
        <span style={styles.divider} aria-hidden="true" />
        <div
          style={styles.suffix}
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          {formattedStart || formattedEnd ? (
            <button
              type="button"
              style={styles.clearButton}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setDraftRange([null, null])
                setHoverDate(null)
                onChange?.([null, null])
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = "rgba(0,0,0,0.12)"
                event.currentTarget.style.color = "rgba(0,0,0,0.65)"
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)"
                event.currentTarget.style.color = "rgba(0,0,0,0.45)"
              }}
              aria-label="clear range"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
      {open && (
        <div style={styles.pop}>
          {/* Left month */}
          <div>
            <div style={styles.header}>
              <button
                type="button"
                style={styles.iconButton}
                onMouseEnter={(event) => handleIconHover(event, true)}
                onMouseLeave={(event) => handleIconHover(event, false)}
                onClick={() => {
                  setPanelMonth(add(panelMonth, { years: -1 }))
                }}
                aria-label="previous year"
              >
                <span style={styles.iconGlyph}>«</span>
              </button>
              <button
                type="button"
                style={styles.iconButton}
                onMouseEnter={(event) => handleIconHover(event, true)}
                onMouseLeave={(event) => handleIconHover(event, false)}
                onClick={() => {
                  setPanelMonth(add(panelMonth, { months: -1 }))
                }}
                aria-label="previous month"
              >
                <span style={styles.iconGlyph}>‹</span>
              </button>
              <div style={styles.headerLabel}>
                {format(firstMonth, "MMMM yyyy")}
              </div>
            </div>
            {renderGrid(firstMatrix, firstMonth)}
          </div>

          {/* Right month */}
          <div>
            <div style={styles.header}>
              <div style={{ flex: 1, textAlign: "center" }}>
                {format(secondMonth, "MMMM yyyy")}
              </div>
              <button
                type="button"
                style={styles.iconButton}
                onMouseEnter={(event) => handleIconHover(event, true)}
                onMouseLeave={(event) => handleIconHover(event, false)}
                onClick={() => {
                  setPanelMonth(add(panelMonth, { months: 1 }))
                }}
                aria-label="next month"
              >
                <span style={styles.iconGlyph}>›</span>
              </button>
              <button
                type="button"
                style={styles.iconButton}
                onMouseEnter={(event) => handleIconHover(event, true)}
                onMouseLeave={(event) => handleIconHover(event, false)}
                onClick={() => {
                  setPanelMonth(add(panelMonth, { years: 1 }))
                }}
                aria-label="next year"
              >
                <span style={styles.iconGlyph}>»</span>
              </button>
            </div>
            {renderGrid(secondMatrix, secondMonth)}
          </div>

          <div style={styles.footer} onClick={applyToday}>
            Today
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePickerRange
