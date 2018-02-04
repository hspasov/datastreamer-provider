import React from "react";
import { connect } from "react-redux";
import { Button, Header } from "semantic-ui-react";
import AccessRulesComponent from "./access-rules-component.jsx";

class Connections extends React.Component {
    render() {
        return <div>
            {this.props.connections.clients.map((client, i) => {
                return <div key={client.id}>
                    <p>{client.username}</p>
                    <div>
                        <Button onClick={() => this.props.closeClientConnection(client)}>Close connection</Button>
                    </div>
                    <AccessRulesComponent
                        readable={client.readable}
                        writable={client.writable}
                        toggle={accessRule => this.props.toggleAccessRule(client.id, accessRule)}
                    />
                    <div>
                        <Header>Current directory:</Header>
                        <p>{client.directory}</p>
                    </div>
                </div>;
            })}
        </div>;
    }
}

const ConnectionsComponent = connect(store => {
    return {
        connections: store.connections
    };
})(Connections);

export default ConnectionsComponent;
