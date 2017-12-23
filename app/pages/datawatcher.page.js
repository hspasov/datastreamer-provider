import React from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Grid, Header, Label, Message, Tab } from "semantic-ui-react";
import ConnectorMain from "../modules/connectorMain";
import { Redirect } from "react-router";
import { toggleReadable, toggleWritable } from "../modules/clients";

const dialog = window.require("electron").dialog;

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clients: [],
            selectedRootDirectory: "N/A",
            isErrorState: true,
            status: "Online",
            statusMessage: "Please select a root directory!"
        };

        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
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

    handleSelectRootDirectory(event) {
        if (event.target.files[0]) {
            let dirPath = event.target.files[0].path;
            this.connector.selectedRootDirectory = dirPath; // <- very ugly, change it
            this.setState({ selectedRootDirectory: dirPath });
        }
    }

    handleToggleAccessRule(clientId, accessRule) {
        switch (accessRule) {
            case "readable":
                this.setState(prevState => ({
                    clients: toggleReadable(prevState.clients, clientId)
                }));
                break;
            case "writable":
                this.setState(prevState => ({
                    clients: toggleWritable(prevState.clients, clientId)
                }));
                break;
            default:
                console.log("Error: Invalid accessRule: ", accessRule);
        };
    }

    statusHandler(status) {
        switch (status.event) {
            case "connect":
                this.setState({
                    isErrorState: false,
                    status: "Online",
                    statusMessage: ""
                });
                break;
            case "connect_error":
                this.setState({
                    isErrorState: true,
                    status: "Offline",
                    statusMessage: "Can't connect to server."
                });
                break;
            case "connect_timeout":
                this.setState({
                    isErrorState: true,
                    status: "Offline",
                    statusMessage: "Connect timeout."
                });
                break;
            case "error":
                this.setState({
                    isErrorState: true,
                    status: "Offline",
                    statusMessage: "Error."
                });
                break;
            case "disconnect":
                this.setState({
                    isErrorState: true,
                    status: "Offline",
                    statusMessage: "Disconnected."
                });
                break;
            case "reconnect_failed":
                this.setState({
                    isErrorState: true,
                    status: "Offline",
                    statusMessage: "Reconnect failed."
                });
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
            <input ref={node => this._addDirectory(node)} type="file" onChange={this.handleSelectRootDirectory} />
            <Button onClick={this.initializeScan}>Scan Directory</Button>
            <Header>Main directory path:</Header>
            <p>{this.state.selectedRootDirectory}</p>
            <Header>Status:</Header>
            <Message color={(this.state.isErrorState)? "red" : "olive"} compact>
                <Message.Header>{this.state.status}</Message.Header>
                <p>{this.state.statusMessage}</p>
            </Message>
        </div>;

        const clients = <div>
            {this.state.clients.map((client, i) => {
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
    };
})(DataWatcher);

export default DataWatcherPage;