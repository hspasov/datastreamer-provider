import React from "react";
import { connect } from "react-redux";
import { Grid, Header, Tab } from "semantic-ui-react";
import MainToUnitConnector from "../../connections/main-to-unit-connector";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import { addClient, setAccess, changeClientDirectory, removeClient } from "../../store/actions/connections";
import formurlencoded from "form-urlencoded";
import ConnectionsComponent from "../components/connections-component.jsx";
import SettingsComponent from "../components/settings-component.jsx";
import {
    setMainDirectory,
    toggleDefaultReadable,
    setDefaultAccess,
    toggleDefaultWritable
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
    error
} from "../../store/actions/status";
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
        this.connector.initializeScan();
    }

    selectDirectory() {
        dialog.showOpenDialog(mainWindow, {
            properties: ["openDirectory"]
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
                throw response.status;
            }
        }).catch(errorCode => {
            if (errorCode === 500) {
                this.statusHandler("error");
            } else {
                this.statusHandler("connect_error");
            }
        });
    }

    handleSelectMainDirectory(event) {
        if (event.target.files[0]) {
            let dirPath = event.target.files[0].path;
            this.connector.selectedMainDirectory = dirPath;
            this.props.setMainDirectory(dirPath);
        }
    }

    handleRemoveBan(client) {
        this.props.removeBanned(client.username);
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
                throw response.status;
            }
        }).then(json => {
            this.props.setDefaultAccess(json.readable, json.writable);
        }).catch(errorCode => {
            switch (errorCode) {
                case 400:
                    this.statusHandler("invalid_request");
                    break;
                case 401:
                    this.statusHandler("invalid_token");
                    break;
                case 500:
                    this.statusHandler("error");
                    break;
                default:
                    this.statusHandler("connect_error");
                    break;
            }
        });
    }

    handleToggleAccessRule(clientId, accessRule) {
        const client = this.props.connections.clients.find(c => c.id === clientId);
        let readable = (accessRule === "readable")? !client.readable : client.readable;
        let writable = (accessRule === "writable") ? !client.writable : client.writable;
        if (!readable) {
            writable = false;
        }
        const formData = {
            providerToken: this.props.provider.token,
            connectionToken: client.token,
            readable,
            writable
        };
        fetch(`${config.uri}/access/client`, {
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
            this.props.setAccess(clientId, json.readable, json.writable);
        }).catch(errorCode => {
            switch (errorCode.status) {
                case 400:
                    this.statusHandler("invalid_request");
                    break;
                case 401:
                    errorCode.json().then(response => {
                        if (response.reason === "providerToken") {
                            this.statusHandler("invalid_token");
                        } else if (response.reason === "connectionToken") {
                            this.statusHandler("invalid_client_token");
                        } else {
                            this.statusHandler("error");
                        }
                    });
                    break;
                case 500:
                    this.statusHandler("error");
                    break;
                default:
                    this.statusHandler("connect_error");
            }
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
            case "invalid_token":
                this.props.invalidToken();
                break;
            case "invalid_client_token":
                this.props.invalidClientToken();
                break;
            case "invalid_request":
                this.props.invalidRequest();
                break;
            case "connect_timeout":
                this.props.connectTimeout();
                break;
            case "error":
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
                />
            },
            {
                menuItem: "Connections",
                render: () => <ConnectionsComponent
                    closeClientConnection={client => this.closeClientConnection(client)}
                    toggleAccessRule={(clientId, accessRule) => this.handleToggleAccessRule(clientId, accessRule)}
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
        banned: store.banned
    };
}, {
    addClient,
    setAccess,
    changeClientDirectory,
    removeClient,
    setMainDirectory,
    toggleDefaultReadable,
    setDefaultAccess,
    toggleDefaultWritable,
    connectSuccess,
    connectError,
    invalidToken,
    invalidClientToken,
    invalidRequest,
    connectTimeout,
    disconnect,
    reconnectFail,
    error
})(Home);

export default HomePage;