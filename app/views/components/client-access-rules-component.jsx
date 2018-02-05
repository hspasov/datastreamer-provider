import React from "react";
import { connect } from "react-redux";
import { Button } from "semantic-ui-react";
import AccessTogglesComponent from "./access-toggles-component.jsx";

class ClientAccessRules extends React.Component {
    render() {
        return <div>
            {this.props.clientAccessRules.rules.map((clientAccessRule, i) => {
                return <div key={`${clientAccessRule.username}:clientAccessRule`}>
                    <p>{clientAccessRule.username}</p>
                    <AccessTogglesComponent
                        readable={clientAccessRule.readable}
                        writable={clientAccessRule.writable}
                        toggle={accessRule => this.props.toggleAccessRule(clientAccessRule.username, accessRule)}
                    />
                    <Button onClick={() => this.props.removeAccessRule(clientAccessRule.username)}>Remove</Button>
                </div>;
            })}
        </div>;
    }
}

const ClientAccessRulesComponent = connect(store => {
    return {
        clientAccessRules: store.clientAccessRules
    };
})(ClientAccessRules);

export default ClientAccessRulesComponent;