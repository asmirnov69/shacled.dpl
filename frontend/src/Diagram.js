import React from "react";
import ReactDOM from 'react-dom';

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

export default class Diagram extends React.Component {
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
	    graph.getLabel = this.generate_cell_conect.bind(this);
	}
    }
    
    generate_cell_conect(cell) {
	if (!cell.isEdge()) {
	    console.log("generate_cell_conect", cell);
	    //debugger;
	    var el = document.getElementById(cell.value.props.el_id + "top");
	    if (!el) {
		el = document.createElement("div");		    
		el.setAttribute("id", cell.value.props.el_id + "top");
		renderSomething(cell.value, el).then(() => {
		    console.log("renderSomething.then", cell);
		    //debugger;
		    var class_ctrl_n = d3.select('#' + cell.value.props.el_id + "-class-ctrl").node();
		    var members_ctrl_n = d3.select('#' + cell.value.props.el_id + "-members-ctrl").node();
		    var class_ctrl_n_bb = class_ctrl_n.getBoundingClientRect();
		    var members_ctrl_n_bb = members_ctrl_n.getBoundingClientRect();
		    var g = cell.getGeometry().clone();
		    g.width = Math.max(class_ctrl_n_bb.width, members_ctrl_n_bb.width) + 10;
		    g.height = class_ctrl_n_bb.height + members_ctrl_n_bb.height + 10;
		    this.graph.resizeCell(cell, g);
		    console.log("renderSomething exit", cell);
		});
		
		//debugger;
		//console.log("getLabel exit", cell);
	    } else {
		//console.log("getLabel empty exit");
	    }
	    return el;
	}
	return "rdfs:subClassOf";
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

    resize_cell(cell, g) {
	this.graph.resizeCell(cell, g);
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
		 <div id="graphOutlineContainer" style={{zIndex:"1",position:"absolute",overflow:"hidden",top:"0px",right:"0px",width:"320px",height:"120px",background:"transparent",borderStyle:"solid",borderColor:"lightgray"}}>
		 </div>
	        </div>);
    }
};

