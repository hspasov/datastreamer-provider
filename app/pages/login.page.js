import React from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { Link } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Message, Segment } from "semantic-ui-react";
import loginProvider from "../actions/provider";
import formurlencoded from "form-urlencoded";
import { Helmet } from "react-helmet";

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
                        <Link to="/register"><Header color="blue"><Icon corner name="plus" />Create provider</Header></Link>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row centered>
                    <Grid.Column style={{ maxWidth: 450 }} textAlign="center">
                        <Header as="h2" color="black" textAlign="center">
                            Log-in to your account
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
                                <Button color="black" fluid size="large" onClick={this.handleSubmit}>Login</Button>
                            </Segment>
                        </Form>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>;
    }
}

const LoginPage = connect(store => {
    return {
        provider: store.provider
    };
})(Login)

export default LoginPage;