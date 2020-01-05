import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

import RDFDiagram from './RDFDiagram.js';
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
	let rq = `
        construct {
          ?class_uri ?member_path ?member_class_uri.
          ?class_uri rdfs:subClassOf ?superclass_uri
        } where {
          graph <testdb:shacl-defs> {
            ?class_shape sh:targetClass ?class_uri.
            optional {?class_shape sh:property [ sh:path ?member_path; sh:class ?member_class_uri ]}
            optional {?class_uri rdfs:subClassOf ?superclass_uri}
          }
        }
        `;
	this.fuseki_prx.construct(rq).then((rq_res_) => {
	    let rq_res = utils.to_n3_model(rq_res_);
	    let ss = rq_res.getSubjects().map((x) => x.id);
	    let oss = rq_res.getObjects().map((x) => x.id);
	    let class_uris = Array.from(new Set([...ss, ...oss]));
	    let cells = class_uris.map((class_uri) => 
				       [class_uri, <SHACLClassView diagram={this.diagram.current} top_app={this.props.top_app} class_name={class_uri} el_id={"shacl-" + utils.generateQuickGuid()}/>]);
	    let cells_o = {};
	    for (let i = 0; i < cells.length; i++) {
		cells_o = {...cells_o, [cells[i][0]]: cells[i][1]};
	    }
	    //cells_o = Object.fromEntries(cells);
	    this.diagram.current.set_diagram_rdf(rq_res, cells_o);
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
		<RDFDiagram ref={this.diagram}/>
	        </div>);
    }
};

