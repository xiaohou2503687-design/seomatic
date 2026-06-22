#!/usr/bin/env node
const { program } = require("commander");
const chalk = require("chalk");

program.name("seomatic").description("🔍 AI content cluster generator").version("0.1.0");

program.command("generate")
  .description("Generate content cluster from a keyword")
  .option("-k, --keyword <keyword>", "Target keyword")
  .option("-n, --count <number>", "Number of articles", "10")
  .option("-o, --output <path>", "Output directory", "./seomatic-output")
  .option("--model <model>", "AI model", "gpt-4o-mini")
  .action(async (opts) => {
    const { generate } = require("../src/commands/generate");
    await generate(opts);
  });

program.command("plan")
  .description("Plan content cluster structure")
  .option("-k, --keyword <keyword>", "Target keyword")
  .action(async (opts) => {
    const { plan } = require("../src/commands/plan");
    await plan(opts);
  });

program.command("research")
  .description("Research keyword opportunities")
  .option("-k, --keyword <keyword>", "Target keyword")
  .option("--json", "JSON output")
  .action(async (opts) => {
    const { research } = require("../src/commands/research");
    await research(opts);
  });

program.parse();
