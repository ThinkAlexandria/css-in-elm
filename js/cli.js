#!/usr/bin/env node
//@flow

const elmCss = require("../"),
  program = require("commander"),
  chalk = require("chalk"),
  _ = require("lodash"),
  path = require("path"),
  pkg = require("../package.json"),
  fs = require("fs-extra");

program
  .version(pkg.version)
  .usage("")
  .option(
    "-o, --output [outputDir]",
    "(optional) directory in which to write CSS files. Defaults to build/",
    path.join(process.cwd(), "build")
  )
  .option("-m, --pathToElm [pathToElm]", "(optional) path to elm")
  .parse(process.argv);

const cssSourceDir = path.join(process.cwd(), "css");
const sourcePath = path.join(cssSourceDir, "src");

if (!fs.existsSync(path.join(sourcePath, "Stylesheets.elm"))) {
  console.log(chalk.red("You must create a css/src/Stylesheets.elm file. See the README for information on how to build a Stylesheets.elm file."));
  program.outputHelp();
  process.exit(1);
}

const headline = "css-in-elm " + pkg.version;
const bar = _.repeat("-", headline.length);

console.log("\n" + headline + "\n" + bar + "\n");

elmCss(process.cwd(), program.output, program.pathToElm)
  .then(function(results) {
    console.log(chalk.green("Success! I created these css files:"));
    results.forEach(function(result) {
      console.log(chalk.blue("- " + result.filename));
    });
  })
  .catch(function(error) {
    console.error(chalk.red(error));
    process.exit(1);
  });
