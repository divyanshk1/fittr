import React from 'react'
import fetch from 'node-fetch'
import Table from 'react-bootstrap/Table'
import {Col} from 'react-bootstrap'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button';



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
        this.addItem = this.addItem.bind(this)
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
        console.log('componenet mount')
        this.apiCall();
        // document.addEventListener('scroll', this.trackScrolling);
    }

    componentDidUpdate(prevProps) {
        console.log('componenet update')
        if(this.props.val != prevProps.val) this.apiCall(true);
    }

    trackScrolling() {
        console.log('componenet scroll')
        const wrappedElement = document.getElementById('header');
        if (this.isBottom(wrappedElement)) {
            console.log('header bottom reached');
            if(this.state.currentPage <= 3)
                this.apiCall()
            else {
                document.removeEventListener('scroll');
            }
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

    addItem(event) {
        event.preventDefault();
        let target = event.target[0].eventKey;
        console.log(target)
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
                                <form onSubmit={this.addItem}>
                                <DropdownButton size="sm" id={'dropdown-basic-button-'+ind} title="Time">
                                    <Dropdown.Item name="breakfast" eventKey="breakfast">Breakfast</Dropdown.Item>
                                    <Dropdown.Item name="lunch" eventKey="lunch">Lunch</Dropdown.Item>
                                    <Dropdown.Item name="snacks" eventKey="snacks">Snacks</Dropdown.Item>
                                    <Dropdown.Item name="dinner" eventKey="dinner">Dinner</Dropdown.Item>
                                </DropdownButton>
                                <input style={{width: "50px", marginTop:"10px"}} type="text" onBlur={this.updateAddFood}></input>
                                <Button type='submit' size="sm" style={{width: "20px", marginLeft: "20px"}}>+</Button>
                                </form>
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