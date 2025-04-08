"use client"

import type * as React from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ChartContainerProps {
  children: React.ReactNode
  data: any[]
  className?: string
}

export function ChartContainer({ children, data, className }: ChartContainerProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

interface ChartProps {
  type: "line" | "bar" | "pie"
  dataKey: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  startEndOnly?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
  layout?: "horizontal" | "vertical"
  children: React.ReactNode
  data: any[] // Add this line to include the data prop
}

export function Chart({
  type,
  dataKey,
  categories,
  colors,
  valueFormatter,
  startEndOnly,
  showXAxis,
  showYAxis,
  showGridLines,
  layout = "horizontal",
  children,
  data, // Add this line to destructure the data prop
}: ChartProps) {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            {showXAxis && <XAxis dataKey={dataKey} />}
            {showYAxis && <YAxis />}
            <RechartsTooltip formatter={(value: number) => (valueFormatter ? [valueFormatter(value)] : [value])} />
            <Legend />
            {categories.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={colors[index % colors.length]}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        )
      case "bar":
        return (
          <BarChart data={data} layout={layout}>
            <CartesianGrid strokeDasharray="3 3" />
            {showXAxis && <XAxis dataKey={dataKey} />}
            {showYAxis && <YAxis />}
            <RechartsTooltip formatter={(value: number) => (valueFormatter ? [valueFormatter(value)] : [value])} />
            <Legend />
            {categories.map((category, index) => (
              <Bar key={category} dataKey={category} fill={colors[index % colors.length]} />
            ))}
          </BarChart>
        )
      case "pie":
        return (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey={dataKey} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value: number) => (valueFormatter ? [valueFormatter(value)] : [value])} />
            <Legend />
          </PieChart>
        )
      default:
        return null
    }
  }

  return renderChart()
}

export const ChartLine = Line
export const ChartTooltipContent = RechartsTooltip
export const ChartLegendContent = Legend
export const ChartLegend = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ChartTooltip = ({ children }: { children: React.ReactNode }) => <>{children}</>

