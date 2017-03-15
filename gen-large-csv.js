/**
 * Created by siman on 14/03/17.
 */

const fs = require('fs');
const path = require('path');

const MAX_BYTES_1MB = 1024 * 1024;
const MAX_BYTES_10MB = 10 * MAX_BYTES_1MB;
const MAX_BYTES_100MB = 100 * MAX_BYTES_1MB;
const MAX_BYTES_1GB = 1024 * MAX_BYTES_1MB;

function genCsvFile({ fileName, maxBytes, maxLines = 1000, progressEachNLines = 100 }) {

  let filePath = path.join(__dirname, `./gen/${fileName}`);
  try {
    // Delete if present.
    fs.unlinkSync(filePath);
  } catch (ex) { }

  let genBytes = 0;
  let lineNum = 0;

  function shouldContinue() {
    return maxBytes ?
      genBytes < maxBytes :
      lineNum < maxLines
    ;
  }

  while (shouldContinue()) {
    lineNum++;

    let firstName = `First${lineNum}`;
    let lastName = `Last${lineNum}`;
    let email = `${firstName}.${lastName}@gmail.com`.toLowerCase();
    let csvLine = `${firstName}, ${lastName}, ${email}\n`;

    fs.appendFileSync(filePath, csvLine);
    genBytes += csvLine.length;

    // Print progress on each N lines written.
    if (lineNum % progressEachNLines === 0) {
      console.log(`Generated ${lineNum} lines of CSV`);
    }
  }

  console.log(`\n[DONE]\n`);
  console.log(`CSV file: ${path.resolve(filePath)}`);
  console.log(`Size in bytes: ${genBytes}`);
  console.log(`Total lines: ${lineNum}`);
  console.log(``);
}

module.exports = {
  MAX_BYTES_1MB,
  MAX_BYTES_10MB,
  MAX_BYTES_100MB,
  MAX_BYTES_1GB,
  genCsvFile
};