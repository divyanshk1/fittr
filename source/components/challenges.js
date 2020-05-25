import React from 'react'
import fetch from 'node-fetch'
import { Table } from 'react-bootstrap';
import Myplayer from './myplayer/myplayer';



class Challenges extends React.Component {

  constructor(props) {
    super(props)
    console.log("Loading live session page")
    this.userId = process.env.USERID;
    this.endpoint = "/v6/client/subgroups"
    this.isApiCallInProgress = false;

    this.state = {
      data: [],
      nextPage: 1
    },
    this.isBottom = this.isBottom.bind(this),
    this.trackScrolling = this.trackScrolling.bind(this),
    this.apiCall = this.apiCall.bind(this)
  }

  apiCall(overwrite = false) {
    if(this.isApiCallInProgress)
      return;
    this.isApiCallInProgress = true;
    let baseUrl = 'https://fittr-api.squats.in' + this.endpoint;
    baseUrl += `/${overwrite ? 1 : this.state.nextPage}?`;
    baseUrl += "is_my_challenges=1&keyword=&video_arr=1";
    let headers = {
      'Authorization': `Bearer ${process.env.AUTHENTICATION_TOKEN}`
    };

    fetch(baseUrl, {headers: headers})
      .then(res => res.json())
      .then(data => { 
        this.setState({ data: overwrite ? data.result.data: this.state.data.concat( data.result.data) });
        if (data.result.data.length) {
          this.setState({ nextPage: overwrite ? 2 : this.state.nextPage + 1 })
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
  
  render() {
    let columns = ['id', 'demo_video', 'title', 'description']
    return <div id="header">
      <div>
      <Table>
        <thead>
          <tr>
              {columns.map(colname => <td key={'headers'+colname}>{colname}</td>)}
          </tr>
        </thead>
        <tbody>
          {this.state.data.map(challenge => 
            <tr post_id={challenge.id} key={challenge.id}>
              {columns.map(colname => <td key={challenge.id+colname}>{colname=='demo_video'? 
              <Myplayer url={challenge.demo_video.video}/>: challenge[colname]}</td>)}
            </tr>
          )}
        </tbody>
      </Table>
      </div>
    </div>
  }
}

export default Challenges