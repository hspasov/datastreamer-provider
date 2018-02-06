import React from "react";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";

class FormComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
        this.props.fields.forEach(field => {
            // add onchange handlers for each field
            this[`${field.label}Change`] = this.getFieldChangeHandler(field.label);
            // keep each field's value in state, initialize with ""
            this.state[field.label] = "";
        });
    }

    getFieldChangeHandler(fieldLabel) {
        return event => {
            event.preventDefault();
            const newState = {};
            newState[fieldLabel] = event.target.value;
            this.setState(newState);
        }
    }

    render() {
        return <Grid.Column style={{ maxWidth: 450 }} textAlign="center">
            <Header as="h2" color="black" textAlign="center">
                {this.props.title}
            </Header>
            <Form size="massive">
                <Segment>
                    {this.props.fields.map((field, i) => <Form.Input
                        key={field.label}
                        fluid
                        icon={field.icon}
                        iconPosition="left"
                        placeholder={field.placeholder}
                        type={field.type}
                        required={field.required}
                        onChange={event => this[`${field.label}Change`](event)}
                    />)}
                    <Button color={this.props.submit.color} fluid size="large" onClick={() => this.props.submit.onClick(this.state)}>{this.props.submit.label}</Button>
                </Segment>
            </Form>
        </Grid.Column>;
    }
}

export default FormComponent;