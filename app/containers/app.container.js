import React from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';

// import database from '../config/database.js';

import DataWatcher from '../pages/datawatcher.page';
import Login from '../pages/login.page';
import Register from '../pages/register.page';

class AppContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: null
        };

        // this.setCurrentUser = this.setCurrentUser.bind(this);
    }

    /*setCurrentUser(user) {
        this.setState({ currentUser: user });
    }*/

    render() {
        return (
            <BrowserRouter>
                <div>
                    <p>Hello World</p>
                    <div>
                        <Link to="/home">
                            Home Page
                        </Link>
                        <Link to="/second">
                            Second Page
                        </Link>
                        <Link to="/third">
                            Third Page
                        </Link>
                        <Link to="/datawatcher">
                            File Watcher
                        </Link>
                        {/*
                            Note: authentication system not implemented
                        */}
                        {
                            /*this.state.currentUser === null &&*/
                            <Link to="/login">
                                Log in
                            </Link>
                        }
                        {
                            /*this.state.currentUser === null &&*/
                            <Link to="/register">
                                Register
                            </Link>
                        }
                        {
                            /*this.state.currentUser !== null &&*/
                            <a href="#">Log out</a>
                        }
                    </div>
                    <Route path="/login" setCurrentUser={this.setCurrentUser} render={() => <Login /*authentication={todo}*/ />} />
                    <Route path="/register" setCurrentUser={this.setCurrentUser} render={() => <Register /*authentication={todo}*/ />} />
                    <Route path="/datawatcher" render={() => <DataWatcher /*authentication={todo}*/ />} />
                    <Route path="/:page" component={Page} />
                </div>
            </BrowserRouter>
        );
    }
}

const Page = ({ match }) => (
    <div>
        {match.params.page}
    </div>
);

const Home = () => (
    <div>
        <p>Home</p>
    </div>
);

export default AppContainer