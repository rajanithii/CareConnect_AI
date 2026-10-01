import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, MessageSquareText, Gauge, GitCompareArrows, Route, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';

const STAGES = [
  { icon: MessageSquareText, label: 'Parsing request with NLP' },
  { icon: Gauge, label: 'Scoring urgency' },
  { icon: GitCompareArrows, label: 'Filtering compatible donors' },
  { icon: Route, label: 'Ranking by distance & reliability' },
];

export default function AIProcessing() {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    const storedRequestId = localStorage.getItem('bloodlink_last_request_id');
    const flowActive = localStorage.getItem('bloodlink_last_request_flow');

    if (!storedRequestId || !flowActive) {
      localStorage.removeItem('bloodlink_last_request_id');
      localStorage.removeItem('bloodlink_last_request_flow');
      navigate('/hospital/create-request');
      return;
    }

    setRequestId(storedRequestId);
    setLoading(true);
    setActiveStage(0);
    setDone(false);

    const timers = [];
    STAGES.forEach((_, index) => {
      timers.push(setTimeout(() => {
        setActiveStage(index + 1);
      }, (index + 1) * 700));
    });

    timers.push(setTimeout(() => {
      setDone(true);
      setLoading(false);
      setResult({ message: 'AI matching is complete. Donor recommendations are ready.' });
      localStorage.removeItem('bloodlink_last_request_flow');
    }, (STAGES.length + 1) * 800));

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [navigate]);

  useEffect(() => {
    if (!loading && done) {
      setActiveStage(STAGES.length);
    }
  }, [loading, done]);

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="AI Processing" subtitle={requestId ? `Request REQ-${requestId}` : 'AI processing in progress'}>
      <Card className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-200/40 text-cyan-700">
          <BrainCircuit size={26} className={loading ? 'animate-pulse' : ''} />
        </span>
        <h2 className="mt-5 font-display text-xl font-bold text-ink">
          {loading ? 'AI is analyzing your request' : done ? 'Matching complete' : 'AI processing could not be completed'}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {loading ? 'This usually takes a few seconds.' : error ? error : result?.message || 'Processing complete.'}
        </p>

        <div className="mt-8 space-y-3 text-left">
          {STAGES.map((stage, i) => {
            const state = i < activeStage ? 'done' : i === activeStage ? 'active' : 'pending';
            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: state === 'pending' ? 0.4 : 1, x: 0 }}
                className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3"
              >
                {state === 'done' ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <stage.icon size={18} className={state === 'active' ? 'text-cyan-600 animate-pulse' : 'text-muted'} />
                )}
                <span className={`text-sm ${state === 'pending' ? 'text-muted' : 'text-ink2 font-medium'}`}>
                  {stage.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {done && !loading && (
          <Button
            variant="primary"
            size="lg"
            className="mt-8 w-full"
            onClick={() => {
              if (requestId) {
                navigate(`/hospital/matching-results/${requestId}`);
              } else {
                navigate('/hospital/create-request');
              }
            }}
          >
            View Matched Donors
          </Button>
        )}
      </Card>
    </DashboardLayout>
  );
}
