import React from "react";
import { connect } from "react-redux";
import loginProvider from "../actions/provider";
import formurlencoded from "form-urlencoded";

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            confirmPassword: ""
        }

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
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

    handleConfirmPasswordChange(event) {
        event.preventDefault();
        this.setState({
            confirmPassword: event.target.value
        });
    }

    handleSubmit() {
        if (this.state.password != this.state.confirmPassword) {
            console.log("Passwords don't match");
            return;
        }
        let formData = {
            username: this.state.username,
            password: this.state.password
        };
        fetch("https://datastreamer.local:3000/provider/register", {
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
            this.props.history.push("/datawatcher");
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        return (
            <div>
                <input type="text" placeholder="Name: " onChange={this.handleUsernameChange} />
                <input type="password" placeholder="Password: " onChange={this.handlePasswordChange} />
                <input type="password" placeholder="Confirm password: " onChange={this.handleConfirmPasswordChange} />
                <button onClick={this.handleSubmit}>Register</button>
            </div>
        );
    }
}

const RegisterPage = connect(store => {
    return {
        provider: store.provider
    };
})(Register)

export default RegisterPage;