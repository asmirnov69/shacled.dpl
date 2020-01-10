import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

export default class SHACLClassView extends React.Component {
    constructor(props) {
	super(props);
	this.on_member_class_click = this.on_member_class_click.bind(this);
	this.on_superclass_click = this.on_superclass_click.bind(this);
	this.on_subclass_click = this.on_subclass_click.bind(this);
    }

    on_member_class_click(member_class_uri) {
	//console.log("SHACLClassView.js onClick member", member_class_uri);
	this.props.on_class_uri_add(member_class_uri);
    }

    on_superclass_click(superclass_uri) {
	//console.log("SHACLClassView.js onClick superclass_uri", superclass_uri);
	this.props.on_class_uri_add(superclass_uri);
    }

    on_subclass_click(subclass_uri) {
	this.props.on_class_uri_add(subclass_uri);
    }
    
    render() {
	//debugger;
	console.log("SHACLClassView:", this.props.class_details);
	let class_ctrl_id = this.props.el_id + "-class-ctrl";

	let class_details_pre = this.props.class_details
	    .filter((x) => x.superclass_uri == null && x.subclass_uri == null)
	    .filter((x) => x.class_uri.id == this.props.class_name)
	    .map((x) => {
		let v = null;
		if (x.mclass) {
		    v = (<a href="#" onClick={() => this.on_member_class_click(x.mclass.id)}>{utils.compact_uri(x.mclass.id)}</a>);
		} else if (x.mdt) {
		    v = utils.compact_uri(x.mdt.id);
		}
		
		return (<tr><td>{utils.compact_uri(x.mpath.id)}</td><td><i>{v}</i></td></tr>);
	    });
	let superclass_uris = this.props.class_details
	    .filter((x) => x.class_uri.id == this.props.class_name && x.superclass_uri != null)
	    .map((x) => (<a href="#" onClick={() => this.on_superclass_click(x.superclass_uri.id)}>{x.superclass_uri.id}</a>));
	let subclass_uris = this.props.class_details
	    .filter((x) => x.class_uri.id == this.props.class_name && x.subclass_uri != null)
	    .map((x) => (<a href="#" onClick={() => this.on_subclass_click(x.subclass_uri.id)}>{x.subclass_uri.id}</a>));

	let heading = null;
	if (superclass_uris.length > 0) {
	    heading = (<td><b>{this.props.class_name}</b>(<i>{superclass_uris}</i>)</td>);
	} else {
	    heading = (<td><b>{this.props.class_name}</b></td>);
	}
	
	return (
		<table id={class_ctrl_id}>
		 <tbody>
		<tr>{heading}
		 <td><input type="button" value="++" onClick={()=>this.props.top_app.class_editor_dialog_ref.current.show_dialog(this.props.class_name)}/></td>
		 <td><input type="button" value="S"/></td>
		  </tr>
	        {class_details_pre}
	        <tr><td>{subclass_uris}</td></tr>
	         </tbody>
	        </table>
	);
    }
};
