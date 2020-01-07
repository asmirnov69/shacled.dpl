import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

export default class SHACLClassView extends React.Component {
    constructor(props) {
	super(props);
    }
    
    componentDidUpdate() {
	this.props.diagram.resize_cell(this.props.cell);
    }
    
    render() {
	//debugger;
	console.log("SHACLClassView:", this.props.class_details);
	let class_ctrl_id = this.props.el_id + "-class-ctrl";
	let members_ctrl_id = this.props.el_id + "-members-ctrl";

	let class_details_pre = this.props.class_details
	    .filter((x) => x.class_uri.id == this.props.class_name)
	    .map((x) => {
	    return x.class_uri.id + " " + x.mpath.id + " "
		+ (x.mclass ? x.mclass.id : "-") + " " + (x.mdt ? x.mdt.id : "--");
	}).join("\n");
	
	return (
		<div id={this.props.el_id} style={{overflow: "hidden"}}>
		<table id={class_ctrl_id}>
		<tbody>
		<tr>
		<td><input type="text" defaultValue={this.props.class_name} readOnly/></td>
		<td><input type="button" value="++" onClick={()=>this.props.top_app.class_editor_dialog_ref.current.show_dialog(this.props.class_name)}/></td>
		</tr>
		</tbody>
		</table>

		<div id={members_ctrl_id} style={{borderSpacing: "0px", borderCollapse: "collapse"}}>
		<pre>
		{class_details_pre}
	        </pre>
		</div>
	     </div>
	);
    }
};
