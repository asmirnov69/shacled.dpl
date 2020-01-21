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
	console.log("DropdownList::ctor", this.props.value);
	let init_value = this.props.value ? this.props.value : this.props.items[0]
	this.state = {value: init_value};
	this.on_change = this.on_change.bind(this);
    }

    componentDidMount() {
	console.log("DropdownList::componentDidMount");
	//if (this.props.onChange) {
	//    this.props.onChange(this.state.value ? this.state.value : this.props.items[0]);
	//}
    }
    
    on_change(evt) {
	this.setState({value: evt.target.value}, () => {
	    if (this.props.onChange) {
		this.props.onChange(this.state.value);
	    }
	});
    }
    
    render() {
	let option_values = this.props.items.map(x => {
	    let ret = null;
	    //debugger;
	    if (x == this.props.value) {
		ret = (<option value={x} selected="selected">{x}</option>);
	    } else {
		ret = (<option value={x}>{x}</option>);
	    }
	    return ret;
	});
	return (<select style={{borderWidth: "0px"}} value={this.state.value} onChange={this.on_change}>
		{option_values}
		</select>);
    }
};
