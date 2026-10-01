import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DATA = [
  { day: 'Mon', minutes: 6.2 },
  { day: 'Tue', minutes: 5.1 },
  { day: 'Wed', minutes: 4.8 },
  { day: 'Thu', minutes: 4.2 },
  { day: 'Fri', minutes: 5.6 },
  { day: 'Sat', minutes: 3.9 },
  { day: 'Sun', minutes: 4.1 },
];

export default function ResponseTimeChart({ data = DATA }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12B9C0" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#12B9C0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD6" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#7A7168' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#7A7168' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6DFD6', fontSize: 12 }} />
        <Area type="monotone" dataKey="minutes" stroke="#0E939A" strokeWidth={2.5} fill="url(#responseGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
