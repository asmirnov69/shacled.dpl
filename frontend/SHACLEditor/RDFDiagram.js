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

class RDFDiagramCell {
    constructor(cell_view_component) {
	this.cell = null;
	this.cell_view_component = cell_view_component;
    }

    add_to_diagram(rdf_diagram) {
	let parent = rdf_diagram.graph.getDefaultParent();	    
	this.cell = rdf_diagram.graph.insertVertex(parent, null, null, 100, 60, 120, 80, 'overflow=fill;');
	
	rdf_diagram.graph.model.setValue(this.cell, this);
	let tcell_state = rdf_diagram.graph.view.getState(this.cell, true);
	tcell_state.style[mxConstants.STYLE_EDITABLE] = 0;		
    }

    remove_from_diagram(rdf_diagram) {
	rdf_diagram.graph.removeCell(this.cell);
    }
};

export default class RDFDiagram extends React.Component {
    constructor(props) {
	super(props);
	this.graph = null;
	this.uri_cells = {}; // uri -> RDFDiagramCell
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
	    var container = d3.select('#graphContainer').node();

	    this.graph = new mxGraph(container);
	    var graph = this.graph;
	    graph.setHtmlLabels(true);
	    //graph.setConnectable(true);
	    graph.setCellsDisconnectable(false);
	    graph.setCellsCloneable(false);
	    graph.setAutoSizeCells(true);
	    graph.gridSize = 40;
	    //graph.getModel().addListener(mxEvent.CHANGE, (sender, event) => { console.log("CHANGE:", sender, event) });

	    graph.getLabel = this.__generate_cell_conect.bind(this);
	}
    }
    
    __generate_cell_conect(cell) {
	let ret = null;
	if (cell.isEdge()) {
	    ret = cell.value;
	} else {
	    // generate_cell_content may be called more than once
	    // dom element with el_id created and populated during
	    // first call only
	    var el = document.getElementById(cell.value.cell_view_component.props.el_id);
	    if (!el) {
		el = document.createElement("div");		    
		el.setAttribute("id", cell.value.cell_view_component.props.el_id);
		renderSomething(cell.value.cell_view_component, el).then(() => {
		    //console.log("renderSomething.then", cell);
		    //debugger;
		    // finding dom element from cell
		    let u_el_id = cell.value.cell_view_component.props.el_id + "-class-ctrl";
		    let class_ctrl_dom = null;
		    try {
			class_ctrl_dom = d3.select('#' + u_el_id);
		    } catch (err) {
		    }
		    
		    if (class_ctrl_dom && class_ctrl_dom.node()) {
			let class_ctrl_bb = class_ctrl_dom.node().getBoundingClientRect();
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

    set_diagram(rdf_graph, req_new_uri_cells_cb, delete_uri_cells_cb) {
	let ss = rdf_graph.getSubjects().map((x) => x.id);
	let oss = rdf_graph.getObjects().map((x) => x.id);
	let rdf_graph_uris = new Set([...ss, ...oss]);
	let diagram_uris = new Set(Object.keys(this.uri_cells));
	let new_uris = Array.from(new Set([...rdf_graph_uris].filter(x => !diagram_uris.has(x))));
	let todel_uris = Array.from(new Set([...diagram_uris].filter(x => !rdf_graph_uris.has(x))));

	if (delete_uri_cells_cb) {
	    delete_uri_cells_cb(todel_uris.map((k) => this.uri_cells[k]));
	}

	let new_uri_cells = null;
	if (req_new_uri_cells_cb) {
	    new_uri_cells = req_new_uri_cells_cb(new_uris);
	} else {
	    new_uri_cells = new_uris.map((new_uri) => {
		return [new_uri,
			new RDFDiagramCell((<Badge el_id={utils.generateQuickGuid()} text={new_uri}/>))];
	    });
	}

	this.graph.getModel().beginUpdate();
	todel_uris.forEach((todel_uri) => {
	    this.uri_cells[todel_uri].remove_from_diagram(this);
	    delete this.uri_cells[todel_uri];
	});
		
	for (let [new_uri, new_uri_cell] of new_uri_cells) {
	    this.uri_cells[new_uri] = new_uri_cell;
	    new_uri_cell.add_to_diagram(this);
	}

	let triples = rdf_graph.getQuads();
	for (let i = 0; i < triples.length; i++) {
	    let subj = triples[i].subject.id;
	    let obj = triples[i].object.id;
	    //assert(subj in this.uri_cells && obj in this.uri_cells);
	    let from_cell = this.uri_cells[triples[i].subject.id];
	    let to_cell = this.uri_cells[triples[i].object.id];
	    this.__add_arrow(from_cell, to_cell, utils.compact_uri(triples[i].predicate.id));	    
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

