"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { date: "Jan", newUsers: 120, returningUsers: 220 },
  { date: "Feb", newUsers: 150, returningUsers: 240 },
  { date: "Mar", newUsers: 180, returningUsers: 260 },
  { date: "Apr", newUsers: 220, returningUsers: 290 },
  { date: "May", newUsers: 250, returningUsers: 310 },
  { date: "Jun", newUsers: 280, returningUsers: 340 },
  { date: "Jul", newUsers: 310, returningUsers: 360 },
  { date: "Aug", newUsers: 290, returningUsers: 380 },
  { date: "Sep", newUsers: 320, returningUsers: 400 },
  { date: "Oct", newUsers: 350, returningUsers: 420 },
  { date: "Nov", newUsers: 380, returningUsers: 440 },
  { date: "Dec", newUsers: 410, returningUsers: 460 },
]

export default function UsersChart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="newUsers" stroke="#2563eb" strokeWidth={3} />
          <Line type="monotone" dataKey="returningUsers" stroke="#10b981" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
