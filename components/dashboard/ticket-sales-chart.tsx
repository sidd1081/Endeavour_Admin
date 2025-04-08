"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "Jan", Revenue: 4200 },
  { date: "Feb", Revenue: 4800 },
  { date: "Mar", Revenue: 5400 },
  { date: "Apr", Revenue: 6200 },
  { date: "May", Revenue: 7100 },
  { date: "Jun", Revenue: 8200 },
  { date: "Jul", Revenue: 9100 },
  { date: "Aug", Revenue: 8700 },
  { date: "Sep", Revenue: 9400 },
  { date: "Oct", Revenue: 10200 },
  { date: "Nov", Revenue: 11100 },
  { date: "Dec", Revenue: 12300 },
]

export default function TicketSalesChart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="Revenue" stroke="#8b5cf6" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
