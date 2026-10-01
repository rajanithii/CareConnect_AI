import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DATA = [
  { name: 'O+', value: 32 },
  { name: 'O-', value: 12 },
  { name: 'A+', value: 22 },
  { name: 'A-', value: 8 },
  { name: 'B+', value: 15 },
  { name: 'B-', value: 5 },
  { name: 'AB+', value: 4 },
  { name: 'AB-', value: 2 },
];

const COLORS = ['#C41638', '#9C0F2C', '#DB2142', '#7A0E26', '#3AD6DB', '#12B9C0', '#7CE9EC', '#0E939A'];

export default function BloodGroupChart({ data = DATA }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#FDFBF9" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6DFD6', fontSize: 12 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
