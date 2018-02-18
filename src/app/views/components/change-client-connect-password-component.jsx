import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import formurlencoded from "form-urlencoded";
import FormComponent from "./form-component.jsx";
import { loginProvider } from "../../store/actions/provider";
import config from "../../../config.json";

class ChangeClientConnectPassword extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            accountPassword: "",
            newClientConnectPassword: "",
            confirmNewClientConnectPassword: "",
            hasFormErrors: false,
            formErrors: []
        };
    }

    handleSubmit(form) {
        if (!(form.accountPassword &&
            form.newClientConnectPassword &&
            form.confirmNewClientConnectPassword)) {

            this.setState({
                hasFormErrors: true,
                formErrors: ["empty"]
            });
            return;
        } else if (form.newClientConnectPassword !== form.confirmNewClientConnectPassword) {
            this.setState({
                hasFormErrors: true,
                formErrors: ["match"]
            });
            return;
        }
        this.setState({
            hasFormErrors: false
        });

        const formData = {
            token: this.props.provider.token,
            accountPassword: form.accountPassword,
            newClientConnectPassword: form.newClientConnectPassword
        };

        fetch(`${config.uri}/provider/account?action=client+connect+password+change`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formurlencoded(formData)
        }).then(json => {
            this.props.loginProvider({
                token: json.token,
                username: this.props.provider.username
            });
        }).catch(error => {
            this.setState({
                hasFormErrors: true,
                formErrors: [error.status]
            });
        });
    }

    render() {
        return <Grid>
            <Grid.Row centered>
                <FormComponent
                    title="Change client connect password"
                    fields={[
                        {
                            label: "accountPassword",
                            icon: "lock",
                            placeholder: "Account password",
                            type: "password",
                            required: true,
                            autocomplete: "off"
                        },
                        {
                            label: "newClientConnectPassword",
                            icon: "lock",
                            placeholder: "New client connect password",
                            type: "password",
                            required: true,
                            autocomplete: "off"
                        },
                        {
                            label: "confirmNewClientConnectPassword",
                            icon: "lock",
                            placeholder: "Confirm new client connect password",
                            type: "password",
                            required: true,
                            autocomplete: "off"
                        }
                    ]}
                    submit={{
                        label: "Submit",
                        color: "black",
                        onClick: form => this.handleSubmit(form)
                    }}
                    error={{
                        hasFormErrors: this.state.hasFormErrors,
                        formErrors: this.state.formErrors
                    }}
                />
            </Grid.Row>
        </Grid>;
    }
}

const ChangeClientConnectPasswordComponent = withRouter(connect(store => {
    return {
        provider: store.provider
    };
}, {
    loginProvider
})(ChangeClientConnectPassword));

export default ChangeClientConnectPasswordComponent;