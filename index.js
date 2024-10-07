//@flow

const _ = require("lodash"),
  path = require("path"),
  glob = require("glob"),
  mkdirp = require("mkdirp").mkdirp,
  findExposedValues = require("./js/find-exposed-values").findExposedValues,
  writeGeneratedElmPackage = require("./js/generate-elm-package"),
  writeMain = require("./js/generate-main").writeMain,
  writeFile = require("./js/generate-class-modules").writeFile,
  findElmFiles = require("./js/find-elm-files"),
  compileAll = require("./js/compile-all"),
  fs = require("fs-extra"),
  compile = require("node-elm-compiler").compile,
  extractCssResults = require("./js/extract-css-results.js"),
  hackMain = require("./js/hack-main.js");

const jsEmitterFilename = "emitter.js";

module.exports = function (
  projectDir /*: string*/,
  outputDir /*: string */,
  pathToMake /*: ?string */
) {
  const cssSourceDir = path.join(projectDir, "css");
  const cssElmPackageJson = path.join(cssSourceDir, "elm.json");

  if (!fs.existsSync(cssElmPackageJson)) {
    mkdirp.sync(cssSourceDir);

    // TODO do an init here
  }

  const elmFilePaths = findElmFiles(cssSourceDir);
  const generatedDir = path.join(
    projectDir,
    "elm-stuff",
    "generated-code",
    "ThinkAlexandria",
    "css-in-elm"
  );

  // Symlink our existing elm-stuff into the generated code,
  // to avoid re-downloading and recompiling things we already
  // just downloaded and compiled.
  var generatedElmStuff = path.join(generatedDir, "elm-stuff");

  mkdirp.sync(generatedDir);
  // ensure the elm-stuff directory in the css/ folder exists so we can symlink
  // it. If it does not exist `elm` has probably not downloaded the required
  // packages yet and will do so automatically.
  var cssSourceDirElmStuff = path.join(cssSourceDir, "elm-stuff");
  mkdirp.sync(cssSourceDirElmStuff);

  try {
    // Check if the symlink itself exists (not following it)
    const stats = fs.lstatSync(generatedElmStuff);

    if (!stats.isSymbolicLink()) {
      console.log(
        "Path exists but is not a symlink. Removing it and creating symlink."
      );
      fs.rmSync(generatedElmStuff, { recursive: true, force: true });
      return;
    } else {
      // console.error("symlink exists");
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      fs.symlinkSync(
        path.join(cssSourceDir, "elm-stuff"),
        generatedElmStuff,
        "junction" // Only affects Windows, but necessary for this to work there. See https://github.com/gulpjs/vinyl-fs/issues/210
      );
    } else {
      console.error("An error occurred:", error);
      return;
    }
  }

  const generatedSrc = path.join(generatedDir, "src");
  const mainFilename = path.join(generatedSrc, "Main.elm");

  const makeGeneratedSrcDir = new Promise(function (resolve, reject) {
    mkdirp(generatedSrc).then(resolve).catch(reject);
  });

  return Promise.all([
    writeGeneratedElmPackage(generatedDir, generatedSrc, cssSourceDir),
    makeGeneratedSrcDir,
    compileAll(pathToMake, cssSourceDir, elmFilePaths),
  ]).then(function (promiseOutputs) {
    const repository /*: string */ = promiseOutputs[0];

    // This part below is not used because we are using the Stylesheets.elm input format
    // instead of generating our own Main.elm file
    //
    // Not quite sure what findExposedValues is doing, the format of the elmi
    // files has changed in 0.19, so it will never return results right now
    // anyway
    return findExposedValues(
      ["Css.File.UniqueClass", "Css.Snippet"],
      generatedDir,
      elmFilePaths,
      [cssSourceDir],
      true
    ).then(function (modules) {
      return Promise.all(
        [writeMain(mainFilename, modules)].concat(
          modules.map(function (modul) {
            return writeFile(path.join(generatedDir, "styles"), modul);
          })
        )
      )
        .then(() => {
          writePackageJson(generatedDir);
        })
        .then(function () {
          return emit(
            mainFilename,
            repository,
            path.join(generatedDir, jsEmitterFilename),
            generatedDir,
            pathToMake
          ).then(writeResults(outputDir));
        });
    });
  });
};

function writePackageJson(directory) {
  const packageJsonPath = path.join(directory, "package.json");
  const packageJsonContent = JSON.stringify(
    {
      type: "commonjs",
    },
    null,
    2
  );
  console.log("Writing package.json to", packageJsonPath);

  return fs.writeFile(packageJsonPath, packageJsonContent);
}

function emit(
  src /*: string */,
  repository /*: string */,
  dest /*: string */,
  cwd /*: string */,
  pathToMake /*: ?string */
) {
  // Compile the js file.
  return (
    compileEmitter(src, {
      output: dest,
      cwd: cwd,
      // Because we upgraded the version of node-elm-compiler, it only supports
      // Elm 0.19 now. So if we want to still support Elm 0.18 we would might need to
      // vendor node-elm-compiler
      pathToElm: pathToMake,
    })
      //.then(function() {
      //  return hackMain(repository, dest);
      //})
      .then(function () {
        return extractCssResults(dest);
      })
  );
}

function writeResults(outputDir) {
  return function (results) {
    return Promise.all(results.map(writeResult(outputDir)));
  };
}

function writeResult(outputDir) {
  return function (result) {
    return new Promise(function (resolve, reject) {
      const filename = path.join(outputDir, result.filename);
      // It's important to call path.dirname explicitly,
      // because result.filename can have directories in it!
      const directory = path.dirname(filename);

      mkdirp(directory)
        .catch(reject)
        .then(function () {
          fs.writeFile(
            filename,
            result.content + "\n",
            function (fileError, file) {
              if (fileError) return reject(fileError);

              resolve(result);
            }
          );
        });
    });
  };
}

function reportFailures(failures) {
  return (
    "The following errors occurred during compilation:\n\n" +
    failures
      .map(function (result) {
        return result.filename + ": " + result.content;
      })
      .join("\n\n")
  );
}

function compileEmitter(src, options) {
  return new Promise(function (resolve, reject) {
    compile(src, options).on("close", function (exitCode) {
      if (exitCode === 0) {
        resolve();
      } else {
        reject("Errored with exit code " + exitCode);
      }
    });
  });
}
