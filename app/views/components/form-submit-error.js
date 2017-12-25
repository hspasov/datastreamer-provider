import React from "react";
import { Message } from "semantic-ui-react";

class FormSubmitError extends React.Component {
    constructor(props) {
        super(props);

        this.errorTypes = {
            "empty": "One or more fields were left empty",
            "format": "Password must be between 8 and 100 characters long, must have uppercase, lowercase letters and digits.",
            "verification": "Invalid username or password",
            "match": "Passwords don't match",
            "exists": "Username already taken",
            "connect": "Can't connect to server",
            "error": "Unknown error"
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