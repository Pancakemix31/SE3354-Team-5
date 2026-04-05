const ARTICLE_LIBRARY = [
  {
    id: 'feat-data-centers-cooling-2025',
    title: 'Data centers trial smarter cooling to trim energy use',
    source: 'Reuters',
    category: 'Technology | Sustainability',
    excerpt:
      'University researchers announced a new approach to reducing energy use in data centers by optimizing cooling systems with machine learning.',
    readTime: '2 min read',
    content: [
      'University researchers are testing machine-learning controls that adjust cooling equipment in real time across large data centers.',
      'In early pilot runs, the system reduced power draw during peak demand windows without overheating server racks or slowing workloads.',
      'The team said the next phase will expand to more facilities and compare the approach with conventional building-management software before broader deployment.',
    ],
    url: 'https://example.com/data-centers-cooling',
  },
];

export const FEATURED_ARTICLE = ARTICLE_LIBRARY[0];

export function getArticleById(articleId) {
  return ARTICLE_LIBRARY.find((article) => article.id === articleId) ?? null;
}

export function listArticles() {
  return ARTICLE_LIBRARY.slice();
}
