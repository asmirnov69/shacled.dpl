import React from "react";
import SHACLDiagram from './SHACLDiagram.js';
import HierarchyView from './HierarchyView.js';
import DataSheet from './DataSheet.js';

export default class SHACLEditor extends React.Component {
    constructor(props) {
	super(props);
	this.shacl_diagram = null;
    }

    render() {
	return (<div style={{display: "grid", width: "100%", height: "100%",
			     gridTemplateColumns: "180px auto",
			     gridTemplateRows: "auto 200px"}}>
		<div>
		 <HierarchyView communicator={this.props.communicator}/>
		</div>
		<div style={{backgroundColor: "cyan"}}>
		<SHACLDiagram ref={r=>this.shacl_diagram=r} communicator={this.props.communicator}/>
		</div>
		<div style={{backgroundColor: "blue", gridColumn: "1/3"}}>
		<DataSheet/>
		</div>
		</div>);
    }
};

