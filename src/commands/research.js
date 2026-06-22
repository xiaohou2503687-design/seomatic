const chalk = require("chalk");
const { expandKeyword } = require("../seo/cluster");

async function research(options) {
  const keyword = options.keyword;
  if (!keyword) {
    console.log(chalk.red("\n  ❌ Please specify a keyword: seomatic research -k \"your topic\"\n"));
    return;
  }

  console.log(chalk.cyan(`\n  🔬 Researching: "${keyword}"\n`));

  const { variations, questions, intentGroups } = expandKeyword(keyword);

  if (options.json) {
    console.log(JSON.stringify({ keyword, variations, questions, intentGroups }, null, 2));
    return;
  }

  console.log(chalk.bold.white("╔════════════════════════════════════════════╗"));
  console.log(chalk.bold.white("║       🔬 Keyword Research                   ║"));
  console.log(chalk.bold.white("╚════════════════════════════════════════════╝"));
  console.log("");

  console.log(chalk.bold.green(`  🎯 Primary: ${keyword}`));
  console.log("");

  console.log(chalk.bold("  🔍 Search Intent Breakdown:"));
  for (const [intent, mods] of Object.entries(intentGroups)) {
    const icon = intent === "informational" ? "📖" : intent === "commercial" ? "💼" : "🛒";
    const examples = mods.slice(0, 3).map(m => `${m} ${keyword}`).join(", ");
    console.log(`  ${icon} ${intent.charAt(0).toUpperCase() + intent.slice(1)}: ${examples}`);
  }

  console.log("");
  console.log(chalk.bold("  📈 Long-tail Variations:"));
  const longtails = variations.filter(v => v.split(" ").length > 3).slice(0, 10);
  for (const v of longtails) {
    console.log(chalk.gray(`     • ${v}`));
  }

  console.log("");
  console.log(chalk.bold("  ❓ PAA Questions (People Also Ask):"));
  for (const q of questions.slice(0, 8)) {
    console.log(chalk.gray(`     • ${q}`));
  }

  console.log("");
  console.log(chalk.white("  💡 Next:"));
  console.log(chalk.cyan(`  seomatic plan -k "${keyword}"`));
  console.log(chalk.cyan(`  seomatic generate -k "${keyword}"`));
  console.log("");
}

module.exports = { research };
