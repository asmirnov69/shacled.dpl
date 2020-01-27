import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

import RDFDiagram from './RDFDiagram.js';
import SHACLClassEditorDialog from './SHACLClassEditorDialog.js';
import {SHACLValueConstrTypeFactory, SHACLValueConstrTypeFactory_ston} from './SHACLClassProperty.js';
import {SHACLClassView, SHACLClassViewFactory} from './SHACLClassView.js';
import {DropdownList} from './misccomponents.js';

import FusekiConnectionPrx from '../gen-js/FusekiConnectionPrx.js';

export default class SHACLDiagram extends React.Component {
    constructor(props) {
	super(props);
	this.state = {class_uris: new Set([]), curr_show_class: null};

	this.fuseki_prx = null;
	this.class_view_factory = null;
	this.rdf_diagram = null;
	this.class_editor_dialog = null;

	this.add_class = this.add_class.bind(this);
	this.show_class = this.show_class.bind(this);
	this.load_classes = this.load_classes.bind(this);
	this.remove = this.remove.bind(this);	
	this.new_classname = null;

	this.on_class_uri_add = this.on_class_uri_add.bind(this);
	this.on_class_hide = this.on_class_hide.bind(this);
    }

    componentDidMount() {
	console.log("SHACLDiagram::componentDidMount");
	this.fuseki_prx = new FusekiConnectionPrx(this.props.communicator, 'shacl_editor');
	this.class_view_factory = new SHACLClassViewFactory(this, this.fuseki_prx);
	console.log("setting dataset_url on server:", this.props.dataset_url);
	this.class_view_factory.fuseki_prx.set_dataset_url(this.props.dataset_url).then(() => {
	    return this.class_view_factory.refresh(null);
	}).then(() => {
	    SHACLValueConstrTypeFactory_ston.refresh(this.class_view_factory);
	    this.load_classes();
	});
    }

    componentWillUnmount()
    {
	console.log("SHACLDiagram::componentWillUnmount:", this.props.dataset_url);
    }
    
    load_classes() {
	let class_uris = Array.from(this.state.class_uris);
	let new_uris = class_uris.filter(x => !(x in this.rdf_diagram.nodes));
	let todel_uris = Object.keys(this.rdf_diagram.nodes).filter(x => !(this.state.class_uris.has(x)));
	console.log("class_uris:", class_uris);
	console.log("new_uris:", new_uris);
	console.log("todel_uris:", todel_uris);
	let new_nodes = new_uris.map(x => [x, this.class_view_factory.get_object(x)]);
	this.rdf_diagram.set_nodes(new_nodes);
	this.rdf_diagram.remove_nodes(todel_uris);

	let ib = {};
	ib.g = "testdb:shacl-defs";
	let class_uris_s = "(<" + class_uris.join(">)(<") + ">)";
	let rq_diagram = `
        construct {
          ?class_uri rdfs:subClassOf ?superclass_uri;
                     ?cp_path ?cp_value_type_uri.
        } where {
          values (?class_uri) { ${class_uris_s} }
          graph ?g {
            ?class_shape sh:targetClass ?class_uri.
            optional {?class_shape sh:property [ 
                          sh:path ?cp_path; sh:class ?cp_value_type_uri 
                      ]}
            optional {?class_uri rdfs:subClassOf ?superclass_uri}
          }
        }`;
	
	this.fuseki_prx.construct(rq_diagram, ib).then(rq_res_ => {
	    let rq_res = utils.to_n3_model(rq_res_);
	    this.rdf_diagram.set_diagram(rq_res);
	    this.rdf_diagram.refresh();
	});
    }
    
    add_class() {
	debugger;
	let class_name = this.new_classname.value;
	if (class_name.length == 0) {
	    alert("class name is empty");
	    return;
	}
	
	let new_class_uri = "testdb:" + class_name;
	if (new_class_uri in this.class_view_factory.shacl_class_views) {
	    alert("such class is already defined");
	    return;
	}

	let random_uri = utils.get_uri("testdb:", utils.generateQuickGuid());	
	let rq = `insert data {
               graph <testdb:shacl-defs> { 
                  ${random_uri} rdf:type sh:NodeShape; sh:targetClass <${new_class_uri}>.
                  <${new_class_uri}> rdf:type rdfs:Class.
               }
               <${new_class_uri}> rdf:type rdfs:Class.
            }`;

	console.log(rq);
	this.fuseki_prx.update(rq).then(() => {
	    console.log("insert done");
	    return this.class_view_factory.refresh([new_class_uri]);
	}).then(() => {
	    let o = this.class_view_factory.get_object(new_class_uri);
	    this.rdf_diagram.set_nodes([[new_class_uri, o]]);
	    this.rdf_diagram.refresh();
	});
    }

    show_class(class_uri) {
	console.log("SHACLDiagram::show_class, defineds shacl classes:", Object.keys(this.class_view_factory.shacl_class_views));
	if (!class_uri) {
	    return;
	}
	
	if (class_uri.length == 0) {
	    alert("class name is empty");
	    return;
	}
	
	if (!(class_uri in this.class_view_factory.shacl_class_views)) {
	    alert("no such class defined: " + class_uri);
	    return;
	}

	let new_state = this.state;
	new_state.curr_show_class = class_uri;
	new_state.class_uris.add(class_uri);
	this.setState(new_state, () => this.load_classes());		
    }

    on_class_uri_add(new_class_uri) {
	console.log("new uri:", new_class_uri);
	let new_state = this.state;
	new_state.class_uris.add(new_class_uri);
	this.setState(new_state, () => this.load_classes());	
    }

    on_class_hide(class_uri) {
	let new_state = this.state;
	new_state.class_uris.delete(class_uri);
	this.setState(new_state, () => this.load_classes());		
    }
        
    remove() {
	console.log("remove", this.graph.getSelectionCount());
	if (this.graph.getSelectionCount() == 1) {
	    let selected_cell = this.graph.getSelectionCell();
	    this.graph.removeCells([selected_cell]);
	}
    }

    render() {
	console.log("SHACLDiagram::render");
	if (this.class_view_factory == null) {
	    return (<h1>loading... LOADING... loading...</h1>);
	}
	
	let all_classes = Object.keys(this.class_view_factory.shacl_class_views);	
	return (<div>
		<button onClick={this.add_class}>ADD CLASS</button>
		<DropdownList items={all_classes} selected_item={this.state.curr_show_class} onChange={v => this.show_class(v)} special_skip={true}/>
		<input type="text" defaultValue="" ref={r=>this.new_classname=r} onChange={(evt) => this.new_classname.value = evt.target.value}/>
		<input type="text" value={Array.from(this.state.class_uris).join(",")}></input>
		<button onClick={() => this.remove()}>DEL</button>
		<SHACLClassEditorDialog ref={r => this.class_editor_dialog = r} shacl_diagram={this}/>
		<RDFDiagram ref={r => this.rdf_diagram = r}/>
	        </div>);
    }
};

