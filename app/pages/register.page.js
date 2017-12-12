import React from "react";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Message, Segment } from "semantic-ui-react";
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
        return <div className="login-form">
            {/*
      Heads up! The styles below are necessary for the correct render of this example.
      You can do same with CSS, the main idea is that all the elements up to the `Grid`
      below must have a height of 100%.
    */}
            <Helmet><style>{`
      body > div,
      body > div > div,
      body > div > div > div.login-form {
        height: 100%;
      }
    `}</style></Helmet>
            <Grid style={{ height: "100%" }} verticalAlign="top">
                <Grid.Row columns={2}>
                    <Grid.Column textAlign="left">
                        <Header>Datastreamer</Header>
                    </Grid.Column>
                    <Grid.Column textAlign="right">
                        <Link to="/login"><Header color="blue"><Icon name="arrow left"/>Go back</Header></Link>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row centered>
                    <Grid.Column style={{ maxWidth: 450 }} textAlign="center">
                        <Header as="h2" color="black" textAlign="center">
                            Create new provider
                        </Header>
                        <Form size="massive">
                            <Segment>
                                <Form.Input
                                    fluid
                                    icon="user"
                                    iconPosition="left"
                                    placeholder="Username"
                                    required
                                    onChange={this.handleUsernameChange}
                                />
                                <Form.Input
                                    fluid
                                    icon="lock"
                                    iconPosition="left"
                                    placeholder="Password"
                                    type="password"
                                    required
                                    onChange={this.handlePasswordChange}
                                />
                                <Form.Input
                                    fluid
                                    icon="lock"
                                    iconPosition="left"
                                    placeholder="Confirm password"
                                    type="password"
                                    required
                                    onChange={this.handleConfirmPasswordChange}
                                />
                                <Button color="black" fluid size="large" onClick={this.handleSubmit}>Register</Button>
                            </Segment>
                        </Form>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>;
    }
}

const RegisterPage = connect(store => {
    return {
        provider: store.provider
    };
})(Register)

export default RegisterPage;