import React from "react";
import SHACLDiagram from './SHACLDiagram.js';
import SHACLClassEditorDialog from './SHACLClassEditorDialog.js';
import HierarchyView from './HierarchyView.js';
import DataSheet from './DataSheet.js';

export default class App extends React.Component {
    constructor(props) {
	super(props);
	this.class_editor_dialog_ref = React.createRef();
    }

    render() {
	return (<div style={{display: "grid", width: "100%", height: "100%",
			     gridTemplateColumns: "180px auto",
			     gridTemplateRows: "auto 200px"}}>
		<div>
		 <HierarchyView communicator={this.props.communicator} top_app={this}/>
		</div>
		<div style={{backgroundColor: "cyan"}}>
		<SHACLDiagram communicator={this.props.communicator} top_app={this} db_uri_scheme="testdb"/>
		<SHACLClassEditorDialog ref={this.class_editor_dialog_ref}/>
		</div>
		<div style={{backgroundColor: "blue", gridColumn: "1/3"}}>
		<DataSheet/>
		</div>
		</div>);
    }
};

