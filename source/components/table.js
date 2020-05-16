import React from 'react'
import fetch from 'node-fetch'


class ModTable extends React.Component {
    constructor(props) {
        super (props)
        this.state = {
            data: '',
            post: {}
        },
        this.onCheckBoxChange = this.onCheckBoxChange.bind(this);
        this.post = this.post.bind(this)
    }

    componentDidMount(){
        fetch('https://diettool.squats.in/v2/appingredients/?filter_type=all&format=api&page=0&search=')
        .then(res => {
            console.log(res.body);
            return res.text()
        })
        .then(this.parseHtmlResponse)
        .then(data=> this.setState({data}))
    }

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
            return <div>
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