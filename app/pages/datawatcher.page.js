import React from "react";
import { connect } from "react-redux";
import RTC from "../connection/rtc";

const dialog = window.require("electron").dialog;

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);

        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
        this.initializeScan = this.initializeScan.bind(this);
        this.RTC = new RTC(this.props.provider.token);
    }

    componentDidMount() {
        if (this.props.provider.token) {
            window.addEventListener("beforeunload", this.deleteSession);
        }
        this.RTC.connectToClients();
    }

    componentWillUnmount() {
        if (this.props.provider.token) {
            this.RTC.deleteSession();
            window.removeEventListener("beforeunload", this.deleteSession);
        }
    }

    initializeScan() {
        this.RTC.initializeScan();
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
            this.RTC.selectedRootDirectory = dirPath; // <- very ugly, change it
        }
    }

    render() {
        if (!this.props.provider.token) {
            return (
                <p>Please login or register.</p>
            );
        }
        return (
            <div>
                <input ref={node => this._addDirectory(node)} type="file" onChange={this.handleSelectRootDirectory} />
                <button id="scanDirectory" onClick={this.initializeScan}>Scan Directory</button>
            </div>
        );
    }
}

const DataWatcherPage = connect(store => {
    return {
        provider: store.provider,
    };
})(DataWatcher);

export default DataWatcherPage;