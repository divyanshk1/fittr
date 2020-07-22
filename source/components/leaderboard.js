import React from 'react'
import fetch from 'node-fetch'
import { Table, Form, Button } from 'react-bootstrap';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Myplayer from './myplayer/myplayer';



class Leaderboard extends React.Component {

  constructor(props) {
    super(props)
        this.userId = process.env.USERID;
    this.endpoint = `/v6/client/list_media/2`
    this.isApiCallInProgress = false;

    this.state = {
      data: [],
      nextPage: 1,
      searchText: ''
    },
      this.isBottom = this.isBottom.bind(this),
      this.trackScrolling = this.trackScrolling.bind(this),
      this.apiCall = this.apiCall.bind(this)
      this.searchPost = this.searchPost.bind(this)
  }

  apiCall(overwrite = false) {
    if (this.isApiCallInProgress)
      return;
    this.isApiCallInProgress = true;
    let baseUrl = 'https://fittr-api.squats.in' + this.endpoint;
    baseUrl += `/${overwrite ? 1 : this.state.nextPage}`;
        baseUrl += `?challenge_id=${this.props.id}&search_text=${this.state.searchText}&is_approved=false`
    let headers = {
      'Authorization': `Bearer ${process.env.AUTHENTICATION_TOKEN}`
    };

    fetch(baseUrl, { headers: headers })
      .then(res => res.json())
      .then(data => {
                this.setState({ data: overwrite ? data.result.data.posts : this.state.data.concat(data.result.data.posts) });
        if (data.result.data.posts.length) {
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

  searchPost(event) {
    event.preventDefault()
    let target = event.target[0].value;
    this.setState({searchText : target})
        this.apiCall(true);  
  }

  render() {
    let columns = ['post_label', 'user_id']
    return <div id="header">
      <div>
      <Form style={{float: "left"}} onSubmit={this.searchPost}>
        <input style={{width: "110px"}} type="text"/>
        <Button type='submit' size="sm" style={{ width: "50px", marginLeft: "20px" }}>Fetch</Button>
      </Form>
      </div>
      <div>
      <Table>
            <thead>
              <tr key='leaderboardtr'>
                {columns.map(colname => <th key={'headers' + colname}>{colname}</th>)}
                <th key={'headersname'}>name</th>
                <th key={'headersemail'}>email</th>
                <th key={'headersage'}>age</th>
                <th key={'headersvideo'}>video_url</th>
              </tr>
            </thead>
            <tbody key='leaderboardtbody'>
              {this.state.data.map(post =>
                <tr post_id={post.id} key={post.id}>
                  {columns.map(colname => <td key={post.id + colname}>{post[colname]}</td>)}
                  <td key={post.id + 'name'}>{post.user_profile.name}</td>
                  <td key={post.id + 'email'}>{post.user_profile.email}</td>
                  <td key={post.id + 'age'}>{post.user_profile.age}</td>
                  <td key={post.id + 'video_url'}><Myplayer url={post.video_urls[0].video} image_url={post.video_urls[0].cover_image}/></td>
                </tr>
              )}
            </tbody>
          </Table>
          </div>
    </div>
  }
}

export default Leaderboard