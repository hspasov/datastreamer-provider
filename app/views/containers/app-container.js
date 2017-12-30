import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import DataWatcherPage from "../pages/data-watcher-page";
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
                <Route path="/datawatcher" component={DataWatcherPage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
                <Route path="/account-settings" component={AccountSettingsPage} />
            </Switch>
        </div>;
    }
}

const AppContainer = withRouter(App);

export default AppContainer;