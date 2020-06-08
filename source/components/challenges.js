import React from 'react'
import fetch from 'node-fetch'
import { Table, Form, Button } from 'react-bootstrap';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Myplayer from './myplayer/myplayer';
import Leaderboard from './leaderboard'



class Challenges extends React.Component {

  constructor(props) {
    super(props)
    this.userId = process.env.USERID;
    this.endpoint = "/v6/client/subgroups"
    this.isApiCallInProgress = false;

    this.state = {
      data: [],
      nextPage: 1,
      tabs: []
    },
      this.isBottom = this.isBottom.bind(this),
      this.trackScrolling = this.trackScrolling.bind(this),
      this.apiCall = this.apiCall.bind(this)
      this.addLeaderboardTab = this.addLeaderboardTab.bind(this)
  }

  apiCall(overwrite = false) {
    if (this.isApiCallInProgress)
      return;
    this.isApiCallInProgress = true;
    let baseUrl = 'https://fittr-api.squats.in' + this.endpoint;
    baseUrl += `/${overwrite ? 1 : this.state.nextPage}?`;
    baseUrl += "is_my_challenges=1&keyword=&video_arr=1";
    let headers = {
      'Authorization': `Bearer ${process.env.AUTHENTICATION_TOKEN}`
    };

    fetch(baseUrl, { headers: headers })
      .then(res => res.json())
      .then(data => {
        this.setState({ data: overwrite ? data.result.data : this.state.data.concat(data.result.data) });
        if (data.result.data.length) {
          this.setState({ nextPage: overwrite ? 2 : this.state.nextPage + 1 })
        }
        this.isApiCallInProgress = false;
      });
  }

  componentDidMount() {
    document.addEventListener('scroll', this.trackScrolling);
    this.apiCall();
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling);
  }

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  trackScrolling() {
    const wrappedElement = document.getElementById('header');
    if (this.isBottom(wrappedElement)) {
      this.apiCall()
    }
  };

  addLeaderboardTab(id) {
    console.log('challengeid: ' + id);
    this.setState({tabs: this.state.tabs.concat(id)})
  }

  render() {
    let columns = ['demo_video', 'title', 'description']
    return <div key='challenges-div' id="header">
      <Tabs defaultActiveKey="general">
        <Tab eventKey="general" title="General">
          <Table>
            <thead>
              <tr>
                <th key='headersid'>id</th>
                {columns.map(colname => <th key={'headers' + colname}>{colname}</th>)}
              </tr>
            </thead>
            <tbody>
              {this.state.data.map(challenge =>
                <tr post_id={challenge.id} key={challenge.id}>
                  <td key={challenge.id + 'id'}><Button type="button" onClick={() => this.addLeaderboardTab(challenge.id)}>{challenge.id}</Button></td>
                  {columns.map(colname => <td key={challenge.id + colname}>{colname == 'demo_video' ?
                    <Myplayer url={challenge.demo_video.video} /> : challenge[colname]}</td>)}
                </tr>
              )}
            </tbody>
          </Table>
        </Tab>
        {this.state.tabs.map(id => <Tab eventKey="temporary" title="Temporary"><Leaderboard id={id} /></Tab>)}
      </Tabs>
    </div>
  }
}

export default Challenges