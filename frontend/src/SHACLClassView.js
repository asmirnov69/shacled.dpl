import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

class SHACLClassMemberView extends React.Component {
    constructor(props) {
	super(props);
	this.state = {path: null, is_object_literal: true, object_type: true, member_to_del: false};
	this.set_path = this.set_path.bind(this);
	this.set_object_type = this.set_object_type.bind(this);
	this.set_is_object_literal = this.set_is_object_literal.bind(this);
	this.set_member_to_del = this.set_member_to_del.bind(this);
    }

    set_path(evt) {
	this.setState({path: evt.target.value});
    }

    set_object_type(evt) {
	this.setState({object_type: evt.target.value});
    }	

    set_is_object_literal(evt) {
	this.setState({is_object_literal: evt.target.value === "datatype"});
    }

    set_member_to_del(evt) {
	debugger;
	console.log("set_member_to_del:", evt.target.checked);
	this.setState({member_to_del: evt.target.checked}, () => {
	    this.props.view.member_del_checkbox_checked_state();
	});
    }
    
    render() {
	//debugger;
	return (<tr key={this.props.fbkey}>
		<td><input type="text" style={{borderWidth: "0px"}} value={this.state.path} onChange={this.set_path}/></td>
		<td>
		<select value={this.state.is_object_literal ? "datatype" : "class"}
		        style={{borderWidth: "0px"}} onChange={this.set_is_object_literal}>
		<option value="datatype">datatype</option>
		<option value="class">{"class"}</option>
		</select>
		</td>
		<td><input type="text" style={{borderWidth: "0px"}} value={this.state.object_type} onChange={this.set_object_type}/></td>
		<td><input type="checkbox" value={this.state.member_to_del} onChange={this.set_member_to_del}/></td>
		</tr>);
    }
};

export default class SHACLClassView extends React.Component {
    constructor(props) {
	super(props);
	this.state = {member_views: [], del_member_button_enabled: false};
	this.add_new_member = this.add_new_member.bind(this);
	this.remove_members_todel = this.remove_members_todel.bind(this);
    }

    add_new_member() {
	//debugger;
	let new_ref = React.createRef();
	//let new_key = this.state.member_views.length; // -- this choice of key causes wrong behaviour
	let new_key = utils.generateQuickGuid();
	let new_member_view = <SHACLClassMemberView ref={new_ref} key={new_key} fbkey={new_key} view={this}/>;
	let member_views = this.state.member_views;
	member_views.push([new_member_view, new_ref]);
	this.setState({member_views: member_views});
    }

    member_del_checkbox_checked_state() {
	//debugger;
	let del_member_button_enabled = false;
	for (let i = 0; i < this.state.member_views.length; i++) {
	    let member_view_ref = this.state.member_views[i][1];
	    let ff = member_view_ref.current.state.member_to_del;
	    if (ff) {
		del_member_button_enabled = true;
		break;
	    }
	}
	this.setState({del_member_button_enabled: del_member_button_enabled});
    }

    remove_members_todel() {
	let todel_indexes = [];
	for (let i = 0; i < this.state.member_views.length; i++) {
	    let member_view = this.state.member_views[i][1];
	    let ff = member_view.current.state.member_to_del;
	    if (ff) {
		todel_indexes.push(i);
	    }
	}

	//debugger;
	let member_views = this.state.member_views;
	if (todel_indexes.length > 0) {
	    for (let ii = todel_indexes.length - 1; ii >= 0; ii--) {
		member_views.splice(todel_indexes[ii], 1);
	    }
	    this.setState({member_views: member_views}, () => this.member_del_checkbox_checked_state());
	}
    }
    
    componentDidUpdate() {
	let dom_el = ReactDOM.findDOMNode(this);
	var class_ctrl_n = d3.select('#' + dom_el.id + "-class-ctrl").node();
	var members_ctrl_n = d3.select('#' + dom_el.id + "-members-ctrl").node();
	var class_ctrl_n_bb = class_ctrl_n.getBoundingClientRect();
	var members_ctrl_n_bb = members_ctrl_n.getBoundingClientRect();
	var g = this.props.cell.getGeometry().clone();
	g.width = Math.max(class_ctrl_n_bb.width, members_ctrl_n_bb.width) + 10;
	g.height = class_ctrl_n_bb.height + members_ctrl_n_bb.height + 10;
	this.props.graph.resizeCell(this.props.cell, g);
    }
    
    render() {
	//debugger;
	let class_ctrl_id = this.props.el_id + "-class-ctrl";
	let members_ctrl_id = this.props.el_id + "-members-ctrl";
	return (
		<div id={this.props.el_id} style={{overflow: "hidden"}}>
		<table id={class_ctrl_id}>
		<tbody>
		<tr>
		<td><input type="text" defaultValue={this.props.class_name} readOnly/></td>
		<td><input type="button" value="+" onClick={()=>this.add_new_member()}/></td>
		<td><input type="button" value="++" onClick={()=>this.props.top_app.class_editor_dialog_ref.current.show_dialog(this.props.class_name)}/></td>
		<td><button disabled={!this.state.del_member_button_enabled} onClick={this.remove_members_todel}>-</button></td>
		</tr>
		</tbody>
		</table>

		<table id={members_ctrl_id} style={{borderSpacing: "0px", borderCollapse: "collapse"}}>
		<tbody>
		{this.state.member_views.map((x) => x[0])}
	        </tbody>
		</table>
	     </div>
	);
    }
};
