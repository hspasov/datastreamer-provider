import React from "react";
import { connect } from "react-redux";
import registerProvider from "../actions/provider";
import formurlencoded from "form-urlencoded";

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            password: "",
            confirmPassword: ""
        }

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleNameChange(event) {
        event.preventDefault();
        this.setState({
            name: event.target.value
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
            name: this.state.name,
            password: this.state.password
        };
        fetch("http://localhost:3000/provider/register", {
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
            console.log(json);
            this.props.dispatch(registerProvider(json));
            this.props.history.push("/datawatcher");
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        return (
            <div>
                <input type="text" placeholder="Name: " onChange={this.handleNameChange} />
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