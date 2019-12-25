import React from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class SHACLClassEditorDialog extends React.Component {
    constructor(props) {
	super(props);
	this.state = {class_uri: null, dialog_open: false};
    }

    show_dialog(class_uri) {
	this.setState({...this.state, dialog_open: true, class_uri: class_uri});
    }
    
    render() {
	return (
	    	<Dialog onClose={(v) => { this.setState({...this.state, dialog_open: false}); }} aria-labelledby="simple-dialog-title" open={this.state.dialog_open}>
		<DialogTitle>{this.state.class_uri}</DialogTitle>
		</Dialog>
	);
    }
};
