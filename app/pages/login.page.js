import React from "react";
import { connect } from "react-redux";
import loginProvider from "../actions/provider";
import formurlencoded from "form-urlencoded";

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            password: ""
        }

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
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

    handleSubmit() {
        let formData = {
            name: this.state.name,
            password: this.state.password
        };
        fetch("http://localhost:3000/provider/login", {
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
                <input type="text" placeholder="Name: " onChange={this.handleNameChange} />
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