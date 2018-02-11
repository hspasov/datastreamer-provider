import React from "react";
import { Checkbox, Header } from "semantic-ui-react";

class AccessTogglesComponent extends React.Component {
    render() {
        return <div>
            <div>
                <Header as="h4">
                    Readable:
                    <Checkbox name="readable" toggle checked={this.props.readable} onClick={() => this.props.toggle("readable")} />
                </Header>
            </div>
            {this.props.readable && <div>
                <Header as="h4">
                    Writable:
                    <Checkbox name="writable" toggle checked={this.props.writable} onClick={() => this.props.toggle("writable")} />
                </Header>
            </div>}
        </div>;
    }
}

export default AccessTogglesComponent;