import React from "react";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import { Link, withRouter } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Segment } from "semantic-ui-react";
import formurlencoded from "form-urlencoded";
import { loginProvider, logoutProvider } from "../../store/actions/provider";
import FormSubmitError from "../components/form-submit-error.jsx";
import config from "../../../config.json";

class AccountSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            oldPassword: "",
            newPassword: "",
            confirmNewPassword: "",
            deleteAccountPassword: "",
            showDeleteAccount: false,
            hasFormErrors: false,
            formErrors: []
        };
    }

    handleChangePasswordSubmit() {
        if (!(this.state.oldPassword &&
            this.state.newPassword &&
            this.state.confirmNewPassword)) {

            this.setState({
                hasFormErrors: true,
                formErrors: ["empty"]
            });
            return;
        } else if (this.state.newPassword !== this.state.confirmNewPassword) {
            this.setState({
                hasFormErrors: true,
                formErrors: ["match"]
            });
            return;
        }
        this.setState({
            hasFormErrors: false
        });

        const formData = {
            token: this.props.provider.token,
            oldPassword: this.state.oldPassword,
            newPassword: this.state.newPassword
        };

        fetch(`${config.uri}/provider/account`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status === 201) {
                return response.json();
            } else {
                throw response.status;
            }
        }).then(json => {
            this.props.loginProvider({
                token: json.token,
                username: this.props.provider.username
            });
            this.props.history.push("/home");
        }).catch(errorCode => {
            console.log(errorCode);
            let formErrors;
            switch (errorCode) {
                case 400:
                    formErrors = ["format"];
                    break;
                case 401:
                    formErrors = ["token"];
                    break;
                case 404:
                    formErrors = ["verification"];
                    break;
                case 500:
                    formErrors = ["error"];
                    break;
                default:
                    formErrors = ["connect"];
            }
            this.setState({
                hasFormErrors: true,
                formErrors
            });
        });
    }

    handleDeleteAccount() {
        if (!this.state.deleteAccountPassword) {
            this.setState({
                hasFormErrors: true,
                formErrors: ["empty"]
            });
            return;
        }
        this.setState({
            hasFormErrors: false
        });
        const formData = {
            token: this.props.provider.token,
            password: this.state.deleteAccountPassword
        };
        fetch(`${config.uri}/provider/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formurlencoded(formData)
        }).then(response => {
            if (response.status === 200) {
                this.props.logoutProvider();
                this.props.history.push("/login");
            } else {
                throw response.status;
            }
        }).catch(errorCode => {
            let formErrors;
            switch (errorCode) {
                case 400:
                    formErrors = ["format"];
                    break;
                case 401:
                    formErrors = ["token"];
                    break;
                case 404:
                    formErrors = ["verification"];
                    break;
                case 500:
                    formErrors = ["error"];
                    break;
                default:
                    formErrors = ["connect"];
            }
            this.setState({
                hasFormErrors: true,
                formErrors
            });
        });
    }

    handleOldPasswordChange(event) {
        event.preventDefault();
        this.setState({
            oldPassword: event.target.value
        });
    }

    handleNewPasswordChange(event) {
        event.preventDefault();
        this.setState({
            newPassword: event.target.value
        });
    }

    handleConfirmNewPasswordChange(event) {
        event.preventDefault();
        this.setState({
            confirmNewPassword: event.target.value
        });
    }

    handleDeleteAccountPasswordChange(event) {
        event.preventDefault();
        this.setState({
            deleteAccountPassword: event.target.value
        });
    }

    setShowDeleteAccount(show) {
        if (show) {
            this.setState({
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            });
        } else {
            this.setState({
                deleteAccountPassword: ""
            })
        }
        this.setState({
            showDeleteAccount: show
        });
    }

    render() {
        const changePasswordForm = <Grid.Column style={{ maxWidth: 450 }} textAlign="center">
            <Header as="h2" color="black" textAlign="center">
                Change password
            </Header>
            <Form size="massive">
                <Segment>
                    <Form.Input
                        fluid
                        icon="lock"
                        iconPosition="left"
                        placeholder="Old password"
                        required
                        type="password"
                        onChange={event => this.handleOldPasswordChange(event)}
                    />
                    <Form.Input
                        fluid
                        icon="lock"
                        iconPosition="left"
                        placeholder="New password"
                        type="password"
                        required
                        onChange={event => this.handleNewPasswordChange(event)}
                    />
                    <Form.Input
                        fluid
                        icon="lock"
                        iconPosition="left"
                        placeholder="Confirm new password"
                        type="password"
                        required
                        onChange={event => this.handleConfirmNewPasswordChange(event)}
                    />
                    <Button color="black" fluid size="large" onClick={() => this.handleChangePasswordSubmit()}>Submit</Button>
                    <Button color="red" fluid onClick={() => this.setShowDeleteAccount(true)}>Delete account</Button>
                    <FormSubmitError visible={this.state.hasFormErrors} errors={this.state.formErrors} />
                </Segment>
            </Form>
        </Grid.Column>;

        const deleteAccountForm = <Grid.Column style={{ maxWidth: 450 }} textAlign="center">
            <Header as="h2" color="black" textAlign="center">
                Change password
            </Header>
            <Form size="massive">
                <Segment>
                    <Form.Input
                        fluid
                        icon="lock"
                        iconPosition="left"
                        placeholder="Password"
                        type="password"
                        required
                        error
                        onChange={event => this.handleDeleteAccountPasswordChange(event)}
                    />
                    <Button color="red" fluid size="large" onClick={() => this.handleDeleteAccount()}>DELETE</Button>
                    <Button color="blue" fluid onClick={() => this.setShowDeleteAccount(false)}>Go back</Button>
                    <FormSubmitError visible={this.state.hasFormErrors} errors={this.state.formErrors} />
                </Segment>
            </Form>
        </Grid.Column>;

        return <div className="settings">
            <Helmet><style>{`
      body > div,
      body > div > div,
      body > div > div > div.login-form {
        height: 100%;
      }
    `}</style></Helmet>
            <Grid style={{ height: "100%" }} verticalAlign="top">
                <Grid.Row columns={2}>
                    <Grid.Column textAlign="left">
                        <Header>Datastreamer</Header>
                    </Grid.Column>
                    <Grid.Column textAlign="right">
                        <Link to="/home"><Header color="blue"><Icon corner name="arrow left" />Go back</Header></Link>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row centered>
                    {(this.state.showDeleteAccount)? deleteAccountForm : changePasswordForm }
                </Grid.Row>
            </Grid>
        </div>;
    }
}

const AccountSettingsPage = withRouter(connect(store => {
    return {
        provider: store.provider,
        router: store.router
    };
}, { loginProvider, logoutProvider })(AccountSettings));

export default AccountSettingsPage;