export const FORCE_TRENDING_FAILURE_KEY = 'briefly_force_trending_failure';
export const TRENDING_LOAD_MS = 500;

const PRIMARY_STORIES = [
  {
    id: 'trend-solar-grid-europe',
    title: 'Europe grid operators lean on solar storage during record demand',
    source: 'BBC News',
    region: 'Europe',
    publishedAt: '2026-04-05T14:00:00.000Z',
    summary:
      'Utilities across Europe are pairing battery reserves with midday solar output to keep up with unusual spring demand spikes.',
    content: [
      'Grid operators in Germany, Spain, and Italy said battery-backed solar reserves helped stabilize supply as demand climbed faster than expected this week.',
      'Analysts said the temporary demand jump came from industrial activity and colder-than-normal weather patterns that pushed heating loads upward.',
      'Officials are now studying whether the same balancing strategy can scale into summer peak periods without increasing household prices.',
    ],
    readCount: 12800,
    shareCount: 4600,
  },
  {
    id: 'trend-india-flood-logistics',
    title: 'South Asian logistics routes rerouted after severe flooding',
    source: 'Associated Press',
    region: 'Asia',
    publishedAt: '2026-04-05T13:10:00.000Z',
    summary:
      'Regional rail and shipping corridors are being rerouted after flooding disrupted several major freight links.',
    content: [
      'Authorities in multiple South Asian cities redirected freight traffic after floodwaters submerged rail hubs and slowed port access.',
      'Exporters said temporary workarounds are keeping goods moving, though delivery windows have widened for electronics and food shipments.',
      'Emergency teams remain focused on restoring road access and preventing additional warehouse losses in low-lying industrial zones.',
    ],
    readCount: 17100,
    shareCount: 5300,
  },
  {
    id: 'trend-brazil-forest-monitoring',
    title: 'Brazil expands satellite monitoring to flag illegal clearing faster',
    source: 'Reuters',
    region: 'South America',
    publishedAt: '2026-04-05T12:40:00.000Z',
    summary:
      'A new satellite workflow aims to shorten the time between forest clearing detection and enforcement response.',
    content: [
      'Brazilian officials said a higher-frequency satellite monitoring system is now active across several high-risk regions in the Amazon.',
      'The government expects the faster alerts to help inspection teams identify illegal clearing sooner and improve follow-through on fines.',
      'Environmental groups welcomed the upgrade but said long-term impact still depends on staffing levels and consistent enforcement.',
    ],
    readCount: 9400,
    shareCount: 3900,
  },
];

const BACKUP_STORIES = [
  {
    id: 'trend-backup-health-supply',
    title: 'Global health agencies coordinate backup supply routes',
    source: 'NPR',
    region: 'Global',
    publishedAt: '2026-04-05T11:50:00.000Z',
    summary:
      'Health agencies are coordinating alternate shipment paths to reduce delivery gaps after regional disruptions.',
    content: [
      'International health agencies said they activated secondary logistics partners to maintain medicine deliveries across several regions.',
      'Officials expect the backup routes to remain in place through the week while primary transit lanes recover.',
      'Procurement teams are also reviewing whether regional stockpiles need to be expanded for future disruptions.',
    ],
    readCount: 7300,
    shareCount: 2500,
  },
];

function withEngagementScore(story) {
  return {
    ...story,
    engagementScore: story.readCount + story.shareCount,
  };
}

function sortByEngagement(stories) {
  return stories
    .map(withEngagementScore)
    .sort((left, right) => right.engagementScore - left.engagementScore);
}

function readForcedFailure() {
  try {
    return JSON.parse(localStorage.getItem(FORCE_TRENDING_FAILURE_KEY) || 'false');
  } catch {
    return false;
  }
}

export function fetchTrending() {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (readForcedFailure()) {
        resolve({
          ok: true,
          degraded: true,
          stories: sortByEngagement(BACKUP_STORIES),
          message: 'Primary source unavailable. Showing backup trending coverage.',
        });
        return;
      }

      resolve({
        ok: true,
        degraded: false,
        stories: sortByEngagement(PRIMARY_STORIES),
        message: '',
      });
    }, TRENDING_LOAD_MS);
  });
}

export function getTrendingStoryById(storyId) {
  const allStories = [...PRIMARY_STORIES, ...BACKUP_STORIES];
  return allStories.find((story) => story.id === storyId) ?? null;
}
