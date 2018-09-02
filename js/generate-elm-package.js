//@flow
const path = require("path"),
  fs = require("fs-extra");

module.exports = function writeGeneratedElmPackage(
  generatedDir /*:string */,
  generatedSrc /*: string */,
  originalElmPackageDir /*: string */
) {
  const originalElmPackage = path.join(
    originalElmPackageDir,
    "elm.json"
  );

  return fs.readJson(originalElmPackage).then(function(elmPackageContents) {
    // Make all the source-directories absolute, and introduce a new one.
    var sourceDirs = (elmPackageContents["source-directories"] || [])
      .map(function(src) {
        return path.resolve(originalElmPackageDir, src);
      });

    elmPackageContents["source-directories"] = [
      // Include elm-stuff/generated-code/ThinkAlexandria/css-in-elm/src
      // since we'll be generating Main.elm in there.
      generatedSrc
    ].concat(sourceDirs);

    // Generate the new elm.json
    return new Promise(function(resolve, reject) {
      fs.writeFile(
        path.join(generatedDir, "elm.json"),
        JSON.stringify(elmPackageContents, null, 4),
        function(writeError) {
          if (writeError)
            reject("Error writing generated elm.json: " + writeError);

          resolve(elmPackageContents["repository"]);
        }
      );
    });
  });
};
