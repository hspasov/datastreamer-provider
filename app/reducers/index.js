import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import provider from "./provider";

export default combineReducers({
    provider,
    router: routerReducer
});