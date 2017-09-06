import React from "react";
import { Navbar, Button } from "react-bootstrap";

class AppContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: null
        };

        // this.setCurrentUser = this.setCurrentUser.bind(this);
    }

    /*setCurrentUser(user) {
        this.setState({ currentUser: user });
    }*/

    goTo(route) {
        console.log(route);
        console.log(this.props.history);
        this.props.history.replace(`${route}`);
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
                            onClick={this.goTo.bind(this, "login")}>
                            Login
                        </Button>
                        <Button
                            bsStyle="primary"
                            className="btn-margin"
                            onClick={this.goTo.bind(this, "register")}>
                            Register
                        </Button>
                    </Navbar.Header>
                </Navbar>
            </div>
        );
    }
}

export default AppContainer