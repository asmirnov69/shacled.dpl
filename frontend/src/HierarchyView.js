import React from "react";
import FusekiConnectionPrx from '../gen-js/FusekiConnectionPrx.js';
import * as utils from './utils.js';

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

const useStyles = makeStyles({
  root: {
    height: 216,
    flexGrow: 1,
    maxWidth: 400,
  },
});


class HierarchyView extends React.Component {
    constructor(props) {
	super(props);
	this.fuseki_prx = new FusekiConnectionPrx(this.props.communicator, 'shacl_editor');
	this.state = {tree_leaves: []};
	this.refresh = this.refresh.bind(this);
    }

    componentDidMount() {
	this.refresh()
    }
    
    refresh() {
	let rq = `
        select * { 
         ?superclass_uri rdf:type rdfs:Class. 
         ?subclass_uri rdfs:subClassOf ?superclass_uri
        }
        `;

	this.fuseki_prx.select(rq).then((df) => {
	    let tree_leaves = this.build_tree(df, 'testdb:Security');
	    console.log("tree_leaves: ", tree_leaves);
	    this.setState({tree_leaves: tree_leaves});
	});
    }

    build_tree(df, superclass_uri) {
	//let links = df.filter((x) => x.superclass_uri === superclass_uri);
	let links = [];
	for (let i = 0; i < df['superclass_uri'].length; i++) {
	    if (df['superclass_uri'][i].resource === superclass_uri) {
		links.push({superclass_uri: df['superclass_uri'][i].resource,
			    subclass_uri: df['subclass_uri'][i].resource});
	    }
	}
	let child_elements = [];
	for (let i = 0; i < links.length; i++) {
	    child_elements.push(this.build_tree(df, links[i].subclass_uri));
	}
	let new_id = utils.generateQuickGuid();
	let new_leave = React.createElement(TreeItem,
					    {nodeId: new_id, label: superclass_uri},
					    child_elements.length > 0 ? child_elements : null
					   );
	return new_leave;
    }
    
    render() {
	const classes = useStyles;
	return (
		<div>
		<button onClick={this.refresh}>load</button>
		<TreeView className={classes.root}
		  defaultCollapseIcon={<ExpandMoreIcon />}
		  defaultExpandIcon={<ChevronRightIcon />}
		>
		{this.state.tree_leaves}
	    </TreeView>
		</div>
	);
    }
};

export default HierarchyView;

