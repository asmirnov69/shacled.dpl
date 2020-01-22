import React from 'react';

export class MyChip extends React.Component {
    constructor(props) {
	super(props);
    }
    render() {
	return (<div>{this.props.label}<button onClick={() => this.props.onDelete(this.props.label)}>x</button></div>);
    }
};

export class DropdownList extends React.Component {
    constructor(props) {
	super(props);
	this.state = {selected_item: this.props.selected_item};
	this.on_change = this.on_change.bind(this);
    }

    componentDidMount() {
	//console.log("DropdownList::componentDidMount", this.state);
	if (this.props.special_skip) {
	    return;
	}
	if (this.props.onChange && this.state.selected_item == null) {
	    this.props.onChange(this.props.items[0]);
	}	
    }
    
    on_change(evt) {
	this.setState({selected_item: evt.target.value}, () => {
	    if (this.props.onChange) {
		this.props.onChange(this.state.selected_item);
	    }
	});
    }
    
    render() {
	let option_values = this.props.items.map(x => {
	    let ret = null;
	    if (x == this.state.selected_item) {
		ret = (<option value={x} selected="selected">{x}</option>);
	    } else {
		ret = (<option value={x}>{x}</option>);
	    }
	    return ret;
	});

	return (<select style={{borderWidth: "0px"}} value={this.state.selected_item} onChange={this.on_change}>
		{option_values}
		</select>);
    }
};
