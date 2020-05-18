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

    this.state = {
      data: {},
      total: {},
      post: {}
    },
      this.apiCall = this.apiCall.bind(this)
  }

  apiCall(event) {
    event.preventDefault();
    let date = event.target[0].value;
    let userId = event.target[1].value;
    let baseUrl = 'https://diettool.squats.in/v2/appdietchart/?format=json';
    let jsonbody = {
      'params': {
        'date': date,
        'user_id': userId,
        'timezone': 'Asia\/Calcutta',
        'timestamp': '1589728612'
      }
    }
    console.log(jsonbody);
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
        console.log(JSON.stringify(data));
        this.setState({ data: data.result.data.diet_chart, total: data.result.data.tracker });
      });
  }

  render() {
    let columns = ['id', 'name', 'carbs', 'fats', 'protein', 'calories', 'quantity', 'unit'];
    let totalColumns = ['carbs', 'fats', 'protein', 'calories'];
    return <div>
      <Form onSubmit={this.apiCall}>
        <input type="text" name="date" defaultValue={getTodayDate()}/>
        <input type="text" name="userid" />
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
                      {columns.map(col =>
                        <th key={'th' + col}>{col}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.data[foodtype].map(element =>
                      <tr key={element.id}>
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