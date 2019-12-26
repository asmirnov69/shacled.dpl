import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

import Diagram from './Diagram.js';
import SHACLClassView from './SHACLClassView.js';
import {getBackendCommunicator} from 'libdipole-js';
import FusekiConnectionPrx from '../gen-js/FusekiConnectionPrx.js';

export default class SHACLEditor extends React.Component {
    constructor(props) {
	super(props);
	this.fuseki_prx = null;
	this.diagram = React.createRef();
	this.add_shacl_class = this.add_shacl_class.bind(this);
	this.load_all_classes = this.load_all_classes.bind(this);
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
    }

    add_shacl_class() {
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

	    let random_uri = utils.get_uri(this.props.db_uri_scheme, utils.generateQuickGuid());
	    let rq = `insert data {
               graph <testdb:shacl-defs> { 
                  ${random_uri} rdf:type sh:NodeShape; sh:targetClass ${new_class_uri}
               }
            }`;

	    console.log(rq);
	    this.fuseki_prx.update(rq).then(() => {
		console.log("insert done");
		let v_value = <SHACLClassView diagram={this.diagram.current} top_app={this.props.top_app} class_name={class_name} el_id={"shacl-" + utils.generateQuickGuid()}/>;
		this.diagram.current.begin_update();
		this.diagram.current.add_cell(v_value);
		this.diagram.current.end_update();
	    });
	});
    }

    load_all_classes(db_uri_scheme) {
	let rq = "select ?class_uri { ?class_uri rdf:type rdfs:Class }";
	this.fuseki_prx.select(rq).then((rq_res) => {
	    console.log("classes: ", rq_res.class_uri.map(x=>x.resource));
	    let class_uris = rq_res.class_uri.map(x=>x.resource);
	    this.diagram.current.begin_update();
	    class_uris.forEach((class_uri) => {
		let v_value = <SHACLClassView diagram={this.diagram.current} top_app={this.props.top_app} class_name={class_uri} el_id={"shacl-" + utils.generateQuickGuid()}/>;
		this.diagram.current.add_cell(v_value);
	    });
	    this.diagram.current.end_update();
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
	return (<div style={{display: "grid",gridTemplateRows: "30px auto"}}>
		<button onClick={() => this.load_all_classes("testdb")}>LOAD testdb</button>
		<button onClick={() => this.add_shacl_class()}>ADD CLASS</button>
		<input type="text" defaultValue="" ref={this.new_classname} onChange={(evt) => this.new_classname.current.value = evt.target.value}/>
		<button onClick={() => this.remove()}>DEL</button>
		<Diagram ref={this.diagram}/>
	        </div>);
    }
};

