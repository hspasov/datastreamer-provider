import React from "react";
import { Button } from "semantic-ui-react";

class AppContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.history.push("/login");
    }

    goTo(route) {
        this.props.history.push(`${route}`);
    }

    render() {
        return (
            <div>
                <Button
                    onClick={this.goTo.bind(this, "datawatcher")}>
                    DataWatcher
                </Button>
                <Button
                    onClick={this.goTo.bind(this, "register")}>
                    Register
                </Button>
                <Button
                    onClick={this.goTo.bind(this, "login")}>
                    Login
                </Button>
            </div>
        );
    }
}

export default AppContainer