import { NavLink, Link } from 'react-router-dom';
import { Pin, LayoutGrid } from 'lucide-react';
import { TOOLS } from '../lib/tools.js';
import { usePlan } from '../lib/PlanContext.jsx';
import './Sidebar.css';

export default function Sidebar() {
  const { info, setTier } = usePlan();

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar__brand">
        <Pin size={18} strokeWidth={2.5} className="sidebar__brand-pin" />
        <span className="sidebar__brand-text">
          The Caption <em>Board</em>
        </span>
      </Link>

      <nav className="sidebar__nav" aria-label="Tools">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            'sidebar__link' + (isActive ? ' is-active' : '')
          }
        >
          <LayoutGrid size={17} strokeWidth={2} className="sidebar__link-icon" />
          <span>Overview</span>
        </NavLink>
        <div className="sidebar__divider" />
        {TOOLS.map((tool) => (
          <NavLink
            key={tool.id}
            to={tool.path}
            className={({ isActive }) =>
              'sidebar__link' + (isActive ? ' is-active' : '')
            }
          >
            <tool.icon size={17} strokeWidth={2} className="sidebar__link-icon" />
            <span>{tool.label}</span>
            {tool.status === 'soon' && <span className="sidebar__badge">Soon</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__plan">
        {info ? (
          <>
            <div className="sidebar__plan-row">
              <span className="sidebar__plan-name">
                {info.tier === 'pro' ? 'Pro plan' : 'Free plan'}
              </span>
              <span className="sidebar__plan-usage">
                {info.used} / {info.limit}
              </span>
            </div>
            <div className="sidebar__plan-track">
              <div
                className="sidebar__plan-fill"
                style={{ width: `${Math.min(100, (info.used / info.limit) * 100)}%` }}
              />
            </div>
            <p className="sidebar__plan-note">
              Simulated billing — swap tiers to test both caps.
            </p>
            <div className="sidebar__plan-toggle" role="group" aria-label="Simulate plan">
              <button
                type="button"
                className={info.tier === 'free' ? 'is-active' : ''}
                onClick={() => setTier('free')}
              >
                Free
              </button>
              <button
                type="button"
                className={info.tier === 'pro' ? 'is-active' : ''}
                onClick={() => setTier('pro')}
              >
                Pro
              </button>
            </div>
          </>
        ) : (
          <p className="sidebar__plan-note">Loading plan…</p>
        )}
      </div>
    </aside>
  );
}
