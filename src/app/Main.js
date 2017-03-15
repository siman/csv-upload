
import React, {Component} from 'react';
const axios = require('axios');
const moment = require('moment');
const LineNavigator = require('./line-navigator');

import './styles/main.less';

class Main extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      fromNum: 1,
      limit: 20,
      userPage: null,
      totalUsers: null,

      uploading: false,
      hasStats: false,
      elapsedTime: null,
      fileSize: '...',
      progress: 0,
      processedLines: null,
      totalLines: null,

      serverError: null
    };
    this.loadUsers();
  }

  renderUploadingButtons() {
    if (this.state.uploading) {
      return <button className="btn btn-default" onClick={this.onStopUpload}>Stop uploading</button>;
    } else {
      return <button className="btn btn-default" onClick={this.onCsvUpload}>Upload CSV</button>;
    }
  }

  renderProgress() {
    if (this.state.hasStats) {
      return <div>
        <br/>
        <div className="CodeText">File size: <b>{this.state.fileSize}</b> bytes</div>
        <div className="CodeText">Read file on client: <b>{this.state.progress}</b> %</div>
        <div className="CodeText">Elapsed time: {this.state.elapsedTime}</div>
        <div className="CodeText">Lines processed on server: <b>{this.state.processedLines}</b></div>
      </div>;
    }
  }

  renderServerError() {
    if (this.state.serverError) {
      return <div>
        <br/>
        <div className="CodeText">Server error:</div>
        <div className="CodeText" style={{color: 'red'}}>{this.state.serverError}</div>
      </div>;
    }
  }

  renderUserRows() {
    return this.state.userPage.map(u =>
      <tr>
        <td>{u.num}</td>
        <td>{u.firstName}</td>
        <td>{u.lastName}</td>
        <td>{u.email}</td>
      </tr>
    );
  }

  renderUserTableControls() {
    if (this.state.totalUsers > 0) {
      return <div>
        <div>Total users in DB on server: <b>{this.state.totalUsers}</b></div>
        <div style={{paddingBottom: '10px'}}>
          <span style={{paddingRight: '10px'}}>From num:
            <input type="text" style={{width: '100px'}}
                   value={this.state.fromNum} onChange={this.onFromNumChange} />
          </span>
          <span style={{paddingRight: '10px'}}>Limit:
            <input type="text" style={{width: '50px'}}
                   value={this.state.limit} onChange={this.onLimitChange} />
          </span>
          <span style={{paddingRight: '30px'}}>
            <button className="btn btn-default" onClick={this.onLoadUsers}>Show users</button>
          </span>
          <span style={{paddingRight: '10px'}}>
            <button className="btn btn-default" onClick={this.onPrevUsers}>Prev page</button>
          </span>
          <span style={{paddingRight: '10px'}}>
            <button className="btn btn-default" onClick={this.onNextUsers}>Next page</button>
          </span>
        </div>
      </div>;
    }
  }

  renderUserTable() {
    let { userPage } = this.state;
    if (userPage && userPage.length) {
      return <div>
        <table className="table table-condensed table-striped table-hover CodeText" style={{backgroundColor: '#fff'}}>
          <thead>
          <tr>
            <th>Line #</th>
            <th>First name</th>
            <th>Surname</th>
            <th>Email</th>
          </tr>
          </thead>
          <tbody>
          {this.renderUserRows()}
          </tbody>
        </table>
      </div>;
    }
  }

  render() {
    return <div className="row">
      <div className="col-md-4">
        <div style={{paddingBottom: '10px'}}><input type="file" id="file" /></div>
        <div>{this.renderUploadingButtons()}</div>
        <div>{this.renderProgress()}</div>
        <div>{this.renderServerError()}</div>
      </div>
      <div className="col-md-8">
        {this.renderUserTableControls()}
        {this.renderUserTable()}
      </div>
    </div>;
  }

  onFromNumChange = (e) => {
    this.setState({ fromNum: parseInt(e.target.value) });
  };

  onLimitChange = (e) => {
    this.setState({ limit: parseInt(e.target.value) });
  };

  onStopUpload = (e) => {
    this.setState({ uploading: false });
  };

  onCsvUpload = (e) => {
    let files = document.getElementById('file').files;
    if (files.length !== 1) {
      return;
    }
    axios.delete('/api/users')
      .then((res) => this.uploadCsvLines(files[0]));
  };

  onPrevUsers = (e) => {
    let newFromNum = this.state.fromNum - this.state.limit;
    if (newFromNum < 1) {
      newFromNum = 1;
    }
    this.setState({ fromNum: newFromNum }, this.loadUsers);
  };

  onNextUsers = (e) => {
    let newFromNum = this.state.fromNum + this.state.limit;
    if (newFromNum > this.state.totalUsers) {
      newFromNum = this.state.totalUsers - this.state.limit + 1;
    }
    this.setState({ fromNum: newFromNum }, this.loadUsers);
  };

  onLoadUsers = (e) => {
    this.loadUsers();
  };

  loadUsers() {
    let { fromNum, limit } = this.state;
    this.countUsers((totalCount) => {
      if (totalCount > 0) {
        axios.get('/api/users', {params: {fromNum, limit}})
          .then((res) => {
            this.setState({fromNum, limit, userPage: res.data.users});
          });
      }
    });
  }

  countUsers(cb) {
    axios.get('/api/users/count')
      .then((res) => {
        let count = res.data.count;
        this.setState({ totalUsers: count });
        if (cb) cb(count);
      });
  }

  uploadCsvLines(file) {
    let comp = this;
    let navigator = new LineNavigator(file);

    comp.setState({
      hasStats: true,
      uploading: true,
      fileSize: file.size,
      totalLines: null
    });

    const startMs = Date.now();

    let processedLines = 0;
    navigator.readSomeLines(0, function linesReadHandler(err, lineIndex, lines, isEof, progress) {

      if (!comp.state.uploading) {
        return;
      }

      // Error happened
      if (err) throw err;

      comp.setState({ progress });

      // Reading lines
      let linesToSend = [];
      for (var i = 0; i < lines.length; i++) {
        let text = lines[i];
        if (text && typeof text === 'string' && text.indexOf(',') > 0) {
          let num = lineIndex + i + 1;
          //console.log(`Line #${num}:`, text);
          linesToSend.push({ num, text });
        }
      }

      if (linesToSend.length > 0) {
        axios.post('/api/users/csv', { lines: linesToSend })
          .then((res) => {

            // Trigger first load of users.
            if (!comp.state.userPage) {
              comp.loadUsers();
            }
            // Update total count of users in the user table.
            comp.countUsers();

            //console.log('Success from server:', res.data);
            processedLines += linesToSend.length;
            let elapsed = calcElapsedTime(startMs);
            comp.setState({
              elapsedTime: elapsed.humanized,
              processedLines 
            });

            // progress is a position of the last read text as % from whole file length
            // End of file
            if (isEof) {
              comp.setState({ uploading: false });
              return;
            }

            // Reading next chunk, adding number of lines read to first text in current chunk
            navigator.readSomeLines(lineIndex + lines.length, linesReadHandler);
          })
          .catch((err) => {
            console.log('Error from server:', err.message);
            comp.setState({
              uploading: false,
              serverError: 'ERROR: ' + err.message 
            });
          });
      }
    });
  };
}

function calcElapsedTime(startMs) {
  let millis = Date.now() - startMs;
  let duration = moment.duration(millis, 'milliseconds');
  let mins = duration.minutes();
  let secs = duration.seconds();
  let humanized = <span><b>{secs}</b> secs</span>;
  if (mins > 0) {
    humanized = <span><b>{mins}</b> mins {humanized}</span>;
  }
  return { millis, humanized };
}

export default Main;