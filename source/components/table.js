import React from 'react'
import fetch from 'node-fetch'
import Table from 'react-bootstrap/Table'
import {Col} from 'react-bootstrap'
import { filter } from 'minimatch'
import { format } from 'util'


class ModTable extends React.Component {

    constructor(props) {
        super (props)
        this.columns = ['id','name','carbs','calories','protein','fats'];

        this.state = {
            data: [],
            currentPage: 0,
            post: {}
        },
        this.onCheckBoxChange = this.onCheckBoxChange.bind(this);
        this.post = this.post.bind(this)
        this.isBottom = this.isBottom.bind(this)
        this.trackScrolling = this.trackScrolling.bind(this)
    }
//https://diettool.squats.in/v2/appingredients/?filter_type=${this.props.filterType}&user_id=334079&format=api&page=${this.state.currentPage}&search=${this.props.val}
    apiCall(overwrite=false) {
        let baseUrl = 'https://diettool.squats.in/v2/appingredients/?';
        baseUrl+= `filter_type=${this.props.filterType}&`;
        baseUrl+= this.props.filterType=='favorite'?'user_id=334079&':'';
        baseUrl+= 'format=json&';
        baseUrl+= `page=${overwrite?0:this.state.currentPage}&`;
        baseUrl+= `search=${this.props.val}&`
        let headers = this.props.filterType=='favorite'?{Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMzM0MDc5IiwiY3JlYXRlZF9hdCI6eyJkYXRlIjoiMjAyMC0wNS0wOCAyMToxMToyMS45MDgzMTIiLCJ0aW1lem9uZV90eXBlIjozLCJ0aW1lem9uZSI6IlVUQyJ9LCJlbWFpbCI6InNoYXNod2F0a21yLjAwMUBnbWFpbC5jb20iLCJwcm92aWRlciI6IkRFRkFVTFQiLCJpc19hZG1pbiI6MCwiaXNfY29hY2giOjAsImxvZ2luX2hpc3RvcnlfaWQiOjg4MzI1MywiaXNfY29ycG9yYXRlX3VzZXIiOjAsImNvcnBvcmF0ZV9pZCI6MH0.bn6sWU_pn2HZtFKq4xuok0r25EFNDnBxYf7rThCYb8I'}:{};
        fetch(baseUrl,{headers})
            .then(res => res.json())
            .then(data => {
                if(data.result.data.data_list.length) this.setState({ data: overwrite?data:this.state.data.concat(data.result.data.data_list), currentPage: overwrite?1:this.state.currentPage+1})
            });
    }

    isBottom(el) {
        return el.getBoundingClientRect().bottom <= window.innerHeight;
    }

    componentDidMount() {
        this.apiCall();
        document.addEventListener('scroll', this.trackScrolling);
    }

    componentDidUpdate(prevProps) {
        if(this.props.val != prevProps.val) this.apiCall(true);
    }

    trackScrolling() {
        const wrappedElement = document.getElementById('header');
        if (this.isBottom(wrappedElement)) {
            console.log('header bottom reached');
            this.apiCall()
        }
    };

    parseHtmlResponse(html){

        let parseText = text => {
            let obj = {};
            text.replace(/&quot;/g,'').trim().split('\n').forEach(line=>{
                let ind = line.indexOf(':');
                obj[line.slice(0,ind).trim()] = line.slice(ind+1).trim();
            })
            return obj;
        }

        let data = html.split('data_list')[1].split('</pre>')[0];
        let arr = [];
        while(data.indexOf('{') > 0) {
            let text = data.slice(data.indexOf('{')+1,data.indexOf('}'))
            arr.push(parseText(text));
            data = data.slice(data.indexOf('}')+1);
        }
        return arr;
    }

    onCheckBoxChange(event) {
        const target = event.target;
        const name = target.name;
        let post = this.state.post
        if(!target.checked) delete post[name];
        else post[name] = this.state.data[name];
        this.setState({
            ...this.state,post
        })
    }

    post(event){
        event.preventDefault();
        for (let key in this.state.post) {
            fetch('url', {
                method: "post",
                body: JSON.stringify(this.state.post[key])
            })
        }
    }

    render() {
        if(this.state.data.length) {
            return <Col md={12} id="header">
              <Table>
                <thead>
                    <tr>
                        <th></th><th></th>
                        {this.columns.map(col=>
                            <th key={col}>{col}</th>
                        )}
                        <th>Qty</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.data.map((item,ind) => 
                        <tr key={item.id+ind}>
                            <td>    
                                <input type='checkbox' name={ind} onChange={this.onCheckBoxChange} />
                            </td>  
                            <td>{ind+1}</td>
                            {this.columns.map((col) =>  
                                <td key={col+ind}>
                                    {item[col]}
                                </td>
                            )}
                            <td>{item['quantity']+' '+item['unit']}</td>
                        </tr>
                    )}
                </tbody>
            </Table>
            <button type="button" onClick={this.post}>Post</button>
            </Col>
        }
        return <div>Fetching...</div>
    }
}

export default ModTable