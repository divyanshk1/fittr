import React from 'react'
import fetch from 'node-fetch'
import Table from 'react-bootstrap/Table'
import {Col} from 'react-bootstrap'


class DietChart extends React.Component {

    constructor(props) {
        super (props)
        this.columns = ['id','name','carbs','calories','protein','fats'];

        this.state = {
            data: {},
            total: {},
            post: {}
        }
    }
//https://diettool.squats.in/v2/appingredients/?filter_type=${this.props.filterType}&user_id=334079&format=api&page=${this.state.currentPage}&search=${this.props.val}
    apiCall(overwrite=false) {
        let baseUrl = 'https://diettool.squats.in/v2/appdietchart/?format=json';
        let jsonbody = {'params': {
            'date': '2020-05-16',
            'user_id': '59488',
            'timezone':'Asia\/Calcutta',
            'timestamp':'1589728612'
        }}
        let headers = {Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMzM0MDc5IiwiY3JlYXRlZF9hdCI6eyJkYXRlIjoiMjAyMC0wNS0wOCAyMToxMToyMS45MDgzMTIiLCJ0aW1lem9uZV90eXBlIjozLCJ0aW1lem9uZSI6IlVUQyJ9LCJlbWFpbCI6InNoYXNod2F0a21yLjAwMUBnbWFpbC5jb20iLCJwcm92aWRlciI6IkRFRkFVTFQiLCJpc19hZG1pbiI6MCwiaXNfY29hY2giOjAsImxvZ2luX2hpc3RvcnlfaWQiOjg4MzI1MywiaXNfY29ycG9yYXRlX3VzZXIiOjAsImNvcnBvcmF0ZV9pZCI6MH0.bn6sWU_pn2HZtFKq4xuok0r25EFNDnBxYf7rThCYb8I',
        'Content-Type': 'application/json'};

        fetch(baseUrl, {
            headers: headers,
            method: "post",
            body: JSON.stringify(jsonbody)
        })
            .then(res => res.json())
            .then(data => {
                this.setState({data: data.result.data.diet_chart, total: data.result.data.tracker});
            });
    }

    componentDidMount() {
        this.apiCall();
    }

    render() {
        let columns = ['id', 'name', 'carbs', 'fats', 'protein', 'calories', 'quantity', 'unit'];
        let totalColumns = ['carbs', 'fats', 'protein', 'calories'];
        if(this.state.data['breakfast'])
            return <Table><tbody>
                {Object.keys(this.state.data).map((foodtype) => 
                    <tr key={foodtype}>
                        <td>{foodtype}</td>
                        <td>
                        <Table>
                            <thead>
                            <tr>
                                    {columns.map(col => 
                                        <th key={'th'+col}>{col}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.data[foodtype].map(element => 
                                <tr key={element.id}>
                                    {columns.map(col => 
                                        <td key={element.id+col}>{element[col]}</td>
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
                                        <th key={'th'+col}>{col}</th>
                                    )}
                                    </tr></thead>
                                <tbody>
                                <tr>
                                        {totalColumns.map(col => 
                                        <td key={'td'+col}>{this.state.total[col]}</td>
                                    )}
                                </tr>
                                </tbody>
                        </Table></td>
                    </tr>
                </tbody></Table>
        return <div>Fetching...</div>
    }
}

export default DietChart