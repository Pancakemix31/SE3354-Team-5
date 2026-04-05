const ANALYTICS_KEY = 'briefly_story_views';

function readViews() {
  try {
    return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function trackStoryView(story) {
  if (!story?.id) {
    return { ok: false };
  }

  const next = [
    ...readViews(),
    {
      storyId: story.id,
      title: story.title,
      trackedAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(next));
  return { ok: true };
}

export function getTrackedStoryViews() {
  return readViews();
}
