import React from "react";
import formurlencoded from "form-urlencoded";

class RegisterPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            confirmPassword: ""
        }

        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
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
            email: this.state.email,
            password: this.state.password
        };
        fetch("http://localhost:3000/register", {
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
                <input type="email" placeholder="Email: " onChange={this.handleEmailChange} />
                <input type="password" placeholder="Password: " onChange={this.handlePasswordChange} />
                <input type="password" placeholder="Confirm password: " onChange={this.handleConfirmPasswordChange} />
                <button onClick={this.handleSubmit}>Register</button>
            </div>
        );
    }
}

export default RegisterPage;