import React from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";
import loginProvider from "../actions/provider";
import formurlencoded from "form-urlencoded";

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: ""
        }

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleUsernameChange(event) {
        event.preventDefault();
        this.setState({
            username: event.target.value
        })
    }

    handlePasswordChange(event) {
        event.preventDefault();
        this.setState({
            password: event.target.value
        });
    }

    handleSubmit() {
        let formData = {
            username: this.state.username,
            password: this.state.password
        };
        fetch("https://datastreamer.local:3000/provider/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status == 409) {
                throw "Authentication failed";
            } else {
                return response.json();
            }
        }).then(json => {
            this.props.dispatch(loginProvider(json));
            this.props.dispatch(push("/datawatcher"));
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        return (
            <div>
                <Link
                    to="/datawatcher">
                    DataWatcher
                </Link>
                <Link
                    to="/register">
                    Register
                </Link>
                <Link
                    to="/login">
                    Login
                </Link>
                <input type="text" placeholder="Name: " onChange={this.handleUsernameChange} />
                <input type="password" placeholder="Password: " onChange={this.handlePasswordChange} />
                <button onClick={this.handleSubmit}>Login</button>
            </div>
        );
    }
}

const LoginPage = connect(store => {
    return {
        provider: store.provider
    };
})(Login)

export default LoginPage;