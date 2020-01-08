import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

export default class SHACLClassView extends React.Component {
    constructor(props) {
	super(props);
    }
        
    render() {
	//debugger;
	console.log("SHACLClassView:", this.props.class_details);
	let class_ctrl_id = this.props.el_id + "-class-ctrl";

	let class_details_pre = this.props.class_details
	    .filter((x) => x.superclass_uri == null)
	    .filter((x) => x.class_uri.id == this.props.class_name)
	    .map((x) => {
		let v = null;
		if (x.mclass) {
		    v = (<a href='#'>{utils.compact_uri(x.mclass.id)}</a>);
		} else if (x.mdt) {
		    v = utils.compact_uri(x.mdt.id);
		}
		
		return (<tr><td>{utils.compact_uri(x.mpath.id)}</td><td><i>{v}</i></td></tr>);
	    });
	let superclass_uris = this.props.class_details
	    .filter((x) => x.class_uri.id == this.props.class_name && x.superclass_uri != null)
	    .map((x) => (<a href='#'>{x.superclass_uri.id}</a>));
	return (
		<table id={class_ctrl_id}>
		 <tbody>
		  <tr>
		   <td><b>{this.props.class_name}</b></td>
		   <td><i>{superclass_uris}</i></td>
		   <td><input type="button" value="++" onClick={()=>this.props.top_app.class_editor_dialog_ref.current.show_dialog(this.props.class_name)}/></td>
		  </tr>
	         {class_details_pre}
	         </tbody>
	        </table>
	);
    }
};
