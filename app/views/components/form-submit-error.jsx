import React from "react";
import { Message } from "semantic-ui-react";

class FormSubmitError extends React.Component {
    constructor(props) {
        super(props);

        this.errorTypes = {
            "empty": "One or more fields were left empty",
            400: "Password must be between 8 and 100 characters long, must have uppercase, lowercase letters and digits.",
            401: "Session expired, please authenticate again",
            404: "Invalid username or password",
            "match": "Passwords don't match",
            "difference": "Account password and client connect password must be different",
            412: "Username already taken",
            "connect": "Can't connect to server",
            500: "Unknown error"
        };
    }

    render() {
        const errorsList = this.props.errors.map(error => this.errorTypes[error]);
        return <Message
            visible={this.props.visible}
            size="tiny"
            error
            header="There were some errors with your submission"
            list={errorsList}
        />;
    }
}

export default FormSubmitError;