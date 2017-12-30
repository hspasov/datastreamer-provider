import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import AppContainer from "./views/containers/app-container";
import "semantic-ui-css/semantic.min.css";

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <AppContainer/>
        </BrowserRouter>
    </Provider>,
    document.getElementById("content")
);