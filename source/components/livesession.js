import React from 'react'
import fetch from 'node-fetch'
import { Table } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ReactPlayer from 'react-player'
import { getTodayDate } from '../utils';



class LiveSessionPage extends React.Component {

  constructor(props) {
    super(props)
    console.log("Loading live session page")
    this.userId = process.env.USERID;
    this.endpoint = "/v6/live_session/list"
    this.isApiCallInProgress = false;
    this.date = getTodayDate();

    this.state = {
      data: [],
      nextPage: 1
    },
    this.isBottom = this.isBottom.bind(this),
    this.trackScrolling = this.trackScrolling.bind(this),
    this.apiCall = this.apiCall.bind(this)
    this.fetchSessionsOnDate = this.fetchSessionsOnDate.bind(this)
  }

  apiCall(overwrite = false) {
    if(this.isApiCallInProgress)
      return;
    this.isApiCallInProgress = true;
    let baseUrl = 'https://fittr-api.squats.in' + this.endpoint;
    baseUrl += '/' + this.state.nextPage + '?';
    // baseUrl += "is_mine=0";
    if(this.date != '')
      baseUrl += "&date=" + Date.parse(this.date)/1000;
    // baseUrl += "&timezone=Asia/Calcutta";

    let headers = {
      'Authorization': `Bearer ${process.env.AUTHENTICATION_TOKEN}`,
      'Content-Type': 'application/json'
    };

    fetch(baseUrl, {headers: headers})
      .then(res => res.json())
      .then(data => { 
        this.setState({ data: overwrite ? data.result.data.session_details: this.state.data.concat( data.result.data.session_details) });
        if (data.result.data.session_details.length) {
          this.setState({ nextPage: overwrite ? 1 : this.state.nextPage + 1 })
        }
        this.isApiCallInProgress = false;
      });
  }

  componentDidMount() {
    console.log("Live session updated")
    document.addEventListener('scroll', this.trackScrolling);
    this.apiCall();
  }

  componentWillUnmount() {
    console.log(`Removing event listener from ${this.props.filterType}`)
    document.removeEventListener('scroll', this.trackScrolling);
  }

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  trackScrolling() {
    console.log('component scroll')
    const wrappedElement = document.getElementById('header');
    if (this.isBottom(wrappedElement)) {
      console.log('header bottom reached');
      console.log("Making API call");
      this.apiCall()
    }
  };

  fetchSessionsOnDate(event) {
    event.preventDefault();
    let date = event.target[0].value;
    this.date = date;
    this.apiCall(true);
  }
  
  render() {
    let columns = ['title', 'image_url', 'start_date_time', 'duration', 'live_recorded_file']
    return <div id="header">
      <div>
      <Form style={{float: "left"}} onSubmit={this.fetchSessionsOnDate}>
        <input style={{width: "110px"}} type="text" name="date" defaultValue={this.date}/>
        <Button type='submit' size="sm" style={{ width: "50px", marginLeft: "20px" }}>Fetch</Button>
      </Form>
      </div>
      <div>
      <Table>
        <thead>
          <tr>
              {columns.map(colname => <td key={'headers'+colname}>{colname}</td>)}
          </tr>
        </thead>
        <tbody>
          {this.state.data.map(session_detail => 
            <tr post_id={session_detail.post_id} key={session_detail.session_id}>
              {columns.map(colname => <td key={session_detail.session_id+colname}>{colname=='image_url'? 
              <img style={{height:"200px", width:"180px"}} src={session_detail[colname]}/>: 
              colname == 'live_recorded_file' ? 
              <ReactPlayer url={session_detail[colname]}/>:
              session_detail[colname]}</td>)}
            </tr>
          )}
        </tbody>
      </Table>
      </div>
    </div>
  }
}

export default LiveSessionPage