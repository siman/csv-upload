process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../prod-server');
let should = chai.should();

chai.use(chaiHttp);

const csvLines = [
  {num: 1, text: 'F1,L1,e1@gmail.com'},
  {num: 2, text: 'F2,L2,e2@gmail.com'},
  {num: 3, text: 'F3,L3,e3@gmail.com'}
];

function resShouldBeOKAndWithoutErrors(err, res) {
  console.log(`err`, err);
  //console.log(`res`, res);
  res.should.have.status(200);
  should.not.exist(res.body.err);
}

describe('CSV upload', () => {

  // Before each test we delete all users from DB:
  beforeEach((done) => {
    chai.request(server)
      .delete('/api/users')
      .end((err, res) => {
        resShouldBeOKAndWithoutErrors(err, res);
        done();
      });
  });

  describe('POST /api/users/csv', () => {

    it('it should insert 3 users into DB', (done) => {
      chai.request(server)
        .post('/api/users/csv')
        .send({ lines: csvLines })
        .end((err, res) => {
          resShouldBeOKAndWithoutErrors(err, res);
          res.body.insertedUsers.should.be.eql(csvLines.length);

          // Total user count should be equal to the number of inserted lines:
          chai.request(server)
            .get('/api/users/count')
            .end((err, res) => {
              resShouldBeOKAndWithoutErrors(err, res);
              res.body.count.should.be.eql(csvLines.length);

              done();
            });
        });
    });
  });

  describe('GET /api/users', () => {

    it('it should return no users if there were no insertions', (done) => {
      chai.request(server)
        .get('/api/users?fromNum=1&limit=10')
        .end((err, res) => {
          resShouldBeOKAndWithoutErrors(err, res);

          const users = res.body.users;
          users.should.be.a('array');
          users.length.should.be.eql(0);

          done();
        });
    });

    it('it should find users from num 2, limit 3 (after inserting 3 users)', (done) => {

      // Insert 3 users from CSV lines:
      chai.request(server)
        .post('/api/users/csv')
        .send({ lines: csvLines })
        .end((err, res) => {
          resShouldBeOKAndWithoutErrors(err, res);

          // Find 2 users out of 3 in DB:
          chai.request(server)
            .get('/api/users?fromNum=2&limit=3')
            .end((err, res) => {
              resShouldBeOKAndWithoutErrors(err, res);

              const users = res.body.users;
              users.should.be.a('array');
              users.length.should.be.eql(2);
              
              users[0].num.should.be.eql(2);
              users[0].firstName.should.be.eql('F2');
              users[0].lastName.should.be.eql('L2');
              users[0].email.should.be.eql('e2@gmail.com');

              users[1].num.should.be.eql(3);
              users[1].firstName.should.be.eql('F3');
              users[1].lastName.should.be.eql('L3');
              users[1].email.should.be.eql('e3@gmail.com');

              done();
            });
        });
    });
  });
});
