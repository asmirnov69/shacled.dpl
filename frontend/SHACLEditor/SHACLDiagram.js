import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

import RDFDiagram from './RDFDiagram.js';
import SHACLClassView from './SHACLClassView.js';
import FusekiConnectionPrx from '../gen-js/FusekiConnectionPrx.js';

class SHACLClassViewFactory {
    constructor(fuseki_prx) {
	this.fuseki_prx = fuseki_prx;
	this.class_details = null;
    }

    refresh(class_uris) {
	let values_class_uris = '';
	if (class_uris) {
	    let class_uris_s = "(<" + class_uris.join(">)(<") + ">)";
	    values_class_uris = `values (?class_uri) { ${class_uri_s} }`;
	}
	let rq_class_details = `
            select ?class_uri ?mpath ?mclass ?mdt ?superclass_uri ?subclass_uri
            from <testdb:shacl-defs> 
            where {
              ${values_class_uris}
              {
              ?class_shape sh:targetClass ?class_uri; sh:property ?class_property.
              ?class_property sh:path ?mpath.
              optional {?class_property sh:class ?mclass}
              optional {?class_property sh:datatype ?mdt}
              } union {
               ?class_uri rdfs:subClassOf ?superclass_uri
              } union {
               ?subclass_uri rdfs:subClassOf ?class_uri
              }
            }`;

	return this.fuseki_prx.select(rq_class_details).then(rq_res => {
	    this.class_details = utils.to_n3_rows(rq_res);
	    return Promise.resolve();
	});
    }
    
    get_object(class_uri, props) {
	return (<SHACLClassView class_name={class_uri}
		                class_details={this.class_details}
		                el_id={"shacl-" + utils.generateQuickGuid()}
		                {...props}/>);
    }
};

export default class SHACLDiagram extends React.Component {
    constructor(props) {
	super(props);
	this.state = {class_uris: ['testdb:Equity']}
	this.fuseki_prx = new FusekiConnectionPrx(this.props.communicator, 'shacl_editor');
	this.shacl_class_view_factory = new SHACLClassViewFactory(this.fuseki_prx);
	this.diagram = React.createRef();
	this.add_shacl_class = this.add_shacl_class.bind(this);
	this.load_classes = this.load_classes.bind(this);
	this.remove = this.remove.bind(this);	
	this.new_classname = React.createRef();

	this.on_class_uri_add = this.on_class_uri_add.bind(this);
    }

    componentDidMount() {
	this.shacl_class_view_factory.refresh(null).then(() => {
	    this.load_classes();
	});
    }

    load_classes() {
	let class_uris = this.state.class_uris;
	let db_uri_scheme = this.props.db_uri_scheme;
	let class_uris_s = "(<" + class_uris.join(">)(<") + ">)";
	let rq_diagram = `
        construct {
          ?class_uri rdfs:subClassOf ?superclass_uri;
                     ?member_path ?member_class_uri.
        } where {
          values (?class_uri) { ${class_uris_s} }
          graph <testdb:shacl-defs> {
            ?class_shape sh:targetClass ?class_uri.
            optional {?class_shape sh:property [ sh:path ?member_path; sh:class ?member_class_uri ]}
            optional {?class_uri rdfs:subClassOf ?superclass_uri}
          }
        }`;

	let new_uris = class_uris.filter(x => !(x in this.diagram.current.nodes));
	let new_node_props = {diagram: this.diagram.current,
	                      top_app: this.props.top_app,
	                      cell: null,
		              on_class_uri_add: (new_class_uri)=> this.on_class_uri_add(new_class_uri),
		              on_class_uri_del: (del_class_uri)=>console.log("del url:", del_class_uri)};
	let new_nodes = new_uris.map(x => [x, this.shacl_class_view_factory.get_object(x, new_node_props)]);
	this.diagram.current.set_nodes(new_nodes);

	this.fuseki_prx.construct(rq_diagram).then(rq_res_ => {
	    let rq_res = utils.to_n3_model(rq_res_);
	    this.diagram.current.set_diagram(rq_res);
	    this.diagram.current.refresh();
	});
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

    on_class_uri_add(new_class_uri) {
	console.log("new uri:", new_class_uri);
	let new_state = this.state;
	new_state.class_uris.push(new_class_uri);
	this.setState(new_state, () => this.load_classes());	
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
		<button onClick={() => this.add_shacl_class()}>ADD CLASS</button>
		<button onClick={() => this.apply_layout()}>layout</button>
		<input type="text" defaultValue="" ref={this.new_classname} onChange={(evt) => this.new_classname.current.value = evt.target.value}/>
		<input type="text" value={this.state.class_uris.join(",")}></input>
		<button onClick={() => this.remove()}>DEL</button>
		<RDFDiagram ref={this.diagram}/>
	        </div>);
    }
};

