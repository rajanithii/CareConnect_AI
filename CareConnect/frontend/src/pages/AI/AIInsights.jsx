import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import PriorityScore from '../../components/ai/PriorityScore';
import AIExplanation from '../../components/ai/AIExplanation';
import NLPAnalyzer from '../../components/ai/NLPAnalyzer';
import MatchingEngine from '../../components/ai/MatchingEngine';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';

export default function AIInsights() {
  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="AI Insights" subtitle="A closer look at how REQ-1043 was scored and matched">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-base font-bold text-ink">Natural language analysis</h3>
          <div className="mt-4">
            <NLPAnalyzer
              text="Trauma patient, active bleeding, needs O- urgently, 3 units minimum"
              tags={['blood_group: O-', 'units: 3', 'urgency: critical', 'condition: trauma']}
            />
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-base font-bold text-ink">Priority score</h3>
          <div className="mt-4">
            <PriorityScore score={94} label="Critical urgency" />
          </div>
          <div className="mt-4">
            <AIExplanation
              points={[
                'Active bleeding flagged as a critical keyword',
                'O- has the smallest compatible donor pool',
                'No units currently in hospital blood bank',
              ]}
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-display text-base font-bold text-ink">Donor match confidence</h3>
          <p className="text-sm text-muted">Top-ranked candidates for this request</p>
          <div className="mt-4">
            <MatchingEngine
              matches={[
                { name: 'Donor #A214', score: 96 },
                { name: 'Donor #B778', score: 91 },
                { name: 'Donor #C305', score: 87 },
                { name: 'Donor #D190', score: 82 },
              ]}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
