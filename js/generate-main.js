//@flow

/*::
type ModuleDeclaration = {
  name: string,
  values: Array<{ name : string, signature : string }>
}
*/

const fs = require("fs-extra"),
  mkdirp = require("mkdirp"),
  _ = require("lodash"),
  classNameForValue = require("./generate-class-modules").classNameForValue,
  path = require("path");

// TODO also need to write elm.json in that directory.
function writeMain(
  filename /*:string */,
  modules /*: Array<ModuleDeclaration> */
) {
  const contents = generateMain(modules);

  return new Promise(function(resolve, reject) {
    fs.writeFile(filename, contents, function(error) {
      if (error) return reject(error);

      resolve(filename);
    });
  });
}

function generateMain(modules /*: Array<ModuleDeclaration> */) {
  // TODO pass the name of the Stylesheets module where the user defines their
  // css stylesheet mappings in `modules`. Right now we just hardcode the name
  // in the `otherModules` below.
  const otherModules = ["Css", "Css.File", "Platform", "Stylesheets"];
  const imports = otherModules
    .concat(_.map(modules, "name"))
    .map(function(importName) {
      return "import " + importName;
    })
    .join("\n");


  const fileStructure =
    "fileStructure : () -> Css.File.CssFileStructure\n" +
    "fileStructure _ =\n" +
    "    Css.File.toFileStructure <|\n" +
    "        List.map\n" +
    "           (\\(fileName, stylesheets) ->\n" + 
    "               (fileName, Css.File.compile stylesheets)\n" +
    "           )\n" +
    "           Stylesheets.fileStructure";

  const end =
    "port files : Css.File.CssFileStructure -> Cmd msg\n\n\n" +
    "compiler : (Css.File.CssFileStructure -> Cmd Never) -> (() -> Css.File.CssFileStructure) -> Program () () Never\n" +
    "compiler filesPort getStructure =\n" +
    // Note: This must take flags so that `getStructure` is not evaluated on
    // startup. We need it to be delayed by 1 tick so we have a chance for
    // hack-main.js to take effect first!
    "    Platform.worker\n" +
    "        { init = \\flags -> ( (), filesPort (getStructure ()) )\n" +
    "        , update = \\_ _ -> ( (), Cmd.none )\n" +
    "        , subscriptions = \\_ -> Sub.none\n" +
    "        }\n\n\n" +
    "main : Program () () Never\n" +
    "main =\n    compiler files fileStructure\n";

  return ["port module Main exposing (main)", imports, fileStructure, end].join(
    "\n\n\n"
  );
}

function generateStylesheet(modul /*: ModuleDeclaration */) {
  const entries = modul.values.map(function(value) {
    switch (value.signature) {
      case "Css.Snippet":
        return modul.name + "." + value.name;
      case "Css.File.UniqueClass":
        const className = classNameForValue(modul.name, value.name);

        return (
          'classToSnippet "' + className + '" ' + modul.name + "." + value.name
        );
      default:
        throw Error("Unsupported signature " + value.signature);
    }
  });

  return "Css.File.compile [ Css.stylesheet [ " + entries.join(", ") + " ] ]";
}

function generateModule(modul /*: ModuleDeclaration */) {
  const filename = modul.name.replace(".", path.sep) + ".css";
  // ("homepage.css", Css.File.compile[Homepage.css])
  return '( "' + filename + '", ' + generateStylesheet(modul) + " )";
}

module.exports = {
  writeMain: writeMain
};
