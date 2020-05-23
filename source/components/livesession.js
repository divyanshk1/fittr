import React from 'react'
import fetch from 'node-fetch'
import { Table,Image } from 'react-bootstrap';
import ReactPlayer from 'react-player'



class LiveSessionPage extends React.Component {

  constructor(props) {
    super(props)
    console.log("Loading live session page")
    this.userId = process.env.USERID;
    this.endpoint = "/v6/live_session/list"
    //1?date=1590068314&timezone=Asia/Calcutta&is_mine=0

    this.state = {
      data: []
    },
      this.apiCall = this.apiCall.bind(this)
  }

  apiCall() {
    let baseUrl = 'https://fittr-api.squats.in' + this.endpoint + "/1?";
    baseUrl += "is_mine=0";
    baseUrl += "&date=1590068314";
    baseUrl += "&timezone=Asia/Calcutta";

    let headers = {
      'Authorization': `Bearer ${process.env.AUTHENTICATION_TOKEN}`,
      'Content-Type': 'application/json'
    };

    fetch(baseUrl, {headers: headers})
      .then(res => res.json())
      .then(data => {
        this.setState({ data: data.result.data.session_details });
      });
  }

  componentDidMount() {
    console.log("Live session updated")
    this.apiCall();
  }
  
  render() {
    let columns = ['title', 'image_url', 'start_date_time', 'duration', 'live_recorded_file']
    return <div>
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
  }
}

export default LiveSessionPage