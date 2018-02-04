import { combineReducers } from "redux";

import provider from "./provider";
import settings from "./settings";
import connections from "./connections";
import status from "./status";

export default combineReducers({
    provider,
    settings,
    connections,
    status
});