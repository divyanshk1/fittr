import React from 'react'
import fetch from 'node-fetch'


class Search extends React.Component {
    constructor(props) {
        super (props)
        this.submitForm = this.submitForm.bind(this)
    }

    submitForm(event){
        event.preventDefault()
        let target = event.target[0].value;
        console.log(target);
        this.props.updateTable(target);
    }

    render() {
        return <form onSubmit={this.submitForm}>
            <input name="searchbox" type="text" class="search" placeholder="Search"></input>
            <button type='submit'>Search</button>
        </form>
    }
}

export default Search