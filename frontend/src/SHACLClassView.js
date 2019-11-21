import React from "react";
import ReactDOM from 'react-dom';
import { SHACLClassMember } from './SHACLClass.js'

class SHACLClassMemberView extends React.Component {
    constructor(props) {
	super(props);
	this.set_path = this.set_path.bind(this);
	this.set_object_type = this.set_object_type.bind(this);
	this.set_is_object_literal = this.set_is_object_literal.bind(this);
	this.set_member_to_del = this.set_member_to_del.bind(this);
    }

    set_path(evt) {
	this.props.model.path = evt.target.value;
    }

    set_object_type(evt) {
	this.props.model.object_type = evt.target.value;
    }	

    set_is_object_literal(evt) {
	this.props.model.is_object_literal = evt.target.value === "datatype";
    }

    set_member_to_del(evt) {
	//debugger;
	console.log("set_member_to_del:", evt.target.checked);
	this.props.model.member_to_del = evt.target.checked;
	this.props.view.member_del_checkbox_checked_state();
    }
    
    render() {
	//debugger;
	return (<tr key={this.props.fbkey}>
		<td><input type="text" style={{borderWidth: "0px"}} defaultValue={this.props.model.path} onChange={this.set_path}/></td>
		<td>
		<select defaultValue={this.props.model.is_object_literal ? "datatype" : "class"}
		        style={{borderWidth: "0px"}} onChange={this.set_is_object_literal}>
		<option value="datatype">datatype</option>
		<option value="class">{"class"}</option>
		</select>
		</td>
		<td><input type="text" style={{borderWidth: "0px"}} defaultValue={this.props.model.object_type} onChange={this.set_object_type}/></td>
		<td><input type="checkbox" onChange={this.set_member_to_del}/></td>
		</tr>);
    }
};

export default class SHACLClassView extends React.Component {
    constructor(props) {
	super(props);
	this.member_views = [];
	for (let i = 0; i < this.props.model.members.length; i++) {
	    let member = this.props.model.members[i];
	    let member_view = <SHACLClassMemberView key={i} fbkey={i} model={member} view={this}/>;
	    this.member_views.push(member_view);
	}
	this.del_member_button_enabled = false;
	this.set_class_name = this.set_class_name.bind(this);
	this.add_new_member = this.add_new_member.bind(this);
	this.remove_members_todel = this.remove_members_todel.bind(this);
    }

    add_new_member() {
	//debugger;
	let new_member = this.props.model.add_new_member();
	let new_member_view = <SHACLClassMemberView key={this.props.model.members.length} fbkey={this.props.model.members.length} model={new_member} view={this}/>;
	this.member_views.push(new_member_view);
	this.forceUpdate();
    }

    member_del_checkbox_checked_state() {
	//debugger;
	this.del_member_button_enabled = false;
	for (let i = 0; i < this.member_views.length; i++) {
	    let member_view = this.member_views[i];
	    let ff = member_view.props.model.member_to_del;
	    if (ff) {
		this.del_member_button_enabled = true;
		break;
	    }
	}
	this.forceUpdate();    
    }

    remove_members_todel() {
	//debugger;
	let todel_indexes = [];
	for (let i = 0; i < this.member_views.length; i++) {
	    let member_view = this.member_views[i];
	    let ff = member_view.props.model.member_to_del;
	    if (ff) {
		todel_indexes.push(i);
	    }
	}
	
	if (todel_indexes.length > 0) {
	    for (let ii = todel_indexes.length - 1; ii >= 0; ii--) {
		this.member_views.splice(todel_indexes[ii], 1);
		this.props.model.members.splice(todel_indexes[ii], 1);
	    }
	    //this.forceUpdate();
	    this.member_del_checkbox_checked_state();
	}
    }
    
    set_class_name(evt) {
	this.props.model.class_name = evt.target.value;
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
		<td><input type="text" defaultValue={this.props.model.class_name} onChange={this.set_class_name}/></td>
		<td><input type="button" value="+" onClick={this.add_new_member}/></td>
		<td><button disabled={!this.del_member_button_enabled} onClick={this.remove_members_todel}>-</button></td>
		</tr>
		</tbody>
		</table>

		<table id={members_ctrl_id} style={{borderSpacing: "0px", borderCollapse: "collapse"}}>
		<tbody>
		 {this.member_views}
	        </tbody>
		</table>
	     </div>
	);
    }
};



