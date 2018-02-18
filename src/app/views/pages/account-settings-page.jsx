import React from "react";
import { Redirect } from "react-router";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import { Link, withRouter } from "react-router-dom";
import { Grid, Header, Icon, Tab } from "semantic-ui-react";
import formurlencoded from "form-urlencoded";
import ChangeAccountPasswordComponent from "../components/change-account-password-component.jsx";
import ChangeClientConnectPasswordComponent from "../components/change-client-connect-password-component.jsx";
import DeleteAccountComponent from "../components/delete-account-component.jsx";

class AccountSettings extends React.Component {
    render() {
        if (!this.props.provider.token) {
            return <Redirect to="/login"></Redirect>;
        }

        const panes = [
            {
                menuItem: "Change account password",
                render: () => <ChangeAccountPasswordComponent />
            },
            {
                menuItem: "Change client connect password",
                render: () => <ChangeClientConnectPasswordComponent />
            },
            {
                menuItem: "Delete account",
                render: () => <DeleteAccountComponent/>
            }
        ];

        return <div className="settings">
            <Helmet>
                <style>{`
                    body > div,
                    body > div > div,
                    body > div > div > div.login-form {
                        height: 100%;
                    }
                `}</style>
            </Helmet>
            <Grid style={{ height: "100%" }} verticalAlign="top">
                <Grid.Row columns={2}>
                    <Grid.Column textAlign="left">
                        <Header>Datastreamer</Header>
                    </Grid.Column>
                    <Grid.Column textAlign="right">
                        <Link to="/home">
                            <Header color="blue">
                                <Icon corner name="arrow left" />Go back
                            </Header>
                        </Link>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Tab menu={{ fluid: true, vertical: true, tabular: true }} panes={panes} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>;
    }
}

const AccountSettingsPage = connect(store => {
    return {
        provider: store.provider
    };
})(AccountSettings);

export default AccountSettingsPage;