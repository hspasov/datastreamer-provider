import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Link, Route } from 'react-router-dom';

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: ""
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    handleSubmit() {
        let email = this.state.email;
        let password = this.state.password;
        /*this.props.authentication.auth().createUserWithEmailAndPassword(email, password).then(() => {
            console.log("User registered");
            // redirect to /datawatcher:
            this.context.router.history.push("/datawatcher");
        }).catch(error => {
            if (error !== null) {
                console.log(error.message);
                return;
            }
        });*/
    }

    handleEmailChange(event) {
        this.setState({ email: event.target.value });
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    render() {
        return (
            <div>
                <h1>Register Page</h1>
                <input type="email" placeholder="Email: " value={this.state.email} onChange={this.handleEmailChange} />
                <input type="password" placeholder="Password: " value={this.state.password} onChange={this.handlePasswordChange} />
                <button id="submit" onClick={this.handleSubmit}>Register</button>
            </div>
        );
    }
}

Register.contextTypes = {
    router: PropTypes.object
}

export default Register