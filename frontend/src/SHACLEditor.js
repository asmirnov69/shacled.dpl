import React from "react";
import ReactDOM from 'react-dom';

import SHACLClass from './SHACLClass.js';
import SHACLClassView from './SHACLClassView.js';
let SHACLEditorMod = window.SHACLEditorMod;

// suggested here: https://github.com/facebook/react/issues/10266#issuecomment-318120709
function renderSomething(instance, container) {
  return new Promise((resolve, reject) => {
    try {
      ReactDOM.render(instance, container, function () {
        resolve(this);
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
	this.add_shacl_classes = this.add_shacl_classes.bind(this);
	this.remove = this.remove.bind(this);
	this.save = this.save.bind(this);
	this.load = this.load.bind(this);
	this.filename = React.createRef();
    }
    
    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
	getBackendPort().then((backend_port) => {
	    let backend_proxy_s = `shacl_editor:ws -h localhost -p ${backend_port}`;
	    let fuseki_proxy_s = `fuseki:ws -h localhost -p ${backend_port}`;
	    return Promise.all([window.ic.stringToProxy(backend_proxy_s),
				window.ic.stringToProxy(fuseki_proxy_s)])
	}).then(([o_prx, o_fuseki_prx]) => {
	    return Promise.all(
		[SHACLEditorMod.SHACLEditorIfcPrx.checkedCast(o_prx),
		 SHACLEditorMod.FusekiConnectionPrx.checkedCast(o_fuseki_prx)])
	}).then(([prx, fuseki_prx]) => {
	    this.prx = prx;
	    this.fuseki_prx = fuseki_prx;
	    console.log("connected to backend", this.prx, this.fuseki_prx);
	});
	this.LoadGraph();
    }

    LoadGraph() {
	debugger;
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

    add_shacl_classes(shacl_class_jsons, shacl_class_subclass_links) {
	console.log("add_shacl_classes");
	let parent = this.graph.getDefaultParent();
	this.graph.getModel().beginUpdate();
	try {
	    //debugger;
	    let cells_d = {}
	    for (let i = 0; i < shacl_class_jsons.length; i++) {
		let cell_json = shacl_class_jsons[i];
		var v = null;
		if (cell_json) {
		    v = this.graph.insertVertex(parent, null, null, cell_json.cell_geom.x, cell_json.cell_geom.y,
						cell_json.cell_geom.width, cell_json.cell_geom.height, 'overflow=fill;');
		    cells_d[cell_json.class_name] = v;
		} else {
		    // adding new shacl class
		    v = this.graph.insertVertex(parent, null, null, 100, 60, 120, 80, 'overflow=fill;');
		    let vid = v.id;
		    let rq = `insert data { graph <testdb:shacl-defs> { <testdb:${vid}> rdf:type sh:NodeShape } }`;
		    console.log(rq)
		    let edd = new SHACLEditorMod.SUBLDict();
		    this.fuseki_prx.update(rq, edd).then(() => {
			console.log("insert done");
		    });
		}

		let m = new SHACLClass();
		if (cell_json) {
		    m.set_from_json(cell_json);
		}
		let v_value = <SHACLClassView model={m} el_id={"shacl-" + v.id} graph={this.graph} cell={v}/>;
		this.graph.model.setValue(v, v_value);
		let tcell_state = this.graph.view.getState(v, true);
		tcell_state.style[mxConstants.STYLE_EDITABLE] = 0;
	    }

	    if (shacl_class_subclass_links) {
		for (let i = 0; i < shacl_class_subclass_links.length; i++) {
		    let source_class_name = shacl_class_subclass_links[i][0];
		    let target_class_name = shacl_class_subclass_links[i][1];
		    let source_cell = cells_d[source_class_name];
		    let target_cell = cells_d[target_class_name];
		    this.graph.insertEdge(parent, null, null, source_cell, target_cell, null);
		}
	    }
	} finally {
	    this.graph.getModel().endUpdate();
	}
    }

    remove() {
	console.log("remove", this.graph.getSelectionCount());
	if (this.graph.getSelectionCount() == 1) {
	    let selected_cell = this.graph.getSelectionCell();
	    this.graph.removeCells([selected_cell]);
	}
    }
    
    save() {
	console.log("save", this.filename.current.value);
	
	let cells = this.graph.getChildCells(this.graph.getDefaultParent(), true, true);
	let shacl_subclass_links = [];
	let shacl_class_jsons = [];
	for (var i = 0; i < cells.length; i++) {
	    let cell = cells[i];
	    if (cell.isEdge()) {
		let subclass_name = cell.source.value.props.model.class_name;
		let class_name = cell.target.value.props.model.class_name;
		shacl_subclass_links.push([subclass_name, class_name])
	    } else {
		// cell.value.props.model --> SHACLClass
		//debugger;
		let cell_geom = this.graph.model.getGeometry(cell);
		let cell_geom_json = {x: cell_geom.x, y: cell_geom.y, width: cell_geom.width, height: cell_geom.height};
		let shacl_class_json = cell.value.props.model.get_json();
		shacl_class_json.cell_geom = cell_geom_json;
		shacl_class_jsons.push(shacl_class_json);
	    }
	}

	let shacl_diagram = {classes: shacl_class_jsons,
			     class_subclass_links: shacl_subclass_links};
	let json = JSON.stringify(shacl_diagram);
	this.prx.saveDia(this.filename.current.value, json).then(() => {
	    console.log("saved");
	});
    }

    load() {
	this.prx.loadDia(this.filename.current.value).then((json_message) => {
	    //console.log("load:", json_message, this.filename.current.value);
	    let j = JSON.parse(json_message);
	    this.add_shacl_classes(j.classes, j.class_subclass_links);
	});						     
    }
    
    render() {
	return (<div style={{
	    display: "grid",
	    gridTemplateRows: "30px auto"}}
		>
		<div>
		 <button onClick={() => this.add_shacl_classes([null])}>ADD CLASS</button>
		 <button onClick={this.save}>SAVE</button>
		 <button onClick={this.load}>LOAD</button>
		 <input type="text" defaultValue="" ref={this.filename} onChange={(evt) => this.filename.current.value = evt.target.value}/>
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

