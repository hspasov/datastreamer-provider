import React from "react";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import { Link, withRouter } from "react-router-dom";
import { Grid, Header, Icon, Message } from "semantic-ui-react";
import { setDefaultAccess } from "../../store/actions/settings";
import { loginProvider } from "../../store/actions/provider";
import formurlencoded from "form-urlencoded";
import FormComponent from "../components/form-component.jsx";
import FormSubmitError from "../components/form-submit-error.jsx";
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
        if (!(
            form.username &&
            form.password &&
            form.confirmPassword &&
            form.clientConnectPassword &&
            form.confirmClientConnectPassword)) {

            this.setState({
                hasFormErrors: true,
                formErrors: ["empty"]
            });
            return;
        }

        if (form.password != form.confirmPassword) {
            this.setState({
                hasFormErrors: true,
                formErrors: ["match"]
            });
            return;
        }

        if (form.clientConnectPassword != form.confirmClientConnectPassword) {
            this.setState({
                hasFormErrors: true,
                formErrors: ["match"]
            });
            return;
        }

// todo: check if clientConnectPassword and password are same and give error if they are

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
                throw response.status;
            }
        }).then(json => {
            this.props.loginProvider(json);
            this.props.setDefaultAccess(json.readable, json.writable);
            this.props.history.push("/home");
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
                    <FormComponent
                        title="Create new provider"
                        fields={[
                            {
                                label: "username",
                                icon: "user",
                                placeholder: "Username",
                                type: "text",
                                required: true
                            },
                            {
                                label: "password",
                                icon: "lock",
                                placeholder: "Password",
                                type: "password",
                                required: true
                            },
                            {
                                label: "confirmPassword",
                                icon: "lock",
                                placeholder: "Confirm password",
                                type: "password",
                                required: true
                            },
                            {
                                label: "clientConnectPassword",
                                icon: "lock",
                                placeholder: "Client connect password",
                                type: "password",
                                required: true
                            },
                            {
                                label: "confirmClientConnectPassword",
                                icon: "lock",
                                placeholder: "Confirm client connect password",
                                type: "password",
                                required: true
                            }
                        ]}
                        submit={{
                            label: "Register",
                            color: "black",
                            onClick: form => this.handleSubmit(form)
                        }}
                    />
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