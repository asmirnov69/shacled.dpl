import React from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Chip from '@material-ui/core/Chip';
import * as utils from './utils.js';

export default class SHACLClassEditorDialog extends React.Component {
    constructor(props) {
	super(props);
	this.state = {class_uri: null, dialog_open: false};
    }

    show_dialog(class_uri) {
	this.setState({...this.state, dialog_open: true, class_uri: class_uri});
    }

    __get_member_row(r) {
	let is_literal = r.mdt != null;
	let object_type = r.mdt != null ? r.mdt.id : r.mclass.id;
	let ret = (<tr key={utils.generateQuickGuid()}>
		   <td><input type="text" tyle={{borderWidth: "0px"}} value={r.mpath.id} onChange={null}/></td>
		   <td><select value={is_literal ? "datatype" : "class"} style={{borderWidth: "0px"}}
		               onChange={this.set_is_object_literal}>
		        <option value="datatype">datatype</option>
		        <option value="class">{"class"}</option>
		       </select></td>
		   <td><input type="text" style={{borderWidth: "0px"}} value={object_type} onChange={this.set_object_type}/></td>
		   <td><button>X</button></td>
		   </tr>);
	return ret;
    }

    
    render() {
	let member_rows = null;
	let superclasses = null;
	if (this.props.top_app.shacl_diagram_ref.current) {
	    debugger;
	    let shacl_class_view = this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.shacl_class_views[this.state.class_uri].props.self;
	    superclasses = shacl_class_view.get_superclass_uris().map(x => (<Chip label={x} onDelete={() => {return}}/>));
	    member_rows = shacl_class_view.get_members().map(x => this.__get_member_row(x));
	}

	
	return (
	    	<Dialog onClose={(v) => { this.setState({...this.state, dialog_open: false}); }} aria-labelledby="simple-dialog-title" open={this.state.dialog_open}>
		<DialogTitle>{this.state.class_uri}</DialogTitle>
		<div>superclasses:{superclasses}<button>add</button></div>
		<br/>
		<table>
		<tbody>
		<tr><td><input type="text"/><button>Add</button></td></tr>
		{member_rows}
		</tbody>
		</table>
		</Dialog>
	);
    }
};
