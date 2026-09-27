import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { TOOLS } from '../lib/tools.js';
import { usePlan } from '../lib/PlanContext.jsx';
import './Overview.css';

export default function Overview() {
  const { info } = usePlan();
  const remaining = info ? Math.max(0, info.limit - info.used) : null;

  return (
    <>
      <PageHeader
        title="Good to see you"
        subtitle="One workspace for everything you use to run your social accounts."
      />

      <div className="overview">
        <section className="overview__stat">
          <span className="overview__stat-label">Captions left this month</span>
          <span className="overview__stat-value">
            {remaining === null ? '—' : remaining}
          </span>
          <span className="overview__stat-foot">
            {info ? `on the ${info.tier === 'pro' ? 'Pro' : 'Free'} plan · ${info.used} of ${info.limit} used` : 'loading…'}
          </span>
        </section>

        <section className="overview__tools">
          <h2 className="overview__tools-title">Your tools</h2>
          <ul className="overview__list">
            {TOOLS.map((tool) => (
              <li key={tool.id} className="overview__row">
                <tool.icon size={19} strokeWidth={1.8} className="overview__row-icon" />
                <div className="overview__row-text">
                  <span className="overview__row-label">{tool.label}</span>
                  <span className="overview__row-blurb">{tool.blurb}</span>
                </div>
                {tool.status === 'live' ? (
                  <Link className="overview__row-action" to={tool.path}>
                    Open
                  </Link>
                ) : (
                  <span className="overview__row-pill">Coming soon</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
