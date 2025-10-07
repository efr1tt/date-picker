import { useState } from "react"
import DatePickerBase from "./components/DatePickerBase"
import DatePickerRange from "./components/DatePickerRange"
import DatePickerMonth from "./components/DatePickerMonth"

export default function App() {
  const [value, setValue] = useState<Date | null>(null)
  const [rangeValue, setRangeValue] = useState<[Date | null, Date | null]>([
    null,
    null,
  ])
  const [monthValue, setMonthValue] = useState<Date | null>(null)

  return (
    <main
      style={{
        padding: "48px 24px",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <h2
        style={{
          margin: "0 auto 32px",
          maxWidth: 1200,
          color: "rgba(0,0,0,0.88)",
        }}
      >
        Date Pickers
      </h2>
      <div
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <article
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 16px rgba(15,23,42,0.08)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 180,
          }}
        >
          <header>
            <h3 style={{ margin: 0, fontSize: 18, color: "rgba(0,0,0,0.88)" }}>
              DatePickerBase
            </h3>
            <p style={{ margin: "4px 0 0", color: "rgba(0,0,0,0.7)" }}>
              Базовый одиночный календарь
            </p>
          </header>
          <DatePickerBase
            value={value}
            onChange={setValue}
            placeholder="Select date"
          />
        </article>
        <article
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 16px rgba(15,23,42,0.08)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 180,
          }}
        >
          <header>
            <h3 style={{ margin: 0, fontSize: 18, color: "rgba(0,0,0,0.88)" }}>
              DatePickerRange
            </h3>
            <p style={{ margin: "4px 0 0", color: "rgba(0,0,0,0.7)" }}>
              Диапазон дат
            </p>
          </header>
          <DatePickerRange
            value={rangeValue}
            onChange={setRangeValue}
            placeholder={["Start date", "End date"]}
          />
        </article>
        <article
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 16px rgba(15,23,42,0.08)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 180,
          }}
        >
          <header>
            <h3 style={{ margin: 0, fontSize: 18, color: "rgba(0,0,0,0.88)" }}>
              DatePickerMonth
            </h3>
            <p style={{ margin: "4px 0 0", color: "rgba(0,0,0,0.7)" }}>
              Выбор месяца
            </p>
          </header>
          <DatePickerMonth
            value={monthValue}
            onChange={setMonthValue}
            placeholder="Select month"
          />
        </article>
      </div>
    </main>
  )
}
