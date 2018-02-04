import React from "react";
import { Checkbox, Label } from "semantic-ui-react";

class AccessRulesComponent extends React.Component {
    render() {
        return <div>
            <div>
                <Label>Readable:</Label>
                <Checkbox name="readable" toggle checked={this.props.readable} onClick={() => this.props.toggle("readable")} />
            </div>
            {this.props.readable && <div>
                <Label>Writable:</Label>
                <Checkbox name="writable" toggle checked={this.props.writable} onClick={() => this.props.toggle("writable")} />
            </div>}
        </div>;
    }
}

export default AccessRulesComponent;