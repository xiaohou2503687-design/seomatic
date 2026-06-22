const OpenAI = require("openai");

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set. Run: set OPENAI_API_KEY=sk-...");
  return new OpenAI({ apiKey: key });
}

async function generateArticle(topic, options = {}) {
  const client = getClient();
  const model = options.model || "gpt-4o-mini";

  const systemPrompt = `You are an expert SEO content writer. Write a comprehensive, well-structured article.
Follow these rules:
- Write in clear, natural English
- Use proper heading hierarchy (H2, H3)
- Include a compelling introduction and conclusion
- Add practical examples and actionable advice
- Target featured snippets with concise answers
- Keep paragraphs short (2-3 sentences)
- Use bullet points and numbered lists where appropriate
- Include 3-5 relevant internal linking opportunities marked as [LINK: anchor text]
- Write 800-1200 words`;

  const userPrompt = `Write a complete SEO-optimized article on this topic:

Title: ${topic.title}
Angle: ${topic.angle || "comprehensive"}
Type: ${topic.type || "article"}
Target Keywords: ${(topic.targetKeywords || []).join(", ")}

Format the output as Markdown with:
1. A meta title (under 60 chars)
2. A meta description (under 160 chars)
3. The full article body with H2/H3 headings

Mark internal linking opportunities with [LINK: descriptive anchor text].`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2500
  });

  return parseArticle(response.choices[0].message.content, topic);
}

function parseArticle(content, topic) {
  const lines = content.split("\n");
  let metaTitle = topic.title;
  let metaDescription = "";
  let body = content;
  let inFrontMatter = true;

  const result = { metaTitle, metaDescription, body: "", slug: topic.slug, title: topic.title };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (inFrontMatter) {
      if (line.startsWith("Meta Title:") || line.startsWith("**Meta Title:**")) {
        result.metaTitle = line.replace(/^(\*\*)?Meta Title:(\*\*)?\s*/i, "").slice(0, 60);
        continue;
      }
      if (line.startsWith("Meta Description:") || line.startsWith("**Meta Description:**")) {
        result.metaDescription = line.replace(/^(\*\*)?Meta Description:(\*\*)?\s*/i, "").slice(0, 160);
        continue;
      }
      if (line.startsWith("#") || line.startsWith("##")) {
        inFrontMatter = false;
      }
    }
    if (!inFrontMatter && line) {
      result.body += line + "\n";
    }
  }

  if (!result.body.trim()) {
    result.body = content;
  }

  return result;
}

async function generateClusterContent(cluster, options = {}) {
  const articles = [];
  const allPages = [cluster.pillar, ...cluster.cluster];

  console.log(`\n📝 Generating ${allPages.length} articles...\n`);

  for (let i = 0; i < allPages.length; i++) {
    const page = allPages[i];
    const pct = Math.round(((i + 1) / allPages.length) * 100);
    process.stdout.write(`  [${pct}%] ${page.title.substring(0, 50)}... `);

    try {
      const article = await generateArticle(page, options);
      articles.push(article);
      console.log("✅");
    } catch (err) {
      console.log(`❌ ${err.message}`);
      articles.push({
        title: page.title,
        slug: page.slug,
        metaTitle: page.title,
        metaDescription: `Learn about ${page.title.toLowerCase()}.`,
        body: `# ${page.title}\n\nContent generation failed: ${err.message}\n`
      });
    }
  }

  return articles;
}

module.exports = { generateArticle, generateClusterContent };
