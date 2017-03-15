
const db = require('./db');
const bodyParser = require('body-parser');

module.exports = {
  setup: (app) => {

    db.createDb(db.createUsersTable);

    app.use(bodyParser.json());

    app.delete('/api/users', function(req, res) {
      db.deleteAllUsers((err, result) => {
        res.json({ err, result });
      });
    });

    app.get('/api/users/count', function(req, res) {
      db.countAllUsers((err, count) => {
        res.json({ err, count });
      });
    });

    app.get('/api/users', function(req, res) {
      let fromNum = parseInt(req.query.fromNum);
      let limit = parseInt(req.query.limit);
      db.selectUsers(fromNum, limit, (err, users) => {
        res.json({ err, fromNum, limit, users });
      });
    });

    app.post('/api/users/csv', function(req, res) {
      let json = req.body;
      console.log('POST /api/users/csv:', json);
      let users = [];
      json.lines.forEach(line => {
        let { num, text } = line;
        let vals = text.split(',');
        if (vals.length === 3) {
          let firstName = vals[0].trim();
          let lastName = vals[1].trim();
          let email = vals[2].trim();
          users.push({ num, firstName, lastName, email });
        }
      });

      db.insertUsers(users, (err) => {
        res.json({ err, insertedUsers: users.length });
      });
    });
  }
};
