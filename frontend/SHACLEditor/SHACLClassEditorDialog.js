import React from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as utils from './utils.js';

export default class SHACLClassEditorDialog extends React.Component {
    constructor(props) {
	super(props);
	this.state = {class_uri: null, dialog_open: false};
    }

    show_dialog(class_uri) {
	this.setState({...this.state, dialog_open: true, class_uri: class_uri});
    }
    
    render() {
	let member_rows = null;
	if (this.props.top_app.shacl_diagram_ref.current) {
	    let class_details = this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.class_details[this.state.class_uri];
	    debugger;
	    member_rows = class_details.filter(x => x.mpath != null).map(x => {
		let m_type = x.mdt ? x.mdt.id : x.mclass.id;
		return (<tr><td><h1>{x.mpath.id}</h1></td><td><i>{m_type}</i></td></tr>);
	    });
	}
	
	return (
	    	<Dialog onClose={(v) => { this.setState({...this.state, dialog_open: false}); }} aria-labelledby="simple-dialog-title" open={this.state.dialog_open}>
		<DialogTitle>{this.state.class_uri}</DialogTitle>
		<table>
		<tbody>
		{member_rows}
		</tbody>
		</table>
		</Dialog>
	);
    }
};
