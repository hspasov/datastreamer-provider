import { combineReducers } from "redux";

import provider from "./provider";
import session from "./session";

export default combineReducers({
    provider,
    session
});