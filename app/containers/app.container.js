import React from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';

import DataWatcher from '../pages/datawatcher.page';

class AppContainer extends React.Component {
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
                        <Link to="/filewatcher">
                            File Watcher
                        </Link>
                    </div>
                    <Route path="/filewatcher" component={DataWatcher} />
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