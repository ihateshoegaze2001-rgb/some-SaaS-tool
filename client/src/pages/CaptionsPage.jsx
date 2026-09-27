import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../lib/api.js';
import { usePlan } from '../lib/PlanContext.jsx';
import './CaptionsPage.css';

const PLATFORMS = [
  { id: 'ig', label: 'Instagram' },
  { id: 'tt', label: 'TikTok' },
  { id: 'x', label: 'X' },
];

const TONES = ['Playful', 'Bold', 'Witty', 'Minimal', 'Heartfelt'];

export default function CaptionsPage() {
  const { refresh } = usePlan();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('ig');
  const [tone, setTone] = useState('Playful');
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: '', err: false });

  async function handleGenerate() {
    if (!topic.trim()) {
      setStatus({ text: 'Tell us what the post is about first.', err: true });
      return;
    }
    setLoading(true);
    setStatus({ text: 'Thinking of captions…', err: false });
    try {
      const data = await api.generate({ topic, platform, tone });
      setCaptions(data.captions);
      setStatus({
        text: `Pinned ${data.captions.length} captions. ${data.remaining} left this month.`,
        err: false,
      });
      refresh();
    } catch (e) {
      setStatus({ text: e.message || 'Something went wrong.', err: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="captions">
      <PageHeader
        title="Captions"
        subtitle="Describe the post, pick a platform and tone, pin five options."
      />

      <div className="captions__body">
        <aside className="captions__form">
          <div className="captions__field">
            <label htmlFor="topic">What's the post about?</label>
            <textarea
              id="topic"
              placeholder="e.g. new matcha latte launching this weekend"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="captions__field">
            <label>Platform</label>
            <div className="captions__tabs">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={platform === p.id ? 'is-active' : ''}
                  onClick={() => setPlatform(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="captions__field">
            <label>Tone</label>
            <div className="captions__chips">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={tone === t ? 'is-active' : ''}
                  onClick={() => setTone(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button className="captions__go" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Pinning…' : 'Pin 5 new captions'}
          </button>
          <p className={'captions__status' + (status.err ? ' is-err' : '')}>
            {status.text}
          </p>
        </aside>

        <section className="captions__board">
          {captions.length === 0 ? (
            <div className="captions__empty">
              <h2>Nothing pinned yet</h2>
              <p>Fill in the form on the left and hit the button.</p>
            </div>
          ) : (
            <div className="captions__grid">
              {captions.map((c, i) => (
                <Note key={i} caption={c} platform={platform} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Note({ caption, platform }) {
  const [copied, setCopied] = useState(false);
  const tags = (caption.hashtags || []).map((t) => '#' + t).join(' ');

  function handleCopy() {
    navigator.clipboard.writeText((caption.caption || '') + (tags ? '\n\n' + tags : ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className={`captions__note captions__note--${platform}`}>
      <p className="captions__note-text">{caption.caption}</p>
      {tags && <p className="captions__note-tags">{tags}</p>}
      <div className="captions__note-bar">
        <button type="button" onClick={handleCopy}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
