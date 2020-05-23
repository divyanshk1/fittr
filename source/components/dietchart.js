import React from 'react'
import fetch from 'node-fetch'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {getTodayDate} from '../utils'



class DietChart extends React.Component {

  constructor(props) {
    super(props)
    this.foodtypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
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
      this.updateQuantity = this.updateQuantity.bind(this)
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

  updateQuantity(event, item) {
    let foodtype =  event.target.getAttribute("foodtype");

    let oldQuantity = item.quantity;
    let newQuantity = parseInt(document.getElementById(foodtype + 'quantity-'+item.id).value)
    if(Number.isNaN(newQuantity) || newQuantity <= 0) {
      console.log("Invalid quantity added");
      return;
    }

    if(oldQuantity == newQuantity) {
      console.log("Quantity is same: " + oldQuantity);
      return;
    }
    let factor = newQuantity / oldQuantity;

    let copyItem = JSON.parse(JSON.stringify(item));

    copyItem['calories'] =  item.calories * factor;  
    copyItem['carbs'] =  item.carbs * factor;  
    copyItem['protein'] =  item.protein * factor;  
    copyItem['fats'] =  item.fats * factor;  
    copyItem['quantity'] =  newQuantity; 

    let body = {
      params: {
        date: this.date,
        user_id: this.userId,
        diet_chart : {}
      }
    }
    body.params.diet_chart[foodtype] = [copyItem];

    let baseUrl = "https://diettool.squats.in/v2/appstorefooditems/";
    let headers = {
      'Authorization': `Bearer ${process.env.AUTHENTICATION_TOKEN}`,
      'Content-Type': 'application/json'
    };

    fetch(baseUrl, {
      headers: headers,
      method: "post",
      body: JSON.stringify(body)
    })
    .then((res, data) => {
      this.apiCall();
    })
    .catch(error => {
      console.error(error);
    });
  }

  copyChart(event) {
    event.preventDefault();
    let toDate = event.target[0].value;
    let fromDate = this.date;
    let headers = {
      'Authorization': `Bearer ${process.env.AUTHENTICATION_TOKEN}`,
      'Content-Type': 'application/json'
    };
    let url = "https://diettool.squats.in/v2/copychart/";

    let params = {
      params: {
        user_id: this.userId,
        from : fromDate,
        to: toDate
      }
    }
    fetch(url, {
      headers: headers,
      method: "POST",
      body : JSON.stringify(params)
    })
    .then(console.log("Successfully copied"))
    .catch(error => {
      console.error(error);
    });
  }

  render() {
    let columns = ['id', 'name', 'carbs', 'fats', 'protein', 'calories', 'quantity', 'unit'];
    let totalColumns = ['carbs', 'fats', 'protein', 'calories'];
    return <div>
      <div>
      <Form style={{float: "left"}} onSubmit={e => {this.updateState(e);this.apiCall()}}>
        <input style={{width: "110px"}} type="text" name="date" defaultValue={this.date}/>
        <input type="hidden" name="userid" defaultValue={this.userId}/>
        <Button type='submit' size="sm" style={{ width: "50px", marginLeft: "20px" }}>Fetch</Button>
      </Form>

      <Form style={{float: "left", marginLeft: "20px"}} onSubmit={e => {this.copyChart(e)}}>
        <span>Copy To</span>
        <input style={{width: "110px", marginLeft: "20px"}} type="text"/>
        <Button type='submit' size="sm" style={{ width: "60px", marginLeft: "20px" }}>Submit</Button>
      </Form>
      </div>
      <div>
      {this.state.data['breakfast'] &&
        <Table><tbody>
          {this.foodtypes.map((foodtype) =>
            <tr key={foodtype}>
              <td>{foodtype}</td>
              <td>
                <Table>
                  <thead>
                    <tr>
                      <th colSpan="2">Actions</th>
                      {columns.map(col =>
                        <th key={'th' + col}>{col}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.data[foodtype].map(element =>
                      <tr key={element.id}>
                        <td style={{color: "red"}} food_item_id={element.id} foodtype={foodtype} onClick={this.deleteItem}>X</td>
                        <td style={{color: "red"}} foodtype={foodtype} onClick={e => {this.updateQuantity(e, element)}}>update</td>
                        {columns.map(col => 
                          <td key={element.id + col}>{col == "quantity"?<input id={foodtype + 'quantity-' + element.id} defaultValue={element[col]}/>: element[col]}</td>
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
        </div>
  }
}

export default DietChart