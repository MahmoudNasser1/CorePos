'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CHART_HEIGHT_CLASS = 'h-[280px]';

const EMPTY_MSG = 'لا بيانات للفلتر المختار — غيّر نطاق التاريخ';

function ChartEmpty() {
  return (
    <div
      className={`flex ${CHART_HEIGHT_CLASS} w-full items-center justify-center rounded-md border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground`}
    >
      {EMPTY_MSG}
    </div>
  );
}

interface ChartProps {
  title: string;
  data: any[];
  dataKey: string;
  xKey: string;
}

export function RevenueTrendChart({ title, data, dataKey, xKey }: ChartProps) {
  const rows = Array.isArray(data) ? data : [];
  const manyTicks = rows.length > 12;

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <ChartEmpty />
        ) : (
          <div className={`${CHART_HEIGHT_CLASS} w-full`} dir="rtl">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 12, bottom: manyTicks ? 28 : 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8882" />
                <XAxis
                  dataKey={xKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  reversed
                  interval="preserveStartEnd"
                  angle={manyTicks ? -45 : 0}
                  textAnchor={manyTicks ? 'end' : 'middle'}
                  height={manyTicks ? 48 : 32}
                  label={{ value: 'التاريخ', position: 'insideBottom', offset: -4, fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  orientation="right"
                  width={48}
                  tickFormatter={(v) => (typeof v === 'number' ? v.toLocaleString('ar-EG') : String(v))}
                  label={{ value: 'المبلغ', angle: -90, position: 'insideRight', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number | string) =>
                    typeof value === 'number' ? value.toLocaleString('ar-EG') : value
                  }
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#2563eb', strokeWidth: 1 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TopProductsChart({ title, data, dataKey, xKey }: ChartProps) {
  const rows = Array.isArray(data) ? data : [];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <ChartEmpty />
        ) : (
          <div className={`${CHART_HEIGHT_CLASS} w-full`} dir="rtl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 36, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal stroke="#8882" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey={xKey}
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  width={100}
                  orientation="right"
                />
                <Tooltip cursor={{ fill: '#8881' }} />
                <Bar dataKey={dataKey} fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DistributionChart({ title, data }: { title: string; data: any[] }) {
  const rows = Array.isArray(data) ? data : [];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <ChartEmpty />
        ) : (
          <div className={`${CHART_HEIGHT_CLASS} w-full`} dir="rtl">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {rows.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
