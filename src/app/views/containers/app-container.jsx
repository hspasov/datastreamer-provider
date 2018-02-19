import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import HomePage from "../pages/home-page.jsx";
import LoginPage from "../pages/login-page.jsx";
import RegisterPage from "../pages/register-page.jsx";
import AccountSettingsPage from "../pages/account-settings-page.jsx";

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
                <Route path="/register" exact component={RegisterPage} />
                <Route path="/login" exact component={LoginPage} />
                <Route path="/home" exact component={HomePage} />
                <Route path="/account-settings" exact component={AccountSettingsPage} />
            </Switch>
        </div>;
    }
}

const AppContainer = withRouter(App);

export default AppContainer;