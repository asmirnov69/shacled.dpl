import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

class Badge extends React.Component {
    constructor(props) {
	super(props);
    }
    
    render() {
	return (<div>
		<h1>{this.props.text}</h1>
		</div>);
    }
};

// suggested here: https://github.com/facebook/react/issues/10266#issuecomment-318120709
function renderSomething(instance, container) {
  return new Promise((resolve, reject) => {
    try {
      ReactDOM.render(instance, container, function () {
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

class RDFDiagramNode {
    constructor(node_component) {
	this.cell = null; // mxGraph cell
	this.node_component = node_component; // react component representing node
	this.mark_to_remove = false;
    }

    add_to_diagram(rdf_diagram) {
	let parent = rdf_diagram.graph.getDefaultParent();	    
	this.cell = rdf_diagram.graph.insertVertex(parent, null, null, 100, 60, 120, 80, 'overflow=fill;');
	
	rdf_diagram.graph.model.setValue(this.cell, this);
	let tcell_state = rdf_diagram.graph.view.getState(this.cell, true);
	tcell_state.style[mxConstants.STYLE_EDITABLE] = 0;		
    }

    remove_from_diagram(rdf_diagram) {
	//debugger;
	rdf_diagram.graph.removeCells([this.cell], true);
	this.cell = null;
    }
};

export default class RDFDiagram extends React.Component {
    constructor(props) {
	super(props);
	this.graph = null;
	this.nodes = {}; // uri -> RDFDiagramNode
    }
    
    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
	this.__LoadGraph();
    }

    __LoadGraph() {
	//debugger;
	// Sets the image to be used for creating new connections
	//mxConnectionHandler.prototype.connectImage = new mxImage('./node_modules/mxgraph/javascript/dist/green-dot.gif', 14, 14);
	
	if (!mxClient.isBrowserSupported()) {
	    mxUtils.error('Browser is not supported!', 200, false);
	} else {
	    //mxClient.link('stylesheet', './common.css');
	    let container = document.getElementById('graphContainer');

	    this.graph = new mxGraph(container);
	    var graph = this.graph;
	    graph.setHtmlLabels(true);
	    //graph.setConnectable(true);
	    graph.setCellsDisconnectable(false);
	    graph.setCellsCloneable(false);
	    graph.setAutoSizeCells(true);
	    graph.gridSize = 40;
	    //graph.getModel().addListener(mxEvent.CHANGE, (sender, event) => { console.log("CHANGE:", sender, event) });

	    graph.getLabel = this.__generate_cell_content.bind(this);
	}
    }
    
    __generate_cell_content(cell) {
	let ret = null;
	if (cell.isEdge()) {
	    ret = cell.value;
	} else {
	    // generate_cell_content may be called more than once
	    // dom element with el_id created and populated during
	    // first call only
	    let el = document.getElementById(cell.value.node_component.props.el_id);
	    if (!el) {
		el = document.createElement("div");		    
		el.setAttribute("id", cell.value.node_component.props.el_id);
		renderSomething(cell.value.node_component, el).then(() => {
		    //console.log("renderSomething.then", cell);
		    //debugger;
		    // finding dom element from cell
		    let u_el_id = cell.value.node_component.props.el_id + "-class-ctrl";
		    let class_ctrl_node = document.getElementById(u_el_id);
		    if (class_ctrl_node) {
			let class_ctrl_bb = class_ctrl_node.getBoundingClientRect();
			let g = cell.getGeometry().clone();
			g.width = class_ctrl_bb.width + 10;
			g.height = class_ctrl_bb.height + 10;
			this.graph.resizeCell(cell, g);
		    }
		    //console.log("renderSomething exit", cell);
		});
	    }
	    ret = el;
	}
	return ret;
    }

    __add_arrow(from_cell, to_cell, tag) {
	//debugger;
	let parent = this.graph.getDefaultParent();
	this.graph.insertEdge(parent, null, tag, from_cell.cell, to_cell.cell);
    }

    set_nodes(nodes) {
	for (let [uri, node_component] of nodes) {
	    this.nodes[uri] = new RDFDiagramNode(node_component);
	}
    }

    remove_nodes(node_uris) {
	for (let node_uri of node_uris) {
	    this.nodes[node_uri].mark_to_remove = true;
	}	    
    }
    
    set_diagram(rdf_graph) {
	this.rdf_graph = rdf_graph;
    }

    refresh() {
	this.graph.getModel().beginUpdate();
	let todel_node_uris = [];
	for (let [uri, node] of Object.entries(this.nodes)) {
	    if (node.mark_to_remove) {
		node.remove_from_diagram(this);
		node.mark_to_remove = false;
		todel_node_uris.push(uri);
	    } else if (!node.cell) {
		node.add_to_diagram(this);
	    }
	}

	for (let uri of todel_node_uris) {
	    delete this.nodes[uri];
	}

	let triples = this.rdf_graph.getQuads();
	for (let i = 0; i < triples.length; i++) {
	    let subj = triples[i].subject.id;
	    let obj = triples[i].object.id;
	    if (subj in this.nodes && obj in this.nodes) {
		let from_cell = this.nodes[triples[i].subject.id];
		let to_cell = this.nodes[triples[i].object.id];
		this.__add_arrow(from_cell, to_cell, utils.compact_uri(triples[i].predicate.id));
	    }
	}
	
	this.graph.getModel().endUpdate();	
    }

    apply_layout() {
	//let layout = new mxCircleLayout(this.graph);

	let first = new mxFastOrganicLayout(this.graph);
	let second = new mxParallelEdgeLayout(this.graph);
	let layout = new mxCompositeLayout(this.graph, [first, second], first);
	
	//let layout = new mxPartitionLayout(this.graph, true, 10, 20);
	//let layout = new mxRadialTreeLayout(this.graph);
	//let layout = new mxStackLayout(this.graph, true);
	//let layout = new mxCompactTreeLayout(this.graph);
	//let layout = new mxFastOrganicLayout(this.graph);
	//mxHierarchicalLayout.prototype.edgeStyle = mxHierarchicalEdgeStyle.STRAIGHT;
	//let layout = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_NORTH);
	//layout.forceConstant = 80;

	this.graph.getModel().beginUpdate();
	layout.execute(this.graph.getDefaultParent());
	this.graph.getModel().endUpdate();
    }
    
    render() {
	return (<div style={{display: "grid", gridTemplateRows: "30px auto"}}>
		 <div>
		  <button onClick={() => this.graph.zoomIn()}>+</button>
		  <button onClick={() => this.graph.zoomOut()}>-</button>
		  <button onClick={() => this.graph.zoomActual()}>1:1</button>
		 </div>
		 <div id="graphContainer" style={{overflow:'hidden'}}>
		 </div>
	        </div>);
    }
};

