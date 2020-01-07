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
	    let df = utils.to_n3_rows(rq_res);
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
	let class_uris = ["testdb:Security", "testdb:Equity", "testdb:Currency"];
	//let class_uris = ["testdb:Equity"];
	let class_uris_s = "(<" + class_uris.join(">)(<") + ">)";
	let rq_diagram = `
        construct {
          ?class_uri rdfs:subClassOf ?superclass_uri;
                     ?member_path ?member_class_uri.
        } where {
          values (?class_uri) {
           ${class_uris_s}
          }
          graph <testdb:shacl-defs> {
            ?class_shape sh:targetClass ?class_uri.
            optional {?class_shape sh:property [ sh:path ?member_path; sh:class ?member_class_uri ]}
            optional {?class_uri rdfs:subClassOf ?superclass_uri}
          }
        }`;
	let rq_class_details = `
        select ?class_uri ?mpath ?mclass ?mdt 
        from <testdb:shacl-defs> 
        where {
          values (?class_uri) { ${class_uris_s} }
          ?class_shape sh:targetClass ?class_uri;
                       sh:property ?class_property.
          ?class_property sh:path ?mpath.
          optional {?class_property sh:class ?mclass}
          optional {?class_property sh:datatype ?mdt}
        }`;

	let cell_views = class_uris.map((class_uri) => 
					[class_uri, <SHACLClassView diagram={this.diagram.current} top_app={this.props.top_app} class_name={class_uri} class_details={null} cell={null} el_id={"shacl-" + utils.generateQuickGuid()}/>]);
	let cells = {}; // class_uri -> class view
	for (let i = 0; i < cell_views.length; i++) {
	    cells = {...cells, [cell_views[i][0]]: cell_views[i][1]};
	}
	//cells = Object.fromEntries(cell_views);

	this.fuseki_prx.select(rq_class_details).then((rq_res) => {
	    let class_details = utils.to_n3_rows(rq_res);
	    Object.keys(cells).forEach((k) => {
		cells[k].props.class_details = class_details
	    });
	    return this.fuseki_prx.construct(rq_diagram);
	}).then((rq_res_) => {
	    let rq_res = utils.to_n3_model(rq_res_);
	    this.diagram.current.set_diagram_rdf(cells, rq_res);
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

