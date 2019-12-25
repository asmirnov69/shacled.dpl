import React from "react";
import ReactDOM from 'react-dom';

class SHACLClassMemberView extends React.Component {
    constructor(props) {
	super(props);
	this.path = null;
	this.is_object_literal = true;
	this.object_type = true;
	this.member_to_del = false;
	
	this.set_path = this.set_path.bind(this);
	this.set_object_type = this.set_object_type.bind(this);
	this.set_is_object_literal = this.set_is_object_literal.bind(this);
	this.set_member_to_del = this.set_member_to_del.bind(this);
    }

    set_path(evt) {
	this.path = evt.target.value;
    }

    set_object_type(evt) {
	this.object_type = evt.target.value;
    }	

    set_is_object_literal(evt) {
	this.is_object_literal = evt.target.value === "datatype";
    }

    set_member_to_del(evt) {
	//debugger;
	console.log("set_member_to_del:", evt.target.checked);
	this.member_to_del = evt.target.checked;
	this.view.member_del_checkbox_checked_state();
    }
    
    render() {
	//debugger;
	return (<tr key={this.props.fbkey}>
		<td><input type="text" style={{borderWidth: "0px"}} defaultValue={this.path} onChange={this.set_path}/></td>
		<td>
		<select defaultValue={this.is_object_literal ? "datatype" : "class"}
		        style={{borderWidth: "0px"}} onChange={this.set_is_object_literal}>
		<option value="datatype">datatype</option>
		<option value="class">{"class"}</option>
		</select>
		</td>
		<td><input type="text" style={{borderWidth: "0px"}} defaultValue={this.object_type} onChange={this.set_object_type}/></td>
		<td><input type="checkbox" onChange={this.set_member_to_del}/></td>
		</tr>);
    }
};

export default class SHACLClassView extends React.Component {
    constructor(props) {
	super(props);
	this.member_views = [];

	this.del_member_button_enabled = false;
	this.add_new_member = this.add_new_member.bind(this);
	this.remove_members_todel = this.remove_members_todel.bind(this);
    }

    //shouldComponentUpdate() {
    //return false;
    //}
    
    add_new_member() {
	//debugger;
	let new_member_view = <SHACLClassMemberView key={this.member_views.length} fbkey={this.member_views.length} view={this}/>;
	this.member_views.push(new_member_view);
	this.forceUpdate();
    }

    member_del_checkbox_checked_state() {
	//debugger;
	this.del_member_button_enabled = false;
	for (let i = 0; i < this.member_views.length; i++) {
	    let member_view = this.member_views[i];
	    let ff = member_view.member_to_del;
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
	    let ff = member_view.member_to_del;
	    if (ff) {
		todel_indexes.push(i);
	    }
	}
	
	if (todel_indexes.length > 0) {
	    for (let ii = todel_indexes.length - 1; ii >= 0; ii--) {
		this.member_views.splice(todel_indexes[ii], 1);
	    }
	    //this.forceUpdate();
	    this.member_del_checkbox_checked_state();
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
