import React from "react";
import { connect } from "react-redux";
import { Grid, Header, Tab } from "semantic-ui-react";
import MainToUnitConnector from "../../connections/main-to-unit-connector";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import {
    addClient,
    setAccess,
    changeClientDirectory,
    changeMainDirectory,
    removeClient,
    clearConnections
} from "../../store/actions/connections";
import { logoutProvider } from "../../store/actions/provider";
import formurlencoded from "form-urlencoded";
import ConnectionsComponent from "../components/connections-component.jsx";
import SettingsComponent from "../components/settings-component.jsx";
import ClientAccessRulesComponent from "../components/client-access-rules-component.jsx";
import {
    setMainDirectory,
    toggleDefaultReadable,
    setDefaultAccess,
    toggleDefaultWritable,
    clearSettings
} from "../../store/actions/settings";
import {
    connectSuccess,
    connectError,
    invalidToken,
    invalidClientToken,
    invalidRequest,
    connectTimeout,
    disconnect,
    reconnectFail,
    error,
    clearStatus
} from "../../store/actions/status";
import {
    setClientAccessRule,
    removeClientAccessRule,
    clearClientAccessRules
} from "../../store/actions/clientAccessRules";
import config from "../../../config.json";
const { dialog } = window.require("electron");

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.pageAccessor = this.pageAccessor.bind(this);
        this.connector = new MainToUnitConnector(this.props.provider.token, this.pageAccessor);
    }

    componentDidMount() {
        if (this.props.provider.token) {
            window.addEventListener("beforeunload", this.connector.deleteAll);
        }
        this.connector.connectToClients();
    }

    componentWillUnmount() {
        if (this.props.provider.token) {
            this.connector.deleteAll();
            window.removeEventListener("beforeunload", this.connector.deleteAll);
        }
    }

    initializeScan() {
        if (!this.connector.selectedMainDirectory) {
            // todo: Show error to user
        } else {
            this.props.changeMainDirectory(this.connector.selectedMainDirectory);
            this.connector.initializeScan();
        }
    }

    selectDirectory() {
        dialog.showOpenDialog(mainWindow, {
            properties: ["openDirectory"]
        });
    }

    logout() {
        const clientTokens = this.props.connections.clients.map(client => client.token);
        this.props.connections.clients.forEach(client => {
            this.connector.deleteClient(client.id);
        });
        const formData = {
            providerToken: this.props.provider.token,
            clientTokens
        };
        fetch(`${config.uri}/provider/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", },
            body: formurlencoded(formData)
        }).then(response => {
            this.props.clearClientAccessRules();
            this.props.clearConnections();
            this.props.clearSettings();
            this.props.clearStatus();
            this.props.logoutProvider();
            this.props.history.push("/login");
        }).catch(error => {
            // todo: Handle error
        });
    }

    closeClientConnection(client) {
        const formData = {
            connectionToken: client.token
        };
        fetch(`${config.uri}/disconnect`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status === 200) {
                this.connector.deleteClient(client.id);
                this.props.removeClient(client.id);
            } else {
                throw response;
            }
        }).catch(error => {
            this.statusHandler(error.status);
        });
    }

    handleSelectMainDirectory(event) {
        if (event.target.files[0]) {
            let dirPath = event.target.files[0].path;
            this.connector.selectedMainDirectory = dirPath;
            this.props.setMainDirectory(dirPath);
        }
    }

    handleToggleDefaultAccessRule(accessRule) {
        let readable = (accessRule === "readable") ? !this.props.settings.readable : this.props.settings.readable;
        let writable = (accessRule === "writable") ? !this.props.settings.writable : this.props.settings.writable;
        if (!readable) {
            writable = false;
        }
        const formData = {
            token: this.props.provider.token,
            readable,
            writable
        };
        fetch(`${config.uri}/access/default`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw response;
            }
        }).then(json => {
            this.props.setDefaultAccess(json.readable, json.writable);
        }).catch(error => {
            this.statusHandler(error.status);
        });
    }

    handleToggleAccessRule(username, accessRule) {
        let clientAccessRule = this.props.clientAccessRules.rules.find(c => c.username === username);
        if (!clientAccessRule) {
            clientAccessRule = {
                username,
                readable: this.props.settings.readable,
                writable: this.props.settings.writable
            };
        }
        let readable = (accessRule === "readable") ? !clientAccessRule.readable : clientAccessRule.readable;
        let writable = (accessRule === "writable") ? !clientAccessRule.writable : clientAccessRule.writable;
        if (!readable) {
            writable = false;
        }
        const formData = {
            token: this.props.provider.token,
            username,
            readable,
            writable
        };
        fetch(`${config.uri}/access/client?action=create`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw response;
            }
        }).then(json => {
            this.props.setClientAccessRule({
                username,
                readable: json.readable,
                writable: json.writable
            });
            const client = this.props.connections.clients.find(c => c.username === username);
            if (client) {
                this.props.setAccess(client.id, json.readable, json.writable);
            }
        }).catch(error => {
            this.statusHandler(error.status);
        });
    }

    removeAccessRule(username) {
        const formData = {
            token: this.props.provider.token,
            username
        };

        fetch(`${config.uri}/access/client?action=delete`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status === 200) {
                this.props.removeClientAccessRule(username);
            } else {
                throw response;
            }
        }).catch(errorCode => {
            this.statusHandler(errorCode.status);
        });
    }

    statusHandler(status) {
        switch (status.event) {
            case "connect":
                this.props.connectSuccess();
                break;
            case "connect_error":
                this.props.connectError();
                break;
            case 401:
                this.props.invalidToken();
                break;
            case "invalid_client_token":
                this.props.invalidClientToken();
                break;
            case 400:
                this.props.invalidRequest();
                break;
            case "connect_timeout":
                this.props.connectTimeout();
                break;
            case 500:
                this.props.error();
                break;
            case "disconnect":
                this.props.disconnect();
                break;
            case "reconnect_failed":
                this.props.reconnectFail();
                break;
        }
    }

    pageAccessor(action) {
        action.bind(this)();
    }

    render() {
        if (!this.props.provider.token) {
            return <Redirect to="/login"></Redirect>;
        }

        const panes = [
            {
                menuItem: "Settings",
                render: () => <SettingsComponent
                    handleSelectMainDirectory={event => this.handleSelectMainDirectory(event)}
                    initializeScan={() => this.initializeScan()}
                    toggleAccessRule={accessRule => this.handleToggleDefaultAccessRule(accessRule)}
                    logout={() => this.logout()}
                />
            },
            {
                menuItem: "Connections",
                render: () => <ConnectionsComponent
                    closeClientConnection={client => this.closeClientConnection(client)}
                    toggleAccessRule={(username, accessRule) => this.handleToggleAccessRule(username, accessRule)}
                />
            },
            {
                menuItem: "Access rules",
                render: () => <ClientAccessRulesComponent
                    toggleAccessRule={(username, accessRule) => this.handleToggleAccessRule(username, accessRule)}
                    removeAccessRule={username => this.removeAccessRule(username)}
                />
            }
        ];

        return <Grid style={{ height: "100%" }} verticalAlign="top">
            <Grid.Row textAlign="center">
                <Grid.Column>
                    <Header>DataStreamer</Header>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                    <Tab menu={{ fluid: true, vertical: true, tabular: true }} panes={panes} />
                </Grid.Column>
            </Grid.Row>
        </Grid>;
    }
}

const HomePage = connect(store => {
    return {
        provider: store.provider,
        settings: store.settings,
        connections: store.connections,
        status: store.status,
        clientAccessRules: store.clientAccessRules
    };
}, {
    addClient,
    setAccess,
    changeClientDirectory,
    changeMainDirectory,
    removeClient,
    setMainDirectory,
    clearConnections,
    toggleDefaultReadable,
    setDefaultAccess,
    toggleDefaultWritable,
    clearSettings,
    setClientAccessRule,
    removeClientAccessRule,
    clearClientAccessRules,
    logoutProvider,
    connectSuccess,
    connectError,
    invalidToken,
    invalidClientToken,
    invalidRequest,
    connectTimeout,
    disconnect,
    reconnectFail,
    error,
    clearStatus
})(Home);

export default HomePage;