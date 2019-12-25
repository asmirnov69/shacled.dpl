import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

import SHACLClassView from './SHACLClassView.js';
import {getBackendCommunicator} from 'libdipole-js';
import FusekiConnectionPrx from '../gen-js/FusekiConnectionPrx.js';

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

export default class SHACLEditor extends React.Component {
    constructor(props) {
	super(props);
	this.graph = null;
	this.LoadGraph = this.LoadGraph.bind(this);
	this.add_shacl_class = this.add_shacl_class.bind(this);
	this.remove = this.remove.bind(this);
	this.new_classname = React.createRef();
    }
    
    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
	getBackendCommunicator().then((communicator) => {
	    this.fuseki_prx = new FusekiConnectionPrx(communicator, 'shacl_editor');
	});
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
	    var outline_container = d3.select('#graphOutlineContainer').node();
	    this.graph = new mxGraph(container);
	    var graph = this.graph;
	    graph.setHtmlLabels(true);
	    graph.setConnectable(true);
	    graph.setCellsDisconnectable(false);
	    graph.setCellsCloneable(false);
	    graph.setAutoSizeCells(true);
	    //graph.getModel().addListener(mxEvent.CHANGE, (sender, event) => { console.log("CHANGE:", sender, event) });
	    new mxOutline(graph, outline_container);

	    graph.getLabel = (cell) => {
		if (!cell.isEdge()) {
		    //console.log("getLabel", cell);
		    //debugger;
		    var el = document.getElementById(cell.value.props.el_id + "top");
		    if (!el) {
			el = document.createElement("div");		    
			el.setAttribute("id", cell.value.props.el_id + "top");
			renderSomething(cell.value, el).then(() => {
			    //console.log("renderSomething", cell);
			    //debugger;
			    var class_ctrl_n = d3.select('#' + cell.value.props.el_id + "-class-ctrl").node();
			    var members_ctrl_n = d3.select('#' + cell.value.props.el_id + "-members-ctrl").node();
			    var class_ctrl_n_bb = class_ctrl_n.getBoundingClientRect();
			    var members_ctrl_n_bb = members_ctrl_n.getBoundingClientRect();
			    var g = cell.getGeometry().clone();
			    g.width = Math.max(class_ctrl_n_bb.width, members_ctrl_n_bb.width) + 10;
			    g.height = class_ctrl_n_bb.height + members_ctrl_n_bb.height + 10;
			    this.graph.resizeCell(cell, g);
			    //console.log("renderSomething exit", cell);
			});
			
			//debugger;
			//console.log("getLabel exit", cell);
		    } else {
			//console.log("getLabel empty exit");
		    }
		    return el;
		}
		return "rdfs:subClassOf";
	    };
	}
    }

    add_shacl_class()
    {
	let class_name = this.new_classname.current.value;
	let new_class_uri = utils.get_uri(this.props.db_uri_scheme, class_name);
	let rq = `select ?class_shape from <testdb:shacl-defs> where { ?class_shape sh:targetClass ${new_class_uri} }`;
	console.log("rq:", rq);
        this.fuseki_prx.select(rq).then((res) => {
	    //debugger;
	    if (res['class_shape'].length > 0) {
		alert("such class is already defined");
		return;
	    }
	
	    let parent = this.graph.getDefaultParent();
	    this.graph.getModel().beginUpdate();

	    //debugger;
	    // adding new shacl class
	    let v = this.graph.insertVertex(parent, null, null, 100, 60, 120, 80, 'overflow=fill;');
	    let vid = "shacl-" + utils.generateQuickGuid();
	    let vid_uri = utils.get_uri(this.props.db_uri_scheme, vid);
	    let rq = `insert data {
               graph <testdb:shacl-defs> { 
                  ${vid_uri} rdf:type sh:NodeShape; sh:targetClass ${new_class_uri}
               }
            }`;

	    console.log(rq);
	    this.fuseki_prx.update(rq).then(() => {
		console.log("insert done");
	    });

	    let v_value = <SHACLClassView top_app={this.props.top_app} class_name={class_name} el_id={vid} graph={this.graph} cell={v} editor={this}/>;
	    this.graph.model.setValue(v, v_value);
	    let tcell_state = this.graph.view.getState(v, true);
	    tcell_state.style[mxConstants.STYLE_EDITABLE] = 0;
	    this.graph.getModel().endUpdate();
	});
    }

    remove() {
	console.log("remove", this.graph.getSelectionCount());
	if (this.graph.getSelectionCount() == 1) {
	    let selected_cell = this.graph.getSelectionCell();
	    this.graph.removeCells([selected_cell]);
	}
    }    

    render() {
	return (<div style={{
	    display: "grid",
	    gridTemplateRows: "30px auto"}}
		>
		<div>
		<button onClick={() => this.add_shacl_class()}>ADD CLASS</button>
		 <input type="text" defaultValue="" ref={this.new_classname} onChange={(evt) => this.new_classname.current.value = evt.target.value}/>
		 <button onClick={() => this.graph.zoomIn()}>+</button>
		 <button onClick={() => this.graph.zoomOut()}>-</button>
		 <button onClick={() => this.graph.zoomActual()}>1:1</button>
		 <button onClick={() => this.remove()}>DEL</button>
		</div>
		<div id="graphContainer" style={{overflow:'hidden'}}>
		</div>
		<div id="graphOutlineContainer" style={{zIndex:"1",position:"absolute",overflow:"hidden",top:"0px",right:"0px",width:"320px",height:"120px",background:"transparent",borderStyle:"solid",borderColor:"lightgray"}}>
		</div>
	        </div>);
    }
};

