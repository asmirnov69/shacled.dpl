import React from "react";
import * as n3 from 'n3';
import FusekiConnectionPrx from '../gen-js/FusekiConnectionPrx.js';
import * as utils from './utils.js';

//
// treeview example
// https://material-ui.com/components/tree-view/
// https://github.com/mui-org/material-ui/blob/master/docs/src/pages/components/tree-view/FileSystemNavigator.js
//

// checkboxes example:
// https://github.com/mui-org/material-ui/issues/17407
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

	this.fuseki_prx.select(rq, {}).then((rq_res) => {
	    let df = utils.to_n3_rows(rq_res);
	    let tree_leaves = this.build_tree(df, n3.DataFactory.namedNode('testdb:Security'));
	    console.log("tree_leaves: ", tree_leaves);
	    this.setState({tree_leaves: tree_leaves});
	});
    }

    build_tree(df, superclass_uri) {
	//debugger;
	let links = df.filter((x) => x.superclass_uri.value === superclass_uri.value);
	let child_elements = links.map((x) => this.build_tree(df, x.subclass_uri));
	let new_leave = React.createElement(TreeItem, {nodeId: utils.generateQuickGuid(),
						       label: superclass_uri.value},
					    child_elements
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

