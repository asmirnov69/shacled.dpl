import React from "react";
import SHACLEditor from './SHACLEditor.js';
import ReactDataSheet from 'react-datasheet';

//
// treeview example
// https://material-ui.com/components/tree-view/
// https://github.com/mui-org/material-ui/blob/master/docs/src/pages/components/tree-view/FileSystemNavigator.js
//
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles({
  root: {
    height: 216,
    flexGrow: 1,
    maxWidth: 400,
  },
});

export default class App extends React.Component {
    constructor(props) {
	super(props);
	this.state = {
	    dialogOpen: false,
	    grid: [
		[{value:  1}, {value:  3}],
		[{value:  2}, {value:  4}]
	    ]
	};
    }

    show_dialog() {
	console.log("show_dialog");
	this.setState({...this.state, dialogOpen: true});
    }
    
    render() {
	const classes = useStyles;
	return (<div style={{display: "grid", width: "100%", height: "100%",
			     gridTemplateColumns: "180px auto",
			     gridTemplateRows: "auto 200px"}}>
		<div>
		 <TreeView className={classes.root}
		  defaultCollapseIcon={<ExpandMoreIcon />}
		  defaultExpandIcon={<ChevronRightIcon />}
		>
		  <TreeItem nodeId="1" label="Applications">
		   <TreeItem nodeId="2" label="Calendar" />
		   <TreeItem nodeId="3" label="Chrome" />
		   <TreeItem nodeId="4" label="Webstorm" />
		  </TreeItem>
		  <TreeItem nodeId="5" label="Documents">
		   <TreeItem nodeId="6" label="Material-UI">
		    <TreeItem nodeId="7" label="src">
		     <TreeItem nodeId="8" label="index.js" />
		     <TreeItem nodeId="9" label="tree-view.js" />
		    </TreeItem>
		   </TreeItem>
		  </TreeItem>
		 </TreeView>
		</div>
		<div style={{backgroundColor: "cyan"}}>
		<SHACLEditor top_app={this} db_uri_scheme="testdb"/>
		</div>
		<div style={{backgroundColor: "blue", gridColumn: "1/3"}}>
		<Button onClick={() => { this.setState({...this.state, dialogOpen: true}); }}>Open dialog</Button>
		<Dialog onClose={(v) => { this.setState({...this.state, dialogOpen: false}); }} aria-labelledby="simple-dialog-title" open={this.state.dialogOpen}>
		<DialogTitle>Test123</DialogTitle>
		</Dialog>
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

