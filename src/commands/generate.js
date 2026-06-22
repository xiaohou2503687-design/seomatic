const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { generateClusterStructure, generateInternalLinks } = require("../seo/cluster");
const { generateClusterContent } = require("../ai/writer");

async function generate(options) {
  const keyword = options.keyword;
  if (!keyword) {
    console.log(chalk.red("\n  ❌ Please specify a keyword: seomatic generate -k \"your topic\"\n"));
    return;
  }

  const articleCount = parseInt(options.count) || 10;
  const outputDir = options.output || "./seomatic-output";
  const model = options.model || "gpt-4o-mini";

  console.log(chalk.cyan(`\n  🚀 SEOmatic — Generating content cluster for: "${keyword}"\n`));
  console.log(chalk.gray(`  Articles: ${articleCount} | Model: ${model} | Output: ${outputDir}\n`));

  // Step 1: Plan cluster
  const cluster = generateClusterStructure(keyword, articleCount);
  const links = generateInternalLinks(cluster);
  const totalArticles = 1 + cluster.cluster.length;

  console.log(chalk.bold(`  📊 Cluster: 1 Pillar + ${cluster.cluster.length} Cluster Articles`));
  console.log("");

  // Step 2: Generate content
  let articles;
  try {
    articles = await generateClusterContent(cluster, { model });
  } catch (err) {
    if (err.message.includes("OPENAI_API_KEY")) {
      console.log(chalk.yellow("\n  ⚠️  No OpenAI API key found."));
      console.log(chalk.gray("  Set it with: $env:OPENAI_API_KEY='sk-...'"));
      console.log(chalk.gray("  Or get one at: https://platform.openai.com/api-keys\n"));
      console.log(chalk.white("  💡 Running in dry-run mode — showing cluster plan instead:\n"));
      const { plan } = require("./plan");
      await plan({ keyword });
      return;
    }
    throw err;
  }

  // Step 3: Write output
  const outPath = path.resolve(outputDir);
  fs.mkdirSync(outPath, { recursive: true });

  // Write each article
  for (const article of articles) {
    const filename = `${article.slug}.md`;
    const fileContent = generateMarkdownFile(article, links[article.slug] || [], cluster);
    fs.writeFileSync(path.join(outPath, filename), fileContent);
  }

  // Write sitemap
  const sitemap = generateSitemap(articles, keyword);
  fs.writeFileSync(path.join(outPath, "sitemap.md"), sitemap);

  // Summary
  console.log("");
  console.log(chalk.bold.green("╔════════════════════════════════════════════╗"));
  console.log(chalk.bold.green("║       ✅ Content Cluster Generated!         ║"));
  console.log(chalk.bold.green("╚════════════════════════════════════════════╝"));
  console.log("");
  console.log(`  📁 ${outPath}`);
  console.log(`  📄 ${articles.length} articles written`);
  console.log(`  🔗 Internal linking structure ready`);
  console.log("");
  console.log(chalk.white("  💡 Next steps:"));
  console.log(`     ${chalk.cyan(`cd ${outPath}`)}`);
  console.log("     Review and customize articles");
  console.log("     Deploy with ShipFast: npx shipfast deploy");
  console.log("");
}

function generateMarkdownFile(article, pageLinks, cluster) {
  let md = "---\n";
  md += `title: "${article.metaTitle}"\n`;
  md += `description: "${article.metaDescription}"\n`;
  md += `slug: ${article.slug}\n`;
  md += `type: ${cluster.pillar?.slug === article.slug ? "pillar" : "cluster"}\n`;
  md += "---\n\n";
  md += article.body.trim() + "\n\n";

  if (pageLinks.length > 0) {
    md += "---\n\n## Related Articles\n\n";
    for (const link of pageLinks.slice(0, 5)) {
      md += `- [${link.anchor}](./${link.to})\n`;
    }
    md += "\n";
  }

  return md;
}

function generateSitemap(articles, keyword) {
  let md = `# SEOmatic Content Cluster: ${keyword}\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += "## Article List\n\n";
  for (const article of articles) {
    md += `- [${article.title}](./${article.slug})\n`;
  }
  md += "\n## Internal Link Map\n\n";
  md += "All articles are interlinked with contextual anchor text for optimal SEO.\n";
  return md;
}

module.exports = { generate };
