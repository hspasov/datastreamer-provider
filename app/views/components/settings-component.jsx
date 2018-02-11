import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Button, Grid, Header, Icon, Label, Message, Segment } from "semantic-ui-react";
import AccessTogglesComponent from "./access-toggles-component.jsx";

class Settings extends React.Component {
    render() {
        return <div>
            <Segment>
                <Grid>
                    <Grid.Row columns={2}>
                        <Grid.Column style={{ maxWidth: "200px" }} verticalAlign="middle">
                            <Header>This provider:</Header>
                        </Grid.Column>
                        <Grid.Column>
                            <Label>{this.props.provider.username}</Label>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
            <Segment>
            <input
                ref={node => node && (node.webkitdirectory = true)}
                type="file"
                onChange={event => this.props.handleSelectMainDirectory(event)}
            />
            <Button
                icon
                labelPosition="right"
                primary
                onClick={() => this.props.initializeScan()}>
                Scan directory
                <Icon name="folder open outline" />
            </Button>
            </Segment>
            <Segment>
            <Header>Main directory path:</Header>
                <p>{this.props.settings.mainDirectory}</p>
            </Segment>
            <Segment>
                <Grid>
                    <Grid.Row columns={2}>
                        <Grid.Column style={{ maxWidth: "200px" }} verticalAlign="middle">
                            <Header>Access rules:</Header>
                        </Grid.Column>
                        <Grid.Column>
                        <AccessTogglesComponent
                            readable={this.props.settings.readable}
                            writable={this.props.settings.writable}
                            toggle={accessRule => this.props.toggleAccessRule(accessRule)}
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
            <Segment>
                <Grid>
                    <Grid.Row columns={2}>
                        <Grid.Column style={{ maxWidth: "200px" }} verticalAlign="middle">
                            <Header>Status:</Header>
                        </Grid.Column>
                        <Grid.Column>
                        <Message color={(this.props.status.isError) ? "red" : "olive"} compact>
                            <Message.Header>{(this.props.status.connection) ? "Online" : "Offline"}</Message.Header>
                            <p>{this.props.status.message}</p>
                            </Message>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
            <Segment>
                <Button
                    icon
                    labelPosition="left"
                    secondary
                    onClick={() => this.props.logout()}>
                    <Icon name="left arrow" />
                    Log out
                </Button>
                <Button
                    icon
                    labelPosition="right"
                    primary
                    onClick={() => this.props.history.push("/account-settings")}>
                    Account settings
                    <Icon name="settings" />
                    </Button>
            </Segment>
        </div>;
    }
}

const SettingsComponent = withRouter(connect(store => {
    return {
        provider: store.provider,
        settings: store.settings,
        status: store.status
    };
})(Settings));

export default SettingsComponent;