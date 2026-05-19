export const ROUTES = {
  predict: "/Predict",
} as const;

export const LINKS = {
  apply: "https://luma.com/nruo77gj?tk=hcySed&utm_source=website",
  logisticsForm: "https://tally.so/r/VLvBD6",
  partnerEmail: "mailto:partnerships@lumos-consulting.at",
  maps: "https://maps.app.goo.gl/w1vtb3GDDSM9CwUz8",
  instagram: "https://www.instagram.com/zero.one.hack",
  linkedin: "https://www.linkedin.com/company/zero-one-hack",
} as const;

export const EVENT = {
  name: "Zero One Hack",
  tagline: "36 hours of real model training, not prompt engineering.",
  dates: "May 29–31, 2026",
  location: "Vienna, Austria",
  venue: "AI:AT AI Factory",
  address: "Karl-Farkas-Gasse 22, 1030 Wien",
  kickoff: new Date("2026-05-29T18:00:00+02:00"),
  logisticsDeadline: "Thursday, May 21",
} as const;

export const STATS = [
  {
    label: "Prize Pool",
    value: "€10K",
    suffix: "+",
    detail:
      "Split across 3 tracks. €2,000 first, €1,000 second, €500 third.",
  },
  {
    label: "Builders",
    value: "80",
    suffix: "+",
    detail:
      "A curated cohort of students and developers, application-based.",
  },
  {
    label: "Hours",
    value: "36",
    suffix: "h",
    detail:
      "Friday evening through Sunday afternoon. Build, train, ship, pitch.",
  },
] as const;

export const THESIS = {
  removed: [
    "prompt engineering",
    "LLM wrapper demos",
    "API key speedruns",
  ],
  added: [
    "fine-tune on A100s",
    "pre-train on Leonardo",
    "deploy a real model",
  ],
} as const;

export const PROGRAMME = [
  {
    day: "May 29",
    label: "Friday",
    events: [
      { time: "18:00", title: "Registration" },
      { time: "19:30", title: "Kickoff" },
      { time: "20:30", title: "Case Reveal" },
      { time: "22:00", title: "Hack Begins" },
    ],
  },
  {
    day: "May 30",
    label: "Saturday",
    events: [
      { time: "11:00", title: "Panel Discussion" },
      { time: "14:00", title: "Mentoring Sessions" },
      { time: "15:00", title: "Speaker Event" },
      { time: "19:00", title: "Social Activity" },
    ],
  },
  {
    day: "May 31",
    label: "Sunday",
    events: [
      { time: "10:00", title: "Submission Due" },
      { time: "14:00", title: "Final Pitches" },
      { time: "15:00", title: "Networking" },
      { time: "16:30", title: "Event Closing" },
    ],
  },
] as const;

export const APPLY_GLANCE = [
  { label: "Team Size", value: "2 – 4 builders" },
  { label: "Cost", value: "Free to apply & attend" },
  { label: "Eligibility", value: "Students & developers" },
  { label: "Invites", value: "1 – 2 weeks before event" },
] as const;

export const PIPELINE = [
  {
    step: "01",
    period: "Mid April 2026",
    title: "Early Access",
    description:
      "Waitlist-only invites closed. Public applications now open.",
    status: "CLOSED" as const,
  },
  {
    step: "02",
    period: "End April 2026",
    title: "Public Launch",
    description: "Applications open to all builders. Apply via Luma.",
    status: "OPEN" as const,
  },
  {
    step: "03",
    period: "Mid May 2026",
    title: "Selection",
    description:
      "Applications reviewed. Invites sent 1 – 2 weeks before the event.",
    status: "SOON" as const,
  },
  {
    step: "04",
    period: "May 29 – 31, 2026",
    title: "Hack Weekend",
    description: "100 builders at the AI Factory, Vienna.",
    status: "LOCKED" as const,
  },
] as const;

