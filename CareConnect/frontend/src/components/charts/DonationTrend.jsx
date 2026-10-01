import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DATA = [
  { month: 'Feb', units: 210 },
  { month: 'Mar', units: 248 },
  { month: 'Apr', units: 190 },
  { month: 'May', units: 265 },
  { month: 'Jun', units: 302 },
  { month: 'Jul', units: 284 },
];

export default function DonationTrend({ data = DATA }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD6" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7A7168' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#7A7168' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6DFD6', fontSize: 12 }} />
        <Bar dataKey="units" fill="#C41638" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
