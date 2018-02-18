import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import formurlencoded from "form-urlencoded";
import { logoutProvider } from "../../store/actions/provider";
import FormComponent from "./form-component.jsx";
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
                throw response;
            }
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
                    title="Delete account"
                    fields={[{
                        label: "password",
                        icon: "lock",
                        placeholder: "Password",
                        type: "password",
                        required: true,
                        autocomplete: "off"
                    }]}
                    submit={{
                        label: "DELETE",
                        color: "red",
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

const DeleteAccountComponent = withRouter(connect(store => {
    return {
        provider: store.provider
    };
}, {
    logoutProvider
})(DeleteAccount));

export default DeleteAccountComponent;