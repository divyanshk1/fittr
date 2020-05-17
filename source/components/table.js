import React from 'react'
import fetch from 'node-fetch'


class ModTable extends React.Component {
    constructor(props) {
        super (props)
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

    apiCall(overwrite=false) {
        console.log('calling');
        fetch(`https://diettool.squats.in/v2/appingredients/?filter_type=all&format=api&page=${this.state.currentPage}&search=${this.props.val}`)
            .then(res => res.text())
            .then(this.parseHtmlResponse)
            .then(data => this.setState({ data: overwrite?data:this.state.data.concat(data), currentPage: this.state.currentPage+1}));
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
            let columns = Object.keys(this.state.data[0]).map(col => {
                return {id: col, label: col}
            });
            return <div id="header">
              <table>
                <thead>
                    <tr>
                        {columns.map(col=>
                            <th key={col.id}>{col.label}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {this.state.data.map((item,ind) => 
                        <tr key={item.id+ind}>
                            <td>    
                                <input type='checkbox' name={ind} onChange={this.onCheckBoxChange} />
                            </td>  
                            {columns.map((col) =>  
                                <td key={col.id+ind}>
                                    {item[col.label]}
                                </td>
                            )}
                        </tr>
                    )}
                </tbody>
            </table>
            <button type="button" onClick={this.post}>Post</button>
            </div>
        }
        return <div>Fetching...</div>
    }
}

export default ModTable