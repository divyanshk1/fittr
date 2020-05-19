import React from 'react'
import fetch from 'node-fetch'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {getTodayDate} from '../utils'



class DietChart extends React.Component {

  constructor(props) {
    super(props)
    this.columns = ['id', 'name', 'carbs', 'calories', 'protein', 'fats'];
    this.userId = process.env.USERID;
    this.date = getTodayDate();

    this.state = {
      data: {},
      total: {},
      post: {}
    },
      this.apiCall = this.apiCall.bind(this)
      this.deleteItem = this.deleteItem.bind(this)
      this.updateState = this.updateState.bind(this)
  }

  updateState(event) {
    event.preventDefault();
    this.date = event.target[0].value;
    this.userId = event.target[1].value;
  }

  apiCall() {
    let baseUrl = 'https://diettool.squats.in/v2/appdietchart/?format=json';
    let jsonbody = {
      'params': {
        'date': this.date,
        'user_id': this.userId,
        'timezone': 'Asia\/Calcutta',
        'timestamp': '1589728612'
      }
    }
    let headers = {
      'Authorization': `Bearer ${process.env.AUTHENTICATION_TOKEN}`,
      'Content-Type': 'application/json'
    };

    fetch(baseUrl, {
      headers: headers,
      method: "post",
      body: JSON.stringify(jsonbody)
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ data: data.result.data.diet_chart, total: data.result.data.tracker });
      });
  }

  deleteItem(event) {
    let foodtype = event.target.getAttribute("foodtype");
    let food_item_id = event.target.getAttribute("food_item_id");
    let baseUrl = "https://diettool.squats.in/v2/delete/";
    let jsonbody = {
      'params': {
        'date': this.date,
        'user_id': this.userId,
        'day_type': foodtype,
        'food_item_id': parseInt(food_item_id)
      }
    }
    let headers = {
      'Authorization': `Bearer ${process.env.AUTHENTICATION_TOKEN}`,
      'Content-Type': 'application/json'
    };

    fetch(baseUrl, {
      headers: headers,
      method: "post",
      body: JSON.stringify(jsonbody)
    })
    .then((res, data) => {
      this.apiCall();
    })
    .catch(error => {
      console.error(error);
    });
  }

  render() {
    let columns = ['id', 'name', 'carbs', 'fats', 'protein', 'calories', 'quantity', 'unit'];
    let totalColumns = ['carbs', 'fats', 'protein', 'calories'];
    return <div>
      <Form onSubmit={e => {this.updateState(e);this.apiCall()}}>
        <input type="text" name="date" defaultValue={this.date}/>
        <input type="text" name="userid" defaultValue={this.userId}/>
        <Button type='submit' size="sm" style={{ width: "50px", marginLeft: "20px" }}>Fetch</Button>
      </Form>
      {this.state.data['breakfast'] &&
        <Table><tbody>
          {Object.keys(this.state.data).map((foodtype) =>
            <tr key={foodtype}>
              <td>{foodtype}</td>
              <td>
                <Table>
                  <thead>
                    <tr>
                      <th></th>
                      {columns.map(col =>
                        <th key={'th' + col}>{col}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.data[foodtype].map(element =>
                      <tr key={element.id}>
                        <td style={{color: "red"}} food_item_id={element.id} foodtype={foodtype} onClick={this.deleteItem}>X</td>
                        {columns.map(col =>
                          <td key={element.id + col}>{element[col]}</td>
                        )}
                      </tr>
                    )}
                  </tbody>
                </Table>
              </td>
            </tr>
          )}
          <tr><td>Total</td>
            <td><Table>
              <thead><tr>
                {totalColumns.map(col =>
                  <th key={'th' + col}>{col}</th>
                )}
              </tr></thead>
              <tbody>
                <tr>
                  {totalColumns.map(col =>
                    <td key={'td' + col}>{this.state.total[col]}</td>
                  )}
                </tr>
              </tbody>
            </Table></td>
          </tr>
        </tbody></Table>}</div>
  }
}

export default DietChart