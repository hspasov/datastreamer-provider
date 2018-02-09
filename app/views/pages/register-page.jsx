import React from "react";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import { Redirect } from "react-router";
import { Link, withRouter } from "react-router-dom";
import { Grid, Header, Icon, Message } from "semantic-ui-react";
import { setDefaultAccess } from "../../store/actions/settings";
import { loginProvider } from "../../store/actions/provider";
import formurlencoded from "form-urlencoded";
import FormComponent from "../components/form-component.jsx";
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

    handleSubmit(form) {
        let formErrors = [];
        try {
            if (!(
                form.username &&
                form.password &&
                form.confirmPassword &&
                form.clientConnectPassword &&
                form.confirmClientConnectPassword)) {

                formErrors.push("empty");
            }

            if (form.password !== form.confirmPassword ||
                form.clientConnectPassword !== form.confirmClientConnectPassword) {

                formErrors.push("match");
            }

            if (form.password === form.clientConnectPassword) {
                formErrors.push("difference");
            }
        } finally {
            if (formErrors.length > 0) {
                this.setState({
                    hasFormErrors: true,
                    formErrors
                });
                return;
            }
        }

        let formData = {
            username: form.username,
            password: form.password,
            clientConnectPassword: form.clientConnectPassword
        };
        fetch(`${config.uri}/provider/register`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status == 201) {
                return response.json();
            } else {
                throw response;
            }
        }).then(json => {
            this.props.loginProvider(json);
            this.props.setDefaultAccess(json.readable, json.writable);
            this.props.history.push("/home");
        }).catch(error => {
            this.setState({
                hasFormErrors: true,
                formErrors: [error.status]
            });
        });
    }

    render() {
        if (this.props.provider.token) {
            return <Redirect to="/home"></Redirect>;
        }

        return <div className="login-form">
            <Helmet>
                <style>{`
                    body > div,
                    body > div > div,
                    body > div > div > div.login-form {
                    height: 100%;
                    }
                `}</style>
            </Helmet>
            <Grid style={{ height: "100%" }} verticalAlign="top">
                <Grid.Row columns={2}>
                    <Grid.Column textAlign="left">
                        <Header>Datastreamer</Header>
                    </Grid.Column>
                    <Grid.Column textAlign="right">
                        <Link to="/login">
                            <Header color="blue">
                                <Icon name="arrow left" />Go back
                            </Header>
                        </Link>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row centered>
                    <FormComponent
                        title="Create new provider"
                        fields={[
                            {
                                label: "username",
                                icon: "user",
                                placeholder: "Username",
                                type: "text",
                                required: true,
                                autocomplete: "username"
                            },
                            {
                                label: "password",
                                icon: "lock",
                                placeholder: "Password",
                                type: "password",
                                required: true,
                                autocomplete: "new-password"
                            },
                            {
                                label: "confirmPassword",
                                icon: "lock",
                                placeholder: "Confirm password",
                                type: "password",
                                required: true,
                                autocomplete: "new-password"
                            },
                            {
                                label: "clientConnectPassword",
                                icon: "lock",
                                placeholder: "Client connect password",
                                type: "password",
                                required: true,
                                autocomplete: "off"
                            },
                            {
                                label: "confirmClientConnectPassword",
                                icon: "lock",
                                placeholder: "Confirm client connect password",
                                type: "password",
                                required: true,
                                autocomplete: "off"
                            }
                        ]}
                        submit={{
                            label: "Register",
                            color: "black",
                            onClick: form => this.handleSubmit(form)
                        }}
                        error={{
                            hasFormErrors: this.state.hasFormErrors,
                            formErrors: this.state.formErrors
                        }}
                    />
                </Grid.Row>
            </Grid>
        </div>;
    }
}

const RegisterPage = withRouter(connect(store => {
    return {
        provider: store.provider
    };
}, {
    loginProvider,
    setDefaultAccess
})(Register));

export default RegisterPage;