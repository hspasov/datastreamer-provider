import React from "react";
import { Navbar, Button } from "react-bootstrap";

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
                <Navbar fluid>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a href="#">DataStreamer</a>
                        </Navbar.Brand>
                        <Button
                            bsStyle="primary"
                            className="btn-margin"
                            onClick={this.goTo.bind(this, "datawatcher")}>
                            DataWatcher
                        </Button>
                        <Button
                            bsStyle="primary"
                            className="btn-margin"
                            onClick={this.goTo.bind(this, "register")}>
                            Register
                        </Button>
                        <Button
                            bsStyle="primary"
                            className="btn-margin"
                            onClick={this.goTo.bind(this, "login")}>
                            Login
                        </Button>
                    </Navbar.Header>
                </Navbar>
            </div>
        );
    }
}

export default AppContainer