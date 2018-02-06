import React from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Grid, Header, Icon } from "semantic-ui-react";
import { setDefaultAccess } from "../../store/actions/settings";
import { loginProvider } from "../../store/actions/provider";
import { importRules } from "../../store/actions/clientAccessRules";
import formurlencoded from "form-urlencoded";
import { Helmet } from "react-helmet";
import FormComponent from "../components/form-component.jsx";
import FormSubmitError from "../components/form-submit-error.jsx";
import config from "../../../config.json";

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            hasFormErrors: false,
            formErrors: []
        }
    }

    handleSubmit(form) {
        if (!(form.username && form.password)) {
            this.setState({
                hasFormErrors: true,
                formErrors: ["empty"]
            });
            return;
        }

        this.setState({
            hasFormErrors: false
        });

        let formData = {
            username: form.username,
            password: form.password
        };

        fetch(`${config.uri}/provider/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw response.status;
            }
        }).then(json => {
            console.log(json);
            this.props.loginProvider(json);
            this.props.importRules(json.clientAccessRules);
            this.props.setDefaultAccess(json.readable, json.writable);
            this.props.history.push("/home");
        }).catch(errorCode => {
            console.log(errorCode);
            let formErrors;
            switch (errorCode) {
                case 404:
                    formErrors = ["verification"];
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
                        <Link to="/register"><Header color="blue"><Icon corner name="plus" />Create provider</Header></Link>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row centered>
                    <FormComponent
                        title="Login to your account"
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
                            }
                        ]}
                        submit={{
                            label: "Login",
                            color: "black",
                            onClick: form => this.handleSubmit(form)
                        }}
                    />
                </Grid.Row>
            </Grid>
        </div>;
    }
}

const LoginPage = withRouter(connect(null, {
    setDefaultAccess,
    loginProvider,
    importRules
})(Login));

export default LoginPage;