import React from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Grid, Header, Label, Message, Tab } from "semantic-ui-react";
import ConnectorMain from "../modules/connectorMain";
import { Redirect } from "react-router";
import { toggleReadable, toggleWritable } from "../actions/connections";
import {
    setMainDirectory
} from "../actions/settings";
import {
    connectSuccess,
    connectError,
    connectTimeout,
    disconnect,
    reconnectFail,
    error
} from "../actions/status";
const dialog = window.require("electron").dialog;

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);

        this.handleSelectMainDirectory = this.handleSelectMainDirectory.bind(this);
        this.initializeScan = this.initializeScan.bind(this);
        this.statusHandler = this.statusHandler.bind(this);
        this.pageAccessor = this.pageAccessor.bind(this);
        this.handleToggleAccessRule = this.handleToggleAccessRule.bind(this);
        this.connector = new ConnectorMain(this.props.provider.token, this.pageAccessor);
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
        switch (accessRule) {
            case "readable":
                break;
            case "writable":
                break;
            default:
                console.log("Error: invalid access rule", accessRule);
        }
    }

    handleToggleAccessRule(clientId, accessRule) {
        switch (accessRule) {
            case "readable":
                this.props.dispatch(toggleReadable(clientId));
                break;
            case "writable":
                this.props.dispatch(toggleWritable(clientId));
                break;
            default:
                console.log("Error: Invalid accessRule: ", accessRule);
        };
    }

    statusHandler(status) {
        switch (status.event) {
            case "connect":
                this.props.dispatch(connectSuccess());
                break;
            case "connect_error":
                this.props.dispatch(connectError());
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