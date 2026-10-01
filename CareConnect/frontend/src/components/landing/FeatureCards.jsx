import { motion } from 'framer-motion';
import {
  BrainCircuit,
  MapPinned,
  BellRing,
  Droplets,
  BarChart3,
  LayoutDashboard,
  UserRound,
  Sparkles,
} from 'lucide-react';
import Card from '../common/Card';

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI Matching',
    description:
      'Our model ranks compatible donors by blood type, distance, and reliability in real time.',
    tone: 'ai',
  },
  {
    icon: MapPinned,
    title: 'Live Location',
    description: 'Track donor positions and ETAs on a live map from request to arrival.',
    tone: 'red',
  },
  {
    icon: BellRing,
    title: 'Emergency Alerts',
    description: 'Instant push, SMS, and call alerts reach the closest matches within seconds.',
    tone: 'red',
  },
  {
    icon: Droplets,
    title: 'Blood Compatibility',
    description: 'Built-in compatibility engine prevents mismatches before they happen.',
    tone: 'ai',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Response times, fulfillment rates, and donor trends in one clear view.',
    tone: 'red',
  },
  {
    icon: LayoutDashboard,
    title: 'Hospital Dashboard',
    description: 'Create requests, monitor matching, and coordinate teams from one console.',
    tone: 'ai',
  },
  {
    icon: UserRound,
    title: 'Donor Dashboard',
    description: 'Donors manage availability, history, and nearby requests effortlessly.',
    tone: 'red',
  },
  {
    icon: Sparkles,
    title: 'Prediction Engine',
    description: 'Forecasts shortages before they happen using seasonal donation patterns.',
    tone: 'ai',
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
            What BloodLink AI does
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Every tool a fast response needs
          </h2>
          <p className="mt-4 text-lg text-muted">
            From the first emergency request to the moment a donor arrives, each piece is
            built to shave minutes off the process.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            >
              <Card hover className="h-full">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    f.tone === 'ai' ? 'bg-cyan-200/40 text-cyan-700' : 'bg-red-50 text-red-600'
                  }`}
                >
                  <f.icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
