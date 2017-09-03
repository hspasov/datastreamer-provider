import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Link, Route } from 'react-router-dom';

class Login extends React.Component {
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

    handleSubmit(event) {
        console.log("submitted");
        event.preventDefault();
        let email = this.state.email;
        let password = this.state.password;
        /*this.props.authentication.auth().signInWithEmailAndPassword(email, password).then(() => {
            console.log("User logged in");
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
                <h1>Login Page</h1>
                <input type="email" placeholder="Email: " value={this.state.email} onChange={this.handleEmailChange} />
                <input type="password" placeholder="Password: " value={this.state.password} onChange={this.handlePasswordChange} />
                <button onClick={this.handleSubmit}>Log in</button>
            </div>
        );
    }
}

Login.contextTypes = {
    router: PropTypes.object
}

export default Login