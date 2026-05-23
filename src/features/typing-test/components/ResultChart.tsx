"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TypingSample } from "../hooks/useTypingEngine";

interface Props {
  samples: TypingSample[];
}

export function ResultChart({ samples }: Props) {
  const data = samples.map((s, idx, arr) => {
    const window = arr.slice(Math.max(0, idx - 4), idx + 1);
    const avgWpm =
      window.reduce((sum, w) => sum + w.wpm, 0) / Math.max(1, window.length);
    return {
      second: s.second,
      rawWpm: s.rawWpm,
      wpm: s.wpm,
      avgWpm: Math.round(avgWpm),
      errors: s.errors > 0 ? s.errors : null,
    };
  });

  const maxErrors = Math.max(1, ...samples.map((s) => s.errors));

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <XAxis
            dataKey="second"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="wpm"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Words per Minute",
              angle: -90,
              position: "insideLeft",
              style: { fill: "rgba(255,255,255,0.4)", fontSize: 11 },
            }}
          />
          <YAxis
            yAxisId="errors"
            orientation="right"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={[0, maxErrors]}
            allowDecimals={false}
            label={{
              value: "Errors",
              angle: 90,
              position: "insideRight",
              style: { fill: "rgba(255,255,255,0.4)", fontSize: 11 },
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            formatter={(value, name) => {
              if (value === null || value === undefined) return ["—", name];
              return [value as number, name];
            }}
            labelFormatter={(label) => `${label}s`}
          />
          <Line
            yAxisId="wpm"
            type="monotone"
            dataKey="rawWpm"
            name="raw"
            stroke="rgba(180,180,180,0.85)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="wpm"
            type="monotone"
            dataKey="avgWpm"
            name="avg"
            stroke="#eab308"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="wpm"
            type="monotone"
            dataKey="wpm"
            name="wpm"
            stroke="#facc15"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Scatter
            yAxisId="errors"
            dataKey="errors"
            name="errors"
            fill="#ef4444"
            shape="cross"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
