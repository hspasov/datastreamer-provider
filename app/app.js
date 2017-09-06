import React from "react";
import ReactDOM from "react-dom";
import { makeMainRoutes } from "./routes/routes";

const routes = makeMainRoutes();

ReactDOM.render(
    routes,
    document.getElementById("content")
);