import {
  MessageSquareText,
  CalendarDays,
  Hash,
  Lightbulb,
  Palette,
} from 'lucide-react';

// Every tool in the suite gets one entry here — the sidebar, the overview
// page, and the routes all read from this list. To add a real tool later:
// build its page component, set `status: 'live'`, and point `path` at it.
export const TOOLS = [
  {
    id: 'captions',
    label: 'Captions',
    path: '/captions',
    icon: MessageSquareText,
    status: 'live',
    blurb: 'Generate on-brand captions for any platform in seconds.',
  },
  {
    id: 'calendar',
    label: 'Content calendar',
    path: '/calendar',
    icon: CalendarDays,
    status: 'soon',
    blurb: 'Lay out what\u2019s posting where, and when, across the month.',
  },
  {
    id: 'hashtags',
    label: 'Hashtag finder',
    path: '/hashtags',
    icon: Hash,
    status: 'soon',
    blurb: 'Pair trending tags with niche ones so posts actually get found.',
  },
  {
    id: 'ideas',
    label: 'Idea bank',
    path: '/ideas',
    icon: Lightbulb,
    status: 'soon',
    blurb: 'A running list of post ideas and prompts, so you never start blank.',
  },
  {
    id: 'brand-kit',
    label: 'Brand kit',
    path: '/brand-kit',
    icon: Palette,
    status: 'soon',
    blurb: 'Save your voice, tone, and off-limits words once — every tool follows it.',
  },
];
