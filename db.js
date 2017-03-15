/**
 * Created by siman on 14/03/17.
 */

let sqlite3 = require('sqlite3').verbose();
let db;

function createDb(onDbCreatedFn) {
  if (process.env.NODE_ENV === 'test') {
    createDbInMemory(onDbCreatedFn);
  } else {
    createDbInFile(onDbCreatedFn); // Inserting users to in file DB is veeeery slooow. About 30 ops/s.
    //createDbInMemory(onDbCreatedFn); // Insert into memory is a way faster.
  }
}

function createDbInFile(onDbCreatedFn) {
  console.log("Create SQLite3 DB in file");
  db = new sqlite3.Database('./db/users.sqlite3', onDbCreatedFn);
}

function createDbInMemory(onDbCreatedFn) {
  console.log("Create SQLite3 DB in memory");
  db = new sqlite3.Database(':memory:', onDbCreatedFn);
}

function createUsersTable(onTableCreated) {
  console.log("Create table 'users'");
  db.run(
    "CREATE TABLE IF NOT EXISTS users (" +
    "num INTEGER PRIMARY KEY, " +
    "firstName TEXT NOT NULL, " +
    "lastName TEXT NOT NULL, " +
    "email TEXT NOT NULL" +
    ")",
    [],
    onTableCreated
  );
}

function insertUsers(users, onUsersInsertedFn) {
  //console.log(`Insert ${users.length} users`);
  let stmt = db.prepare("INSERT OR IGNORE INTO users VALUES (?,?,?,?)");

  users.forEach((user) => {
    let { num, firstName, lastName, email } = user;
    stmt.run([num, firstName, lastName, email]);
  });

  stmt.finalize(onUsersInsertedFn);
}

function countAllUsers(onUsersCountedFn) {
  console.log("Count all users");
  db.get("SELECT count(*) AS count FROM users", function(err, row) {
    let count = row.count;
    console.log("Total user count: " + count);
    onUsersCountedFn(null, count);
  });
}

function selectUsers(fromNum, limit, onUsersSelectedFn) {
  console.log(`Select users from num ${fromNum}, limit ${limit}`);
  db.all(
    "SELECT * FROM users WHERE num >= ? LIMIT ?",
    [fromNum, limit],
    onUsersSelectedFn
  );
}

function deleteAllUsers(onDeletedFn) {
  console.log("Delete all users");
  db.run("DELETE FROM users", [], onDeletedFn);
}

function closeDb(onDbClosed) {
  console.log("Close DB");
  db.close(onDbClosed);
}

module.exports = {
  createDb,
  createDbInFile,
  createDbInMemory,
  createUsersTable,

  insertUsers,
  countAllUsers,
  selectUsers,
  deleteAllUsers,

  closeDb
};
