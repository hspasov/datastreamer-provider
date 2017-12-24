import React from "react";
import ReactDOM from "react-dom";
import { ConnectedRouter } from "react-router-redux";
import { Provider } from "react-redux";
import createHistory from "history/createHashHistory";
import store from "./store";
import AppContainer from "./views/containers/app-container";
import "semantic-ui-css/semantic.min.css";

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={createHistory()}>
            <AppContainer/>
        </ConnectedRouter>
    </Provider>,
    document.getElementById("content")
);