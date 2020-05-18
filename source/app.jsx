import React from 'react'
//import components and pass to App
import ModTable from './components/table'
import DietChart from './components/dietchart'
import Search from './components/search'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import {Router, Route, Redirect} from 'react-router-dom'
import { createBrowserHistory } from "history";

let history = createBrowserHistory();
class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            val: ''
        }
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(text) {
        this.setState({ val: text })
    }

    render (){
    return (
        <Router history={history}>
            <Search updateTable={this.handleSubmit}/>
            <Tabs defaultActiveKey="general" onSelect={(e)=>history.push(`/${e}`)}t>
                <Tab eventKey="general" title="General"></Tab>
                <Tab eventKey="favorite" title="Favorite"></Tab>
                <Tab eventKey="dietchart" title="Diet Chart"></Tab>
            </Tabs>
            <Route path='/general' component={props=><ModTable {...props} val={this.state.val} filterType='all'/>}/>
            <Route path='/favorite' component={props=><ModTable val={this.state.val} filterType='favorite'/>}/>
            <Route path='/dietchart' component={DietChart} />
            <Redirect from="/" to="/general" />
        </Router>)
    }
}

export default App