import { combineReducers } from "redux";

import provider from "./provider";
import settings from "./settings";
import connections from "./connections";
import status from "./status";
import banned from "./banned";

export default combineReducers({
    provider,
    settings,
    connections,
    banned,
    status
});