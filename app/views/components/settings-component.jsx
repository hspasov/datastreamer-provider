import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Header, Message } from "semantic-ui-react";
import AccessTogglesComponent from "./access-toggles-component.jsx";

class Settings extends React.Component {
    render() {
        return <div>
            <Header>This provider:</Header>
            <p>{this.props.provider.username}</p>
            <input
                ref={node => node && (node.webkitdirectory = true)}
                type="file"
                onChange={event => this.props.handleSelectMainDirectory(event)}
            />
            <Button onClick={() => this.props.initializeScan()}>Scan directory</Button>
            <Header>Main directory path:</Header>
            <p>{this.props.settings.mainDirectory}</p>
            <Header>Access rules:</Header>
            <AccessTogglesComponent
                readable={this.props.settings.readable}
                writable={this.props.settings.writable}
                toggle={accessRule => this.props.toggleAccessRule(accessRule)}
            />
            <Header>Status:</Header>
            <Message color={(this.props.status.isError) ? "red" : "olive"} compact>
                <Message.Header>{(this.props.status.connection) ? "Online" : "Offline"}</Message.Header>
                <p>{this.props.status.message}</p>
            </Message>
            <Link to="/account-settings">Account settings</Link>
            <Button onClick={() => this.props.logout()}>Log out</Button>
        </div>;
    }
}

const SettingsComponent = connect(store => {
    return {
        provider: store.provider,
        settings: store.settings,
        status: store.status
    };
})(Settings);

export default SettingsComponent;