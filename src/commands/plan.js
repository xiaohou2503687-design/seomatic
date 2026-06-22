const chalk = require("chalk");
const { expandKeyword, generateClusterStructure, generateInternalLinks } = require("../seo/cluster");

async function plan(options) {
  const keyword = options.keyword;
  if (!keyword) {
    console.log(chalk.red("\n  ❌ Please specify a keyword: seomatic plan -k \"your topic\"\n"));
    return;
  }

  console.log(chalk.cyan(`\n  🔍 Planning content cluster for: "${keyword}"\n`));

  const { variations, questions } = expandKeyword(keyword);
  const cluster = generateClusterStructure(keyword, 10);
  const links = generateInternalLinks(cluster);

  console.log(chalk.bold.white("╔════════════════════════════════════════════╗"));
  console.log(chalk.bold.white("║       📊 Content Cluster Plan               ║"));
  console.log(chalk.bold.white("╚════════════════════════════════════════════╝"));
  console.log("");

  console.log(chalk.bold.green(`  🏛️  Pillar: ${cluster.pillar.title}`));
  console.log(chalk.gray(`     /${cluster.pillar.slug}`));
  console.log("");

  console.log(chalk.bold.blue(`  📄 Cluster Articles (${cluster.cluster.length}):`));
  for (const article of cluster.cluster) {
    const angleIcon = article.angle === "beginner" ? "🌱" : article.angle === "advanced" ? "🚀" : article.angle === "commercial" ? "💼" : "📝";
    console.log(`  ${angleIcon} ${article.title}`);
    console.log(chalk.gray(`     /${article.slug}`));
  }

  console.log("");
  console.log(chalk.bold.yellow(`  🔗 Internal Link Structure:`));
  console.log(chalk.gray(`     ${Object.keys(links).length} pages × ~5 internal links each`));
  console.log(chalk.gray(`     Total: ~${Object.values(links).reduce((s, l) => s + l.length, 0)} internal links`));

  console.log("");
  console.log(chalk.bold.magenta(`  🎯 Related Keywords (${variations.length}):`));
  console.log(chalk.gray(`     ${variations.slice(0, 10).join(", ")}...`));

  console.log("");
  console.log(chalk.bold.cyan(`  ❓ Target Questions (${questions.length}):`));
  for (const q of questions.slice(0, 5)) {
    console.log(chalk.gray(`     • ${q}`));
  }

  console.log("");
  console.log(chalk.white("  💡 Ready? Run:"));
  console.log(chalk.cyan(`  seomatic generate -k "${keyword}"`));
  console.log("");
}

module.exports = { plan };
