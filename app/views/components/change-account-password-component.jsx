import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import formurlencoded from "form-urlencoded";
import { loginProvider } from "../../store/actions/provider";
import FormComponent from "./form-component.jsx";
import config from "../../../config.json";

class ChangeAccountPassword extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasFormErrors: false,
            formErrors: []
        };
    }

    handleSubmit(form) {
        if (!(form.oldPassword &&
            form.newPassword &&
            form.confirmNewPassword)) {

            this.setState({
                hasFormErrors: true,
                formErrors: ["empty"]
            });
            return;
        } else if (form.newPassword !== form.confirmNewPassword) {
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
            oldPassword: form.oldPassword,
            newPassword: form.newPassword
        };

        fetch(`${config.uri}/provider/account?action=account+password+change`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status === 201) {
                return response.json();
            } else {
                throw response;
            }
        }).then(json => {
            this.props.loginProvider({
                token: json.token,
                username: this.props.provider.username
            });
            this.props.history.push("/home");
        }).catch(error => {
            this.setState({
                hasFormErrors: true,
                formErrors: [error.status]
            });
        });
    }

    render() {
        return <FormComponent
            title="Change password"
            fields={[
                {
                    label: "oldPassword",
                    icon: "lock",
                    placeholder: "Old password",
                    type: "password",
                    required: true,
                    autocomplete: "off"
                },
                {
                    label: "newPassword",
                    icon: "lock",
                    placeholder: "New password",
                    type: "password",
                    required: true,
                    autocomplete: "new-password"
                },
                {
                    label: "confirmNewPassword",
                    icon: "lock",
                    placeholder: "Confirm new password",
                    type: "password",
                    required: true,
                    autocomplete: "new-password"
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
        />;
    }
}

const ChangeAccountPasswordComponent = withRouter(connect(store => {
    return {
        provider: store.provider
    };
}, {
    loginProvider
})(ChangeAccountPassword));

export default ChangeAccountPasswordComponent;