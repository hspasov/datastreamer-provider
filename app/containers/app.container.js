import React from "react";
import { Navbar, Button } from "react-bootstrap";

class AppContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            providerData: null
        };

        this.setProviderData = this.setProviderData.bind(this);
    }

    setProviderData(data) {
        console.log(data);
        this.setState({ providerData: data });
    }

    goTo(route) {
        console.log(route);
        console.log(this.props.history);
        this.props.history.push(`${route}`, {
            setProviderData: this.setProviderData
        });
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
                    </Navbar.Header>
                </Navbar>
            </div>
        );
    }
}

export default AppContainer