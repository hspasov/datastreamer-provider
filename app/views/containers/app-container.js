import React from "react";
import { Button } from "semantic-ui-react";
import { Route, Switch } from "react-router-dom";
import { push } from "react-router-redux";
import { connect } from "react-redux";

import DataWatcherPage from "../pages/data-watcher-page";
import LoginPage from "../pages/login-page";
import RegisterPage from "../pages/register-page";
import AccountSettingsPage from "../pages/account-settings-page";

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch(push("/login"));
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

const AppContainer = connect(store => {
    return {
        provider: store.provider,
        router: store.router
    };
})(App);

export default AppContainer;