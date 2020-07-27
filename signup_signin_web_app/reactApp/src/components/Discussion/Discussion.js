import React, {Component} from "react";
import {Button} from "react-bootstrap";
import { useHistory } from 'react-router-dom';
import {withRouter} from "react-router-dom";
import Axios from "axios";
import moment from "moment";

class Discussion extends Component {
    constructor(props){
        super(props);
        this.redirect = this.redirect.bind(this)
        this.startChat = this.startChat.bind(this)
        this.continueChat = this.continueChat.bind(this)
        this.generateButton = this.generateButton.bind(this)
        this.emailId = localStorage.getItem("email");
    }
    redirect(){
        //window.location.href='/post'
        this.props.history.push('/post', {'query': this.props.id})
    }
    async startChat(){
        const sessionName  = await Axios.post("https://us-central1-rapid-rarity-278219.cloudfunctions.net/getSessionName")
        const createResources = await Axios.get("https://us-central1-rapid-rarity-278219.cloudfunctions.net/createPubSubResources")
        if(sessionName.data.toString() === "-1"){
            console.log("No session -1")
            const session_name = {
                "session_name": moment().format("DD-MM-YYYY_HH:mm:ss"),
                "session_start_time": moment().format("HH:mm:ss"),
                "user_email": this.emailId
            }
            console.log(session_name)
            const createSession  = await Axios.post("https://us-central1-rapid-rarity-278219.cloudfunctions.net/createSession",session_name)
            console.log("From gf "+ createSession.data.toString())
            if(createSession.data.toString() === "true"){
                const sessionName  = await Axios.post("https://us-central1-rapid-rarity-278219.cloudfunctions.net/getSessionName")
                this.props.history.push('/post', {
                    'session_name': sessionName.data,
                    'session_seconds_left':120,
                    "user_email": this.emailId
                })
            }
        }
    }

    componentDidMount(){
        this.getOrCreateSession();
    }

    async continueChat(){
        const sessionName  = await Axios.post("https://us-central1-rapid-rarity-278219.cloudfunctions.net/getSessionName")
        var session_start_time  = await Axios.post("https://us-central1-rapid-rarity-278219.cloudfunctions.net/getSessionTime")
        console.log(session_start_time.data)
        session_start_time = moment(session_start_time.data.toString(),"HH:mm:ss")
        session_start_time.add(120,'seconds')
        var current_time = moment(moment().format("HH:mm:ss").toString(),"HH:mm:ss")
        this.props.history.push('/post', 
        {'session_name': sessionName.data,'session_seconds_left':session_start_time.diff(current_time,'seconds')})
    }

    async getOrCreateSession(){
        const sessionName  = await Axios.post("https://us-central1-rapid-rarity-278219.cloudfunctions.net/getSessionName")
        if(sessionName.data.toString() === "-1"){
            console.log("No session")
            //return <DiscussionButton flag="true"></DiscussionButton>
        }else{
            console.log("hello "+sessionName.data)
            //return <DiscussionButton flag="false"></DiscussionButton>
        }
    }

    generateButton(){
        var elements=[];
        this.getOrCreateSession().then(function(result){
            if(result === true){
                return true;
            }else{
                return false;
            }
        })
    }
    render() {
        return (
            <div>
                <br />
                <div>
                    <Button onClick={this.startChat}>Start session</Button>
                    <br />
                    <br />
                    <Button onClick={this.continueChat}>Continue session</Button>
                </div>
            </div>
        )
    }
}

export default withRouter(Discussion);