export const TRACKS = [
  {
    id: "01",
    category: "Industry · Operations",
    title: "AI in Industry",
    partner: "Infineon",
    description:
      "Models that learn how processes unfold. Manufacturing, operations, and industrial systems.",
    focus:
      "Train, fine-tune, or build sequence models (LLMs, transformers, hybrids).",
    prizes: { first: "€2,000", second: "€1,000", third: "€500" },
  },
  {
    id: "02",
    category: "Underwriting · Risk",
    title: "AI in Insurance",
    partner: "UNIQA",
    description:
      "A smarter way to guide customers to a decision. Underwriting, claims, and risk modeling.",
    focus:
      "Model integration & prompt orchestration (dual-mode logic), lightweight frontend/conversational UI.",
    prizes: { first: "€2,000", second: "€1,000", third: "€500" },
  },
  {
    id: "03",
    category: "Forecasting · Decision Support",
    title: "AI in Forecasting",
    partner: "Sybilion",
    description:
      "An agent that decides when to buy. Probabilistic forecasting and the agent layer that acts on it.",
    focus:
      "Agent design, multi-step decisions, and stress-tested evaluation at scale.",
    prizes: { first: "€2,000", second: "€1,000", third: "€500" },
  },
] as const;

export const PARTNER_TIERS = {
  track: ["Infineon", "UNIQA", "Sybilion"],
  community: ["HPE", "AI:AT", "42 Vienna", "Lumos", "EWOR", "Lovable"],
  side: [
    "Wiener Stadtwerke",
    "Accenture",
    "Ströck",
    "Almdudler",
    "Red Bull",
  ],
} as const;

export const MARQUEE_PARTNERS = [
  "Infineon",
  "UNIQA",
  "Sybilion",
  "HPE",
  "AI:AT",
  "42 Vienna",
  "EWOR",
  "Lovable",
  "Wiener Stadtwerke",
  "Accenture",
  "Ströck",
  "Almdudler",
  "Red Bull",
  "Lumos",
] as const;

export const FAQ = [
  {
    category: "Eligibility · Application",
    items: [
      {
        q: "Do I need AI or ML experience?",
        a: "Mixed skill levels are welcome. You should be comfortable writing code; deep ML expertise is not required. The strongest teams usually combine ML, engineering, and product profiles.",
      },
      {
        q: "Can I apply solo or do I need a team?",
        a: "Both are fine. Apply solo and we'll help match you with a team on-site, or apply as a formed team of 2 – 4 builders.",
      },
      {
        q: "Do I have to be a student? Can internationals apply?",
        a: "No student requirement — applications are open to students, developers, and researchers worldwide. You cover your own travel.",
      },
      {
        q: "What happens after I apply?",
        a: "Applications are reviewed on a rolling basis. Invites go out 1 – 2 weeks before the event with venue details and onboarding.",
      },
    ],
  },
  {
    category: "Rules · Judging",
    items: [
      {
        q: "How will projects be judged?",
        a: "Judging criteria will be announced with the track briefs. Expect a mix of technical depth, model quality, real-world impact, and the final pitch.",
      },
      {
        q: "Can we use pre-trained or open-source models?",
        a: "Yes — open-source models and public datasets are fair game. The point is what you build and train on top, not starting from zero. Track-specific rules will be shared at kickoff.",
      },
      {
        q: "Do we have to submit a working model, or will a prototype do?",
        a: "A real, trained model is the bar — this is a supercompute hackathon, not a demo day. A slide deck without a running model will not clear judging.",
      },
      {
        q: "Is there a code of conduct?",
        a: "Yes. All participants follow a code of conduct that keeps the venue inclusive, respectful, and harassment-free. The full document is shared with every invite.",
      },
    ],
  },
  {
    category: "Logistics",
    items: [
      {
        q: "What should I bring?",
        a: "Laptop, charger, and a valid ID. Power, WiFi, GPU access, and meals are provided. Bring a change of clothes and a sleeping bag if you plan to crash on-site.",
      },
      {
        q: "What language is the event in?",
        a: "English. Kickoff, mentoring, and final pitches run in English so international teams can fully participate.",
      },
      {
        q: "Can you accommodate dietary restrictions?",
        a: "Yes — vegetarian, vegan, and common allergen options are part of the standard catering. Specify your needs on the logistics form.",
      },
      {
        q: "How do I get to the venue?",
        a: "AI Factory (AI:AT), Karl-Farkas-Gasse 22, 1030 Vienna. Reachable by U-Bahn, S-Bahn, and tram. Directions are included with your invite.",
      },
    ],
  },
] as const;
