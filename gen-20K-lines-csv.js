/**
 * Created by siman on 14/03/17.
 */

const gen = require('./gen-large-csv');
gen.genCsvFile({ fileName: '20K-lines.csv', maxLines: 20000 });