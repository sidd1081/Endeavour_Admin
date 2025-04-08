"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const data = [
  { name: "Treasure Hunt", value: 1200 },
  { name: "B Plan", value: 900 },
  { name: "B Quiz", value: 800 },
  { name: "Innovate Hackathon", value: 600 },
  { name: "Esports", value: 500 },
]

export default function PopularEventsChart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={120} />
          <Tooltip formatter={(value) => `${value} tickets`} />
          <Bar dataKey="value" fill="#f59e0b" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
