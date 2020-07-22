import React from 'react'
import fetch from 'node-fetch'
import Table from 'react-bootstrap/Table'
import { Col } from 'react-bootstrap'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { getTodayDate } from '../utils'



class ModTable extends React.Component {

  constructor(props) {
    super(props)
    this.columns = ['id', 'name', 'carbs', 'calories', 'protein', 'fats'];
    this.isApiCallInProgress = false;

    this.state = {
      data: [],
      currentPage: 0,
      totalAddedItems: 0,
      post: {}
    },
    this.addItemJson = { diet_chart: {} },
    this.isBottom = this.isBottom.bind(this),
    this.trackScrolling = this.trackScrolling.bind(this),
    this.addItem = this.addItem.bind(this),
    this.post = this.post.bind(this)
  }

  apiCall(overwrite = false) {
    if(this.isApiCallInProgress)
      return;
    this.isApiCallInProgress = true;
    let baseUrl = 'https://diettool.squats.in/v3/appingredients/?';
    baseUrl += `filter_type=${this.props.filterType}&`;
    baseUrl += this.props.filterType == 'favorite' ? `user_id=${process.env.USERID}&` : '';
    baseUrl += 'format=json&';
    baseUrl += `page=${overwrite ? 0 : this.state.currentPage}&`;
    baseUrl += `search=${this.props.val}&`
    let headers = this.props.filterType == 'favorite' ? { Authorization: `Bearer ${process.env.AUTHENTICATION_TOKEN}` } : {};
    fetch(baseUrl, { headers })
      .then(res => res.json())
      .then(data => {
        this.setState({ data: overwrite ? data.result.data.data_list : this.state.data.concat(data.result.data.data_list) })
        if (data.result.data.data_list.length) {
          this.setState({ currentPage: overwrite ? 1 : this.state.currentPage + 1 })
        }
        this.isApiCallInProgress = false;
      });
  }

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  componentDidMount() {
    this.apiCall();
    document.addEventListener('scroll', this.trackScrolling);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling);
  }

  componentDidUpdate(prevProps) {
    if (this.props.val != prevProps.val) this.apiCall(true);
  }

  trackScrolling() {
    const wrappedElement = document.getElementById('header');
    if (this.isBottom(wrappedElement)) {
      this.apiCall()
    }
  };

  post(event) {
    event.preventDefault();
    let date = event.target[0].value;
    let body = {
      params: {
        date: date,
        diet_chart: this.addItemJson.diet_chart,
        user_id: `${process.env.USERID}`
      }
    }

    let baseUrl = "https://diettool.squats.in/v3/appstorefooditems/"
    let headers = {
      Authorization: `Bearer ${process.env.AUTHENTICATION_TOKEN}`,
      'Content-Type': 'application/json'
    };

    fetch(baseUrl, {
      headers: headers,
      method: "post",
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
              });
  }

  addItem(event, item) {
    event.preventDefault();
    let timetype = event.target[0].value;
    let quantity = event.target[1].value;

    let numQuantity = parseInt(quantity)
    if(Number.isNaN(numQuantity) || numQuantity <= 0) {
      return;
    }

    let copyItem = JSON.parse(JSON.stringify(item));
    let factor = quantity / item.quantity;
    copyItem['calories'] =  item.calories * factor;  
    copyItem['carbs'] =  item.carbs * factor;  
    copyItem['protein'] =  item.protein * factor;  
    copyItem['fats'] =  item.fats * factor;  
    copyItem['quantity'] =  quantity; 

        if (!this.addItemJson.diet_chart[timetype])
      this.addItemJson.diet_chart[timetype] = []
    this.addItemJson.diet_chart[timetype].push(copyItem);
    this.setState({totalAddedItems: this.state.totalAddedItems+1})
  }

  render() {
    if (this.state.data.length) {
      return <Col md={12} id="header">
        <div style={{marginTop:"20px"}}>
          <Form onSubmit={this.post}>
            <span style={{marginLeft: "20px"}}>Added Items: {this.state.totalAddedItems}</span>
            <input style={{marginLeft: "20px", paddingLeft: "10px", width: "110px"}} type="text" defaultValue={getTodayDate()} />
            <button style={{marginLeft: "20px"}} type="submit">Submit</button>
          </Form>
        </div>
        <Table>
          <thead>
            <tr>
              <th></th><th></th>
              {this.columns.map(col =>
                <th key={col}>{col}</th>
              )}
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map((item, ind) =>
              <tr key={item.id + ind}>
                <td key={item.id+ind+'form'}>
                  <Form onSubmit={event => this.addItem(event, item)}>
                    <Form.Control as="select" style={{width: "130px"}}>
                      <option name="breakfast" value="breakfast">Breakfast</option>
                      <option name="lunch" value="lunch">Lunch</option>
                      <option name="snacks" value="snacks">Snacks</option>
                      <option name="dinner" value="dinner">Dinner</option>
                    </Form.Control>
                    <input style={{ width: "60px", marginTop: "10px" }} type="text"></input>
                    <Button type='submit' size="sm" style={{ width: "60px", marginLeft: "10px" }}>Add</Button>
                  </Form>
                </td>
                <td>{ind + 1}</td>
                {this.columns.map((col) =>
                  <td key={col + ind}>
                    {item[col]}
                  </td>
                )}
                <td>{item['quantity'] + ' ' + item['unit']}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Col>
    }
    return <div>Fetching...</div>
  }
}

export default ModTable