import { combineReducers, applyMiddleware, createStore } from "redux";
import { routerMiddleware } from "react-router-redux";
import createHistory from "history/createHashHistory";
import reducer from "./reducers";

export default createStore(reducer, applyMiddleware(routerMiddleware(createHistory())));