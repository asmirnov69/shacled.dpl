import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

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

export default class RDFDiagram extends React.Component {
    constructor(props) {
	super(props);
	this.graph = null;
    }
    
    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
	this.LoadGraph();
    }

    LoadGraph() {
	//debugger;
	// Sets the image to be used for creating new connections
	mxConnectionHandler.prototype.connectImage = new mxImage('./node_modules/mxgraph/javascript/dist/green-dot.gif', 14, 14);
	
	if (!mxClient.isBrowserSupported()) {
	    mxUtils.error('Browser is not supported!', 200, false);
	} else {
	    //mxClient.link('stylesheet', './common.css');
	    var container = d3.select('#graphContainer').node();

	    this.graph = new mxGraph(container);
	    var graph = this.graph;
	    graph.setHtmlLabels(true);
	    graph.setConnectable(true);
	    graph.setCellsDisconnectable(false);
	    graph.setCellsCloneable(false);
	    graph.setAutoSizeCells(true);
	    graph.gridSize = 40;
	    //graph.getModel().addListener(mxEvent.CHANGE, (sender, event) => { console.log("CHANGE:", sender, event) });

	    graph.getLabel = this.generate_cell_conect.bind(this);
	}
    }
    
    generate_cell_conect(cell) {
	let ret = null;
	if (cell.isEdge()) {
	    ret = cell.value;
	} else {
	    // generate_cell_content may be called more than once
	    // dom element with el_id created and populated during
	    // first call only
	    var el = document.getElementById(cell.value.props.el_id);
	    if (!el) {
		el = document.createElement("div");		    
		el.setAttribute("id", cell.value.props.el_id);
		renderSomething(cell.value, el).then(() => {
		    //console.log("renderSomething.then", cell);
		    //debugger;
		    // finding dom element from cell
		    let u_el_id = cell.value.props.el_id + "-class-ctrl";
		    var class_ctrl_n = d3.select('#' + u_el_id).node();
		    var class_ctrl_n_bb = class_ctrl_n.getBoundingClientRect();
		    let g = cell.getGeometry().clone();
		    g.width = class_ctrl_n_bb.width + 10;
		    g.height = class_ctrl_n_bb.height + 10;
		    
		    this.graph.resizeCell(cell, g);
		    //console.log("renderSomething exit", cell);
		});
	    }
	    ret = el;
	}
	return ret;
    }

    begin_update() {
	this.graph.getModel().beginUpdate();
    }

    end_update() {
	this.graph.getModel().endUpdate();
    }
    
    add_cell(v_value) {
	let parent = this.graph.getDefaultParent();	    
	let v = this.graph.insertVertex(parent, null, null, 100, 60, 120, 80, 'overflow=fill;');
	v_value.props.cell = v;
	
	this.graph.model.setValue(v, v_value);
	let tcell_state = this.graph.view.getState(v, true);
	tcell_state.style[mxConstants.STYLE_EDITABLE] = 0;		
    }

    add_arrow(from_cell, to_cell, tag) {
	//debugger;
	let parent = this.graph.getDefaultParent();
	this.graph.insertEdge(parent, null, tag, from_cell.props.cell, to_cell.props.cell);
    }

    set_diagram_rdf(cells, rdf_graph) {
	this.begin_update();
	let cell_views = Object.values(cells);
	for (let i = 0; i < cell_views.length; i++) {
	    let cell = cell_views[i];
	    this.add_cell(cell);
	}
	let triples = rdf_graph.getQuads();
	for (let i = 0; i < triples.length; i++) {
	    let subj = triples[i].subject.id;
	    let obj = triples[i].object.id;
	    if (subj in cells && obj in cells) {
		let from_cell = cells[triples[i].subject.id];
		let to_cell = cells[triples[i].object.id];
		this.add_arrow(from_cell, to_cell, utils.compact_uri(triples[i].predicate.id));
	    }
	}

	this.apply_layout();
	this.end_update();
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

