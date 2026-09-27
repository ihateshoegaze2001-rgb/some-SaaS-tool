import { useParams } from 'react-router-dom';
import { Pin } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { TOOLS } from '../lib/tools.js';
import './ComingSoonPage.css';

export default function ComingSoonPage() {
  const { toolId } = useParams();
  const tool = TOOLS.find((t) => t.id === toolId);
  const title = tool ? tool.label : 'This tool';

  return (
    <>
      <PageHeader title={title} subtitle={tool?.blurb} />
      <div className="soon">
        <div className="soon__card">
          <Pin size={16} strokeWidth={2.5} className="soon__pin" />
          <p className="soon__eyebrow">Not built yet</p>
          <p className="soon__body">
            {title} isn't wired up in this prototype. When you're ready to
            add it, it slots into the same sidebar and usage system as
            Captions.
          </p>
        </div>
      </div>
    </>
  );
}
