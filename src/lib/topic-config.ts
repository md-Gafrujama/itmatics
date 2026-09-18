export type TopicConfig = {
  slug: string;
  /** Exact label shown in the navbar */
  navLabel: string;
  kicker: string;
  title: string;
  crumb: string;
  edition: string;
  description: string;
  chips: string[];
  navOrder: number;
  /** Short mono label for topic cards */
  cardKicker?: string;
};

export const IT_TOPICS: TopicConfig[] = [
  {
    slug: "artificial-intelligence",
    navLabel: "Artificial Intelligence",
    kicker: "AI & Automation",
    title: "Artificial Intelligence",
    crumb: "Artificial Intelligence",
    edition: "AI Weekly",
    cardKicker: "AI & AUTOMATION",
    description:
      "From pilots to production: adoption, governance, and the operating models that make AI stick in the enterprise.",
    chips: [
      "Governance",
      "Agentic AI",
      "Generative AI",
      "Adoption",
      "Cost & FinOps",
      "Skills",
    ],
    navOrder: 1,
  },
  {
    slug: "cloud",
    navLabel: "Cloud",
    kicker: "Cloud & Cost",
    title: "Cloud",
    crumb: "Cloud",
    edition: "Cloud Weekly",
    cardKicker: "CLOUD & COST",
    description:
      "Hybrid strategy, sovereign regions, and the economics of running modern workloads.",
    chips: [
      "Hybrid",
      "Sovereign cloud",
      "FinOps",
      "Repatriation",
      "Multi-cloud",
      "Architecture",
    ],
    navOrder: 2,
  },
  {
    slug: "security",
    navLabel: "Security",
    kicker: "Risk & Defense",
    title: "Security",
    crumb: "Security",
    edition: "Security Weekly",
    cardKicker: "RISK & DEFENSE",
    description:
      "Identity, resilience, and the threat landscape facing enterprise security leaders.",
    chips: [
      "Identity",
      "Zero trust",
      "Resilience",
      "Threats",
      "Compliance",
      "AppSec",
    ],
    navOrder: 3,
  },
  {
    slug: "data-analytics",
    navLabel: "Data & Analytics",
    kicker: "Data & Insight",
    title: "Data and Analytics",
    crumb: "Data & Analytics",
    edition: "Data Weekly",
    cardKicker: "DATA & INSIGHT",
    description:
      "Platforms, governance, and turning data investment into decisions people trust.",
    chips: [
      "Platforms",
      "Governance",
      "Analytics",
      "Quality",
      "MLOps",
      "Privacy",
    ],
    navOrder: 4,
  },
  {
    slug: "it-leadership",
    navLabel: "IT Leadership",
    kicker: "IT Leadership",
    title: "IT Leadership",
    crumb: "IT Leadership",
    edition: "Leadership Weekly",
    cardKicker: "LEADERSHIP",
    description:
      "Strategy, operating models, and the decisions CIOs and IT directors face every quarter.",
    chips: [
      "Strategy",
      "Operating model",
      "Budget",
      "Vendors",
      "Talent",
      "Board",
    ],
    navOrder: 5,
  },
  {
    slug: "digital-transformation",
    navLabel: "Digital Transformation",
    kicker: "Digital Transformation",
    title: "Digital Transformation",
    crumb: "Digital Transformation",
    edition: "Transformation Weekly",
    cardKicker: "TRANSFORMATION",
    description:
      "How enterprises actually change: sequencing, product operating models, and what sticks.",
    chips: [
      "Product org",
      "Change",
      "Pilots",
      "Platforms",
      "Outcomes",
      "Culture",
    ],
    navOrder: 6,
  },
  {
    slug: "infrastructure",
    navLabel: "Infrastructure",
    kicker: "Infrastructure",
    title: "Infrastructure",
    crumb: "Infrastructure",
    edition: "Infra Weekly",
    cardKicker: "INFRASTRUCTURE",
    description:
      "Platforms, networking, and the boring systems that keep modern IT running.",
    chips: [
      "Platforms",
      "Networking",
      "Compute",
      "Storage",
      "Reliability",
      "Cost",
    ],
    navOrder: 7,
  },
];

/** @deprecated Use IT_TOPICS - kept as alias for gradual rename */
export const HR_TOPICS = IT_TOPICS;

const topicMap = new Map(IT_TOPICS.map((t) => [t.slug, t]));

export function getTopicConfig(slug: string): TopicConfig | undefined {
  return topicMap.get(slug);
}

export function getNavTopics(): TopicConfig[] {
  return [...IT_TOPICS].sort((a, b) => a.navOrder - b.navOrder);
}

export function sortTopicsByNavOrder<T extends { slug: string }>(
  topics: T[],
): T[] {
  return [...topics].sort((a, b) => {
    const ao = topicMap.get(a.slug)?.navOrder ?? 99;
    const bo = topicMap.get(b.slug)?.navOrder ?? 99;
    return ao - bo;
  });
}

export const FLAG_SIGNALS = [
  { label: "Cloud repatriation", text: "reshapes enterprise budgets" },
  {
    label: "Agentic AI",
    text: "governance moves to the boardroom",
  },
  {
    label: "Quantum-safe",
    text: "migration clocks start ticking",
  },
  {
    label: "Sovereign regions",
    text: "push hyperscalers to certify faster",
  },
  {
    label: "Identity",
    text: "becomes the hardest agentic-enterprise problem",
  },
];

export const IT_TOPIC_SLUGS = new Set(IT_TOPICS.map((t) => t.slug));

/** @deprecated Use IT_TOPIC_SLUGS */
export const HR_TOPIC_SLUGS = IT_TOPIC_SLUGS;

/** Topics that receive AI news articles. */
export const IT_NEWS_TOPIC_SLUGS = new Set(IT_TOPICS.map((t) => t.slug));

/** @deprecated Use IT_NEWS_TOPIC_SLUGS */
export const HR_NEWS_TOPIC_SLUGS = IT_NEWS_TOPIC_SLUGS;
