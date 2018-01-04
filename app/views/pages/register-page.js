import React from "react";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import { Link, withRouter } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Message, Segment } from "semantic-ui-react";
import { setDefaultAccess } from "../../store/actions/settings";
import { loginProvider } from "../../store/actions/provider";
import formurlencoded from "form-urlencoded";
import FormSubmitError from "../components/form-submit-error";
import config from "../../../config.json";

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            confirmPassword: "",
            clientConnectPassword: "",
            confirmClientConnectPassword: "",
            hasFormErrors: false,
            formErrors: []
        }
    }

    handleUsernameChange(event) {
        event.preventDefault();
        this.setState({
            username: event.target.value
        });
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

    handleClientConnectPasswordChange(event) {
        event.preventDefault();
        this.setState({
            clientConnectPassword: event.target.value
        });
    }

    handleConfirmClientConnectPasswordChange(event) {
        event.preventDefault();
        this.setState({
            confirmClientConnectPassword: event.target.value
        });
    }

    handleSubmit() {
        if (!(
            this.state.username &&
            this.state.password &&
            this.state.confirmPassword &&
            this.state.clientConnectPassword &&
            this.state.confirmClientConnectPassword)) {

            this.setState({
                hasFormErrors: true,
                formErrors: ["empty"]
            });
            return;
        }

        if (this.state.password != this.state.confirmPassword) {
            this.setState({
                hasFormErrors: true,
                formErrors: ["match"]
            });
            return;
        }

        if (this.state.clientConnectPassword != this.state.confirmClientConnectPassword) {
            this.setState({
                hasFormErrors: true,
                formErrors: ["match"]
            });
            return;
        }

// todo: check if clientConnectPassword and password are same and give error if they are

        let formData = {
            username: this.state.username,
            password: this.state.password,
            clientConnectPassword: this.state.clientConnectPassword
        };
        fetch(`${config.uri}/provider/register`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status == 201) {
                return response.json();
            } else {
                throw response.status;
            }
        }).then(json => {
            this.props.loginProvider(json);
            this.props.setDefaultAccess(json.readable, json.writable);
            this.props.history.push("/datawatcher");
        }).catch(errorCode => {
            let formErrors;
            switch (errorCode) {
                case 400:
                    formErrors = ["format"];
                    break;
                case 412:
                    formErrors = ["exists"];
                    break;
                case 500:
                    formErrors = ["error"];
                    break;
                default:
                    formErrors = ["connect"];
            }
            this.setState({
                hasFormErrors: true,
                formErrors
            });
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
                                    onChange={event => this.handleUsernameChange(event)}
                                />
                                <Form.Input
                                    fluid
                                    icon="lock"
                                    iconPosition="left"
                                    placeholder="Password"
                                    type="password"
                                    required
                                    onChange={event => this.handlePasswordChange(event)}
                                />
                                <Form.Input
                                    fluid
                                    icon="lock"
                                    iconPosition="left"
                                    placeholder="Confirm password"
                                    type="password"
                                    required
                                    onChange={event => this.handleConfirmPasswordChange(event)}
                                />
                                <Form.Input
                                    fluid
                                    icon="lock"
                                    iconPosition="left"
                                    placeholder="Client connect password"
                                    type="password"
                                    required
                                    onChange={event => this.handleClientConnectPasswordChange(event)}
                                />
                                <Form.Input
                                    fluid
                                    icon="lock"
                                    iconPosition="left"
                                    placeholder="Confirm client connect password"
                                    type="password"
                                    required
                                    onChange={event => this.handleConfirmClientConnectPasswordChange(event)}
                                />
                                <Button color="black" fluid size="large" onClick={() => this.handleSubmit()}>Register</Button>
                                <FormSubmitError visible={this.state.hasFormErrors} errors={this.state.formErrors} />
                            </Segment>
                        </Form>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>;
    }
}

const RegisterPage = withRouter(connect(null, {
    loginProvider,
    setDefaultAccess
})(Register));

export default RegisterPage;