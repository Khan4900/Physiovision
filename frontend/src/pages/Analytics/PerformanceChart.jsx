import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { theme } from '../../theme';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 shadow-lg rounded-lg"
        style={{
          backgroundColor: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.light}`,
        }}
      >
        <p className="font-medium mb-2" style={{ color: theme.colors.text.primary }}>
          {label}
        </p>
        <p className="text-sm" style={{ color: theme.colors.primary.green }}>
          Calories: {payload[0].value} kcal
        </p>
        <p className="text-sm" style={{ color: theme.colors.primary.blue }}>
          Duration: {payload[1].value} min
        </p>
      </div>
    );
  }
  return null;
};

const PerformanceChart = ({ data }) => {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.light}`,
      }}
    >
      <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.text.primary }}>
        Weekly Performance
      </h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.light} />
            <XAxis
              dataKey="day"
              stroke={theme.colors.text.secondary}
              tick={{ fill: theme.colors.text.secondary }}
            />
            <YAxis
              stroke={theme.colors.text.secondary}
              tick={{ fill: theme.colors.text.secondary }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span style={{ color: theme.colors.text.secondary }}>{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="calories"
              stroke={theme.colors.primary.green}
              strokeWidth={2}
              dot={{ fill: theme.colors.primary.green, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="duration"
              stroke={theme.colors.primary.blue}
              strokeWidth={2}
              dot={{ fill: theme.colors.primary.blue, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
