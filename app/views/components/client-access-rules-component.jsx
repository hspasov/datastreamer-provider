import React from "react";
import { connect } from "react-redux";

class ClientAccessRules extends React.Component {
    render() {
        console.log(this.props.clientAccessRules);
        console.log(this.props.clientAccessRules.rules);
        return <div>
            {this.props.clientAccessRules.rules.map((clientAccessRule, i) => {
                return <div key={`${clientAccessRule.username}:clientAccessRule`}>
                    <p>{clientAccessRule.username}</p>
                    <p>{clientAccessRule.readable.toString()}</p>
                    <p>{clientAccessRule.writable.toString()}</p>
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