const KEYWORD_MODIFIERS = {
  informational: ["guide", "tutorial", "how to", "what is", "why", "best", "top", "review", "vs", "alternatives"],
  commercial: ["pricing", "buy", "cheap", "deal", "discount", "sale", "premium", "pro"],
  navigational: ["login", "official", "website", "app", "download", "api", "docs"],
  longtail: ["for beginners", "step by step", "examples", "tips", "tricks", "mistakes", "benefits", "comparison"]
};

function expandKeyword(keyword) {
  const variations = [keyword];
  const lower = keyword.toLowerCase();

  for (const [category, modifiers] of Object.entries(KEYWORD_MODIFIERS)) {
    for (const mod of modifiers) {
      variations.push(`${mod} ${lower}`);
      variations.push(`${lower} ${mod}`);
    }
  }

  const intentGroups = {
    informational: ["guide", "tutorial", "how to", "what is", "why"],
    commercial: ["pricing", "best", "vs", "review", "alternatives"],
    transactional: ["buy", "download", "get", "install", "sign up"]
  };

  const questions = [
    `what is ${lower}`,
    `how to use ${lower}`,
    `why ${lower} matters`,
    `${lower} vs alternatives`,
    `best ${lower} tools`,
    `${lower} tutorial for beginners`,
    `is ${lower} worth it`,
    `${lower} tips and tricks`,
    `common ${lower} mistakes`,
    `${lower} for developers`
  ];

  return { variations: [...new Set(variations)].slice(0, 50), questions, intentGroups };
}

function generateClusterStructure(keyword, articleCount = 10) {
  const { questions } = expandKeyword(keyword);
  const lower = keyword.toLowerCase();

  const cluster = {
    pillar: {
      title: `The Complete Guide to ${keyword}`,
      slug: `complete-guide-to-${lower.replace(/\s+/g, "-")}`,
      type: "pillar",
      targetKeywords: [lower, `${lower} guide`, `what is ${lower}`]
    },
    cluster: []
  };

  const clusterTopics = [
    { title: `Getting Started with ${keyword}`, angle: "beginner" },
    { title: `${keyword} Best Practices`, angle: "practical" },
    { title: `Top 10 ${keyword} Tools`, angle: "commercial" },
    { title: `${keyword} vs Alternatives`, angle: "comparison" },
    { title: `${keyword} for Developers`, angle: "technical" },
    { title: `Common ${keyword} Mistakes to Avoid`, angle: "cautionary" },
    { title: `How to Scale Your ${keyword}`, angle: "advanced" },
    { title: `${keyword} Tips from Experts`, angle: "authoritative" },
    { title: `The Future of ${keyword}`, angle: "trend" },
    { title: `${keyword} Case Studies`, angle: "evidence" },
    { title: `${keyword} Checklist`, angle: "actionable" },
    { title: `${keyword} for Beginners`, angle: "entry" },
    { title: `Advanced ${keyword} Techniques`, angle: "expert" },
    { title: `${keyword} Automation`, angle: "efficiency" },
    { title: `Measuring ${keyword} Success`, angle: "analytics" },
    { title: `${keyword} Security`, angle: "risk" },
    { title: `Integrating ${keyword}`, angle: "integration" },
    { title: `${keyword} Cost Analysis`, angle: "financial" },
    { title: `${keyword} Trends`, angle: "forward-looking" },
    { title: `${keyword} FAQ`, angle: "comprehensive" }
  ];

  for (let i = 0; i < Math.min(articleCount, clusterTopics.length); i++) {
    const topic = clusterTopics[i];
    cluster.cluster.push({
      title: topic.title,
      slug: topic.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      type: "cluster",
      angle: topic.angle,
      targetKeywords: [topic.title.toLowerCase(), ...questions.slice(i * 2, i * 2 + 2)]
    });
  }

  return cluster;
}

function generateInternalLinks(cluster) {
  const links = {};
  const allPages = [cluster.pillar, ...cluster.cluster];

  for (const page of allPages) {
    const pageLinks = [];
    for (const other of allPages) {
      if (other.slug !== page.slug) {
        pageLinks.push({
          from: page.slug,
          to: other.slug,
          anchor: other.title,
          context: page.type === "pillar" ? "See our detailed guide:" : "Related:"
        });
      }
    }
    links[page.slug] = pageLinks.slice(0, 5);
  }

  return links;
}

module.exports = { expandKeyword, generateClusterStructure, generateInternalLinks };
