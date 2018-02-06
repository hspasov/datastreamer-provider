import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
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
        }).catch(errorCode => {
            console.log(errorCode);
            let formErrors;
            switch (errorCode) {
                case 400:
                    formErrors = ["format"];
                    break;
                case 401:
                    formErrors = ["token"];
                    break;
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
        return <FormComponent
            title="Change client connect password"
            fields={[
                {
                    label: "accountPassword",
                    icon: "lock",
                    placeholder: "Account password",
                    type: "password",
                    required: true
                },
                {
                    label: "newClientConnectPassword",
                    icon: "lock",
                    placeholder: "New client connect password",
                    type: "password",
                    required: true
                },
                {
                    label: "confirmNewClientConnectPassword",
                    icon: "lock",
                    placeholder: "Confirm new client connect password",
                    type: "password",
                    required: true
                }
            ]}
            submit={{
                label: "Submit",
                color: "black",
                onClick: form => this.handleSubmit(form)
            }}
        />;
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