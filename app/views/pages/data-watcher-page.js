import React from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Grid, Header, Label, Message, Tab } from "semantic-ui-react";
import MainToUnitConnector from "../../connections/main-to-unit-connector";
import { Redirect } from "react-router";
import { setAccess } from "../../store/actions/connections";
import formurlencoded from "form-urlencoded";
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
    connectTimeout,
    disconnect,
    reconnectFail,
    error
} from "../../store/actions/status";
const { dialog } = window.require("electron");

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);

        this.handleSelectMainDirectory = this.handleSelectMainDirectory.bind(this);
        this.initializeScan = this.initializeScan.bind(this);
        this.statusHandler = this.statusHandler.bind(this);
        this.pageAccessor = this.pageAccessor.bind(this);
        this.handleToggleAccessRule = this.handleToggleAccessRule.bind(this);
        this.connector = new MainToUnitConnector(this.props.provider.token, this.pageAccessor);
    }

    componentWillMount() {
        fetch("https://datastreamer.local:3000/access/provider", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", },
            body: formurlencoded({ token: this.props.provider.token })
        }).then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw response.status;
            }
        }).then(json => {
            this.props.dispatch(setDefaultAccess(json.readable, json.writable));
        }).catch(errorCode => {
            if (errorCode === 401) {
                this.statusHandler("invalid_token");
            } else if (errorCode === 500) {
                this.statusHandler("error");
            } else {
                this.statusHandler("connect_error");
            }
        });
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

    _addDirectory(node) {
        if (node) {
            node.webkitdirectory = true;
        }
    }

    selectDirectory() {
        dialog.showOpenDialog(mainWindow, {
            properties: ["openDirectory"]
        });
    }

    handleSelectMainDirectory(event) {
        if (event.target.files[0]) {
            let dirPath = event.target.files[0].path;
            this.connector.selectedRootDirectory = dirPath; // <- very ugly, change it
            this.props.dispatch(setMainDirectory(dirPath));
        }
    }

    handleToggleDefaultAccessRule(accessRule) {
        let readable = (accessRule === "readable") ? !this.props.settings.readable : this.props.settings.readable;
        let writable = (accessRule === "writable") ? !this.props.settings.writable : this.props.settings.writable;
        const formData = {
            token: this.props.provider.token,
            readable,
            writable
        };
        fetch("https://datastreamer.local:3000/access/default", {
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
            this.props.dispatch(setDefaultAccess(json.readable, json.writable));
        }).catch(errorCode => {
            if (errorCode === 401) {
                this.statusHandler("invalid_token");
            } else if (errorCode === 500) {
                this.statusHandler("error");
            } else {
                this.statusHandler("connect_error");
            }
        });
    }

    handleToggleAccessRule(clientId, accessRule) {
        const client = this.props.connections.clients.find(c => c.id === clientId);
        let readable = (accessRule === "readable")? !client.readable : client.readable;
        let writable = (accessRule === "writable")? !client.writable : client.writable;
        const formData = {
            providerToken: this.props.provider.token,
            connectionToken: client.token,
            readable,
            writable
        };
        fetch("https://datastreamer.local:3000/access/client", {
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
            this.props.dispatch(setAccess(clientId, json.readable, json.writable));
        }).catch(errorCode => {
            if (errorCode.status === 401) {
                errorCode.json().then(response => {
                    if (response.reason === "providerToken") {
                        this.statusHandler("invalid_token");
                    } else if (response.reason === "connectionToken") {
                        this.statusHandler("invalid_client_token");
                    } else {
                        this.statusHandler("error");
                    }
                });
            } else if (errorCode.status === 500) {
                this.statusHandler("error");
            } else {
                this.statusHandler("connect_error");
            }
        });
    }

    statusHandler(status) {
        switch (status.event) {
            case "connect":
                this.props.dispatch(connectSuccess());
                break;
            case "connect_error":
                this.props.dispatch(connectError());
                break;
            case "invalid_token":
                this.props.dispatch(invalidToken());
                break;
            case "invalid_client_token":
                this.props.dispatch(invalidClientToken());
                break;
            case "connect_timeout":
                this.props.dispatch(connectTimeout());
                break;
            case "error":
                this.props.dispatch(error());
                break;
            case "disconnect":
                this.props.dispatch(disconnect());
                break;
            case "reconnect_failed":
                this.props.dispatch(reconnectFail());
                break;
        }
    }

    pageAccessor(modify) {
        modify.bind(this)();
    }

    render() {
        if (!this.props.provider.token) {
            return <Redirect to="/login"></Redirect>;
        }

        const settings = <div>
            <Header>This provider:</Header>
            <p>{this.props.provider.username}</p>
            <input ref={node => this._addDirectory(node)} type="file" onChange={this.handleSelectMainDirectory} />
            <Button onClick={this.initializeScan}>Scan Directory</Button>
            <Header>Main directory path:</Header>
            <p>{this.props.settings.mainDirectory}</p>
            <Header>Access rules:</Header>
            <Label>Readable:</Label>
            <Checkbox name="readable" toggle checked={this.props.settings.readable} onClick={() => this.handleToggleDefaultAccessRule("readable")} />
            <Label>Writable:</Label>
            <Checkbox name="writable" toggle checked={this.props.settings.writable} onClick={() => this.handleToggleDefaultAccessRule("writable")} />
            <Header>Status:</Header>
            <Message color={(this.props.status.isError)? "red" : "olive"} compact>
                <Message.Header>{(this.props.status.connection) ? "Online" : "Offline"}</Message.Header>
                <p>{this.props.status.message}</p>
            </Message>
        </div>;

        const clients = <div>
            {this.props.connections.clients.map((client, i) => {
                return <div key = { client.id }>
                    <p>{client.username}</p>
                    <p>{client.token}</p>
                    <Label>Readable:</Label>
                    <Checkbox name="readable" toggle checked={client.readable} onClick={() => this.handleToggleAccessRule(client.id, "readable")} />
                    <Label>Writable:</Label>
                    <Checkbox name="writable" toggle checked={client.writable} onClick={() => this.handleToggleAccessRule(client.id, "writable")}/>
                </div>;
            })}
        </div>;

        const panes = [
            { menuItem: "Settings", render: () => settings },
            { menuItem: "Clients", render: () => clients }
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

const DataWatcherPage = connect(store => {
    return {
        provider: store.provider,
        settings: store.settings,
        connections: store.connections,
        status: store.status
    };
})(DataWatcher);

export default DataWatcherPage;