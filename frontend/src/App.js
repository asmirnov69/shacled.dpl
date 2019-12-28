import React from "react";
import SHACLEditor from './SHACLEditor.js';
import SHACLClassEditorDialog from './SHACLClassEditorDialog.js';
import HierarchyView from './HierarchyView.js';
import ReactDataSheet from 'react-datasheet';

export default class App extends React.Component {
    constructor(props) {
	super(props);
	this.class_editor_dialog_ref = React.createRef();
	this.state = {
	    classEditorDialogOpen: false,
	    grid: [
		[{value:  1}, {value:  3}],
		[{value:  2}, {value:  4}]
	    ]
	};
    }

    render() {
	return (<div style={{display: "grid", width: "100%", height: "100%",
			     gridTemplateColumns: "180px auto",
			     gridTemplateRows: "auto 200px"}}>
		<div>
		  <HierarchyView top_app={this}/>
		</div>
		<div style={{backgroundColor: "cyan"}}>
		<SHACLEditor top_app={this} db_uri_scheme="testdb"/>
		<SHACLClassEditorDialog ref={this.class_editor_dialog_ref}/>
		</div>
		<div style={{backgroundColor: "blue", gridColumn: "1/3"}}>
		<ReactDataSheet
		  data={this.state.grid}
		 valueRenderer={(cell) => cell.value}
		 onCellsChanged={changes => {
		    const grid = this.state.grid.map(row => [...row])
		    changes.forEach(({cell, row, col, value}) => {
			grid[row][col] = {...grid[row][col], value}
		    })
		    this.setState({grid})
		}}
		/>
		</div>
		</div>);
    }
};

