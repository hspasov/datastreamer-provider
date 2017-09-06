import React from "react";
import formurlencoded from "form-urlencoded";

class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: ""
        }

        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleEmailChange(event) {
        event.preventDefault();
        this.setState({
            email: event.target.value
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
            email: this.state.email,
            password: this.state.password
        }

        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status == 409) {
                console.log("Authentication failed");
            } else {
                this.props.history.replace("/home");
            }
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        return (
            <div>
                <input type="email" name="email" placeholder="Email: " onChange={this.handleEmailChange} />
                <input type="password" name="password" placeholder="Password: " onChange={this.handlePasswordChange} />
                <button onClick={this.handleSubmit}>Log in</button>
            </div>
        );
    }
}

export default LoginPage;