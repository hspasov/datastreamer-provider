import React from "react";
import { connect } from "react-redux";
import { Button, Grid, Header, Tab } from "semantic-ui-react";
import ConnectorMain from "../modules/connectorMain";

const dialog = window.require("electron").dialog;

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedRootDirectory: "NaN"
        };

        this.connector = new ConnectorMain(this.props.provider.token);
        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
        this.initializeScan = this.initializeScan.bind(this);
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

    render() {
        if (!this.props.provider.token) {
            return (
                <p>Please login or register.</p>
            );
        }

        const settings = <div>
            <input ref={node => this._addDirectory(node)} type="file" onChange={this.handleSelectRootDirectory} />
            <Button onClick={this.initializeScan}>Scan Directory</Button>
            <Header>Main directory path:</Header>
            <p>{this.state.selectedRootDirectory}</p>
        </div>;

        const clients = <div>
            <p>Empty</p>
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