"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export function EarningsChart({ data }: { data: { date: string; label: string; earnings: number; orders: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <Tooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              const v = typeof value === "number" ? value : Number(value) || 0;
              return name === "earnings" ? [`${v.toLocaleString("mn-MN")}₮`, "Орлого"] : [v, "Захиалга"];
            }}
          />
          <Bar dataKey="earnings" fill="var(--primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS: Record<string, string> = {
  pending_payment: "oklch(55% 0.2 26)",
  confirmed: "oklch(65% 0.13 150)",
  preparing: "oklch(79% 0.15 75)",
  delivering: "oklch(70% 0.15 230)",
  delivered: "oklch(60% 0.12 150)",
  cancelled: "oklch(72% 0.014 70)",
};

const LABELS: Record<string, string> = {
  pending_payment: "Төлбөр хүлээж",
  confirmed: "Баталгаажсан",
  preparing: "Бэлтгэж байна",
  delivering: "Хүргэлтэнд",
  delivered: "Хүргэгдсэн",
  cancelled: "Цуцлагдсан",
};

export function OrdersStatusChart({ data }: { data: { status: string; count: number }[] }) {
  const chartData = data.filter((d) => d.count > 0).map((d) => ({ name: LABELS[d.status] ?? d.status, value: d.count, color: COLORS[d.status] ?? "var(--muted)" }));
  if (chartData.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">Мэдээлэл байхгүй</p>;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
            {chartData.map((e, i) => (
              <Cell key={i} fill={e.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
