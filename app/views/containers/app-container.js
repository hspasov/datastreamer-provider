import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import HomePage from "../pages/home-page";
import LoginPage from "../pages/login-page";
import RegisterPage from "../pages/register-page";
import AccountSettingsPage from "../pages/account-settings-page";

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.history.push("/login");
    }

    render() {
        return <div id="page">
            <Switch>
                <Route path="/home" component={HomePage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
                <Route path="/account-settings" component={AccountSettingsPage} />
            </Switch>
        </div>;
    }
}

const AppContainer = withRouter(App);

export default AppContainer;