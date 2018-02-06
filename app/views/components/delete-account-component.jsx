import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { logoutProvider } from "../../store/actions/provider";
import FormComponent from "./form-component.jsx";
import FormSubmitError from "./form-submit-error.jsx";
import config from "../../../config.json";

class DeleteAccount extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasFormErrors: false,
            formErrors: []
        };
    }

    handleSubmit(form) {
        if (!form.password) {
            this.setState({
                hasFormErrors: true,
                formErrors: ["empty"]
            });
            return;
        }
        this.setState({
            hasFormErrors: false
        });
        const formData = {
            token: this.props.provider.token,
            password: form.password
        };
        fetch(`${config.uri}/provider/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status === 200) {
                this.props.logoutProvider();
                this.props.history.push("/login");
            } else {
                throw response.status;
            }
        }).catch(errorCode => {
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
            title="Delete account"
            fields={[{
                label: "password",
                icon: "lock",
                placeholder: "Password",
                type: "password",
                required: true
            }]}
            submit={{
                label: "DELETE",
                color: "red",
                onClick: form => this.handleSubmit(form)
            }}
        />;
    }
}

const DeleteAccountComponent = withRouter(connect(store => {
    return {
        provider: store.provider
    };
}, {
    logoutProvider
})(DeleteAccount));

export default DeleteAccountComponent;