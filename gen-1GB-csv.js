/**
 * Created by siman on 14/03/17.
 */

const gen = require('./gen-large-csv');
gen.genCsvFile({ fileName: '1GB.csv', maxBytes: gen.MAX_BYTES_1GB });