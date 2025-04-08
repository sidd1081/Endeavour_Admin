"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

const data = [
  { date: "Jan", Teams: 8 },
  { date: "Feb", Teams: 12 },
  { date: "Mar", Teams: 15 },
  { date: "Apr", Teams: 18 },
  { date: "May", Teams: 22 },
  { date: "Jun", Teams: 27 },
  { date: "Jul", Teams: 32 },
  { date: "Aug", Teams: 36 },
  { date: "Sep", Teams: 42 },
  { date: "Oct", Teams: 48 },
  { date: "Nov", Teams: 52 },
  { date: "Dec", Teams: 58 },
]

export default function TeamsChart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `${value} teams`} />
          <Legend />
          <Bar dataKey="Teams" fill="#ec4899" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
