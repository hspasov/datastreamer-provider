import React from "react";
import { createMemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import AppContainer from "../containers/app.container";
import DataWatcherPage from "../pages/datawatcher.page";
import RegisterPage from "../pages/register.page";
import LoginPage from "../pages/login.page";

const history = createMemoryHistory();

export const makeMainRoutes = () => {
    return (
        <Router history={history} component={AppContainer}>
            <div>
                <Route path="/" render={(props) => <AppContainer {...props} />} />
                <Route path="/datawatcher" render={(props) => <DataWatcherPage {...props} />} />
                <Route path="/register" render={(props) => <RegisterPage {...props} />} />
                <Route path="/login" render={(props) => <LoginPage {...props} />} />
            </div>
        </Router>
    );
}