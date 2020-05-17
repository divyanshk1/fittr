import React from 'react'
//import components and pass to App
import ModTable from './components/table'
import DietChart from './components/dietchart'
import Search from './components/search'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

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
            <Tabs defaultActiveKey="general">
                <Tab eventKey="general" title="General">
                    <ModTable val={this.state.val} filterType='all'/>
                </Tab>
                <Tab eventKey="favorite" title="Favorite">
                    <ModTable val={this.state.val} filterType='favorite'/>
                </Tab>
                <Tab eventKey="dietchart" title="Diet Chart">
                    <DietChart/>
                </Tab>
            </Tabs>
        </div>)
    }
}

export default App