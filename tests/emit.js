var assert = require("chai").assert;
var path = require("path");
var emitter = require(path.join(__dirname, ".."));
var fs = require("fs/promises");

var fixturesDir = path.join(__dirname, "fixtures");

describe("emitting", function () {
  it("works with HomepageCss.elm", async function () {
    // Use an epic timeout, because Travis on Linux is SO SLOW.
    this.timeout(6000000);

    var projectDir = path.join(__dirname, "..", "examples");
    // var srcFile = path.join(projectDir, "src", "Stylesheets.elm");
    var outputDir = __dirname;

    try {
      await emitter(projectDir, outputDir);
    } catch (error) {
      console.error("Error occurred:", error);
      assert.fail();
    }

    const expectedFile = path.join(fixturesDir, "homepage-compiled.css");
    const actualFile = path.join(outputDir, "homepage.css");

    const expected = await fs.readFile(expectedFile, { encoding: "utf8" });
    const actual = await fs.readFile(actualFile, { encoding: "utf8" });

    try {
      assert.strictEqual(expected, actual);
    } catch (error) {
      console.error("Assertion failed. Differences:");
      console.error("Expected file:", expectedFile);
      console.error("Actual file:", actualFile);
      console.error(
        "First 100 characters of expected:",
        expected.substring(0, 100)
      );
      console.error(
        "First 100 characters of actual:",
        actual.substring(0, 100)
      );
      throw error;
    }

    return;
  });
});
