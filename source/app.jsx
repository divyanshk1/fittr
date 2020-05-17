import React from 'react'
//import components and pass to App
import ModTable from './components/table'
import Search from './components/search'

class App extends React.Component {
    constructor(props){
        super(props)
        this.state={
            val: ''
        }
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(text){
        this.setState({val:text})
    }

    render (){
    return (
        <div>
            <Search updateTable={this.handleSubmit}/>
            <ModTable val={this.state.val}/>
        </div>)
    }
}

export default App