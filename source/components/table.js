import React from 'react'
import fetch from 'node-fetch'
import Table from 'react-bootstrap/Table'
import { Col } from 'react-bootstrap'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
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
    let baseUrl = 'https://diettool.squats.in/v2/appingredients/?';
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
    console.log('component mount')
    this.apiCall();
    document.addEventListener('scroll', this.trackScrolling);
  }

  componentWillUnmount() {
    console.log(`Removing event listener from ${this.props.filterType}`)
    document.removeEventListener('scroll', this.trackScrolling);
  }

  componentDidUpdate(prevProps) {
    console.log('component update')
    if (this.props.val != prevProps.val) this.apiCall(true);
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

  post() {
    let body = {
      params: {
        date: getTodayDate(),
        diet_chart: this.addItemJson.diet_chart,
        user_id: `${process.env.USERID}`
      }
    }

    let baseUrl = "https://diettool.squats.in/v2/appstorefooditems/"
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
        console.log(JSON.stringify(data))
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
    copyItem['foodAddedMap'] = {};
    let factor = quantity / item.quantity;
    copyItem['foodAddedMap'][timetype] = {
      calories: item.calories * factor,
      carbs: item.carbs * factor,
      protein: item.protein * factor,
      fats: item.fats * factor,
      isSelected: true,
      quantity: quantity,
      tagType: timetype
    };
    copyItem['calories'] =  item.calories * factor;  
    copyItem['carbs'] =  item.carbs * factor;  
    copyItem['protein'] =  item.protein * factor;  
    copyItem['fats'] =  item.fats * factor;  
    copyItem['quantity'] =  quantity; 

    console.log(JSON.stringify(copyItem));
    if (!this.addItemJson.diet_chart[timetype])
      this.addItemJson.diet_chart[timetype] = []
    this.addItemJson.diet_chart[timetype].push(copyItem);
    this.setState({totalAddedItems: this.state.totalAddedItems+1})
  }

  render() {
    if (this.state.data.length) {
      return <Col md={12} id="header">
        <div><button type="button" onClick={this.post}>Submit</button><span style={{marginLeft: "20px"}}>Added Items: {this.state.totalAddedItems}</span></div>
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
                <td>
                  <Form onSubmit={event => this.addItem(event, item)}>
                    <Form.Control as="select">
                      <option name="breakfast" value="breakfast">Breakfast</option>
                      <option name="lunch" value="lunch">Lunch</option>
                      <option name="snacks" value="snacks">Snacks</option>
                      <option name="dinner" value="dinner">Dinner</option>
                    </Form.Control>
                    <input style={{ width: "50px", marginTop: "10px" }} type="text"></input>
                    <Button type='submit' size="sm" style={{ width: "20px", marginLeft: "20px" }}>+</Button>
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