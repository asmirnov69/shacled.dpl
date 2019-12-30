import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

import Diagram from './Diagram.js';
import SHACLClassView from './SHACLClassView.js';
import FusekiConnectionPrx from '../gen-js/FusekiConnectionPrx.js';

export default class SHACLEditor extends React.Component {
    constructor(props) {
	super(props);
	this.fuseki_prx = new FusekiConnectionPrx(this.props.communicator, 'shacl_editor');
	this.diagram = React.createRef();
	this.add_shacl_class = this.add_shacl_class.bind(this);
	this.load_all_classes = this.load_all_classes.bind(this);
	this.remove = this.remove.bind(this);	
	this.new_classname = React.createRef();
    }
    
    shouldComponentUpdate() {
        return false;
    }

    add_shacl_class() {
	let class_name = this.new_classname.current.value;
	let new_class_uri = utils.get_uri(this.props.db_uri_scheme, class_name);
	let rq = `select ?class_shape from <testdb:shacl-defs> where { ?class_shape sh:targetClass ${new_class_uri} }`;
	console.log("rq:", rq);
        this.fuseki_prx.select(rq).then((rq_res) => {
	    let df = utils.to_n3_rows(rq_res)
	    //debugger;
	    if (df.length > 0) {
		alert("such class is already defined");
		return;
	    }

	    let random_uri = utils.get_uri(this.props.db_uri_scheme, utils.generateQuickGuid());
	    let rq = `insert data {
               graph <testdb:shacl-defs> { 
                  ${random_uri} rdf:type sh:NodeShape; sh:targetClass ${new_class_uri}.
                  ${new_class_uri} rdf:type rdfs:Class.
               }
               ${new_class_uri} rdf:type rdfs:Class.
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
	this.fuseki_prx.select(rq).then((rq_res_) => {
	    let rq_res = utils.to_n3_rows(rq_res_);
	    console.log("classes: ", rq_res.map(x=>x.class_uri.value));
	    let class_uris = rq_res.map(x=>x.class_uri);
	    this.diagram.current.begin_update();
	    class_uris.forEach((class_uri) => {
		let v_value = <SHACLClassView diagram={this.diagram.current} top_app={this.props.top_app} class_name={class_uri.value} el_id={"shacl-" + utils.generateQuickGuid()}/>;
		this.diagram.current.add_cell(v_value);
	    });
	    this.diagram.current.end_update();
	});
    }

    apply_layout() {
	this.diagram.current.apply_layout();
    }
    
    remove() {
	console.log("remove", this.graph.getSelectionCount());
	if (this.graph.getSelectionCount() == 1) {
	    let selected_cell = this.graph.getSelectionCell();
	    this.graph.removeCells([selected_cell]);
	}
    }    

    render() {
	return (<div>
		<button onClick={() => this.load_all_classes("testdb")}>LOAD testdb</button>
		<button onClick={() => this.add_shacl_class()}>ADD CLASS</button>
		<button onClick={() => this.apply_layout()}>layout</button>
		<input type="text" defaultValue="" ref={this.new_classname} onChange={(evt) => this.new_classname.current.value = evt.target.value}/>
		<button onClick={() => this.remove()}>DEL</button>
		<Diagram ref={this.diagram}/>
	        </div>);
    }
};

