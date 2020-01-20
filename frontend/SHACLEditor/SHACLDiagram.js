import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

import RDFDiagram from './RDFDiagram.js';
import {SHACLValueConstrTypeFactory, SHACLValueConstrTypeFactory_ston} from './SHACLClassProperty.js';
import {SHACLClassView, SHACLClassViewFactory, SHACLClassViewFactory_ston} from './SHACLClassView.js';
import {DropdownList} from './misccomponents.js';

import FusekiConnectionPrx from '../gen-js/FusekiConnectionPrx.js';

export default class SHACLDiagram extends React.Component {
    constructor(props) {
	super(props);
	this.state = {class_uris: new Set([])};
	this.fuseki_prx = new FusekiConnectionPrx(this.props.communicator, 'shacl_editor');
	this.diagram = React.createRef();
	this.add_class = this.add_class.bind(this);
	this.show_class = this.show_class.bind(this);
	this.load_classes = this.load_classes.bind(this);
	this.remove = this.remove.bind(this);	
	this.new_classname = React.createRef();

	this.on_class_uri_add = this.on_class_uri_add.bind(this);
	this.on_class_hide = this.on_class_hide.bind(this);
    }

    componentDidMount() {
	SHACLClassViewFactory_ston.set_fuseki_prx(this.fuseki_prx);
	SHACLClassViewFactory_ston.set_shacl_diagram(this);
	SHACLClassViewFactory_ston.refresh(null).then(() => {
	    SHACLValueConstrTypeFactory_ston.refresh(SHACLClassViewFactory_ston);
	    this.load_classes();
	});
    }

    load_classes() {
	let class_uris = Array.from(this.state.class_uris);
	let class_uris_s = "(<" + class_uris.join(">)(<") + ">)";
	let rq_diagram = `
        construct {
          ?class_uri rdfs:subClassOf ?superclass_uri;
                     ?cp_path ?cp_value_type_uri.
        } where {
          values (?class_uri) { ${class_uris_s} }
          graph <testdb:shacl-defs> {
            ?class_shape sh:targetClass ?class_uri.
            optional {?class_shape sh:property [ sh:path ?cp_path; sh:class ?cp_value_type_uri ]}
            optional {?class_uri rdfs:subClassOf ?superclass_uri}
          }
        }`;

	let new_uris = class_uris.filter(x => !(x in this.diagram.current.nodes));
	let todel_uris = Object.keys(this.diagram.current.nodes).filter(x => !(this.state.class_uris.has(x)));
	console.log("class_uris:", class_uris);
	console.log("new_uris:", new_uris);
	console.log("todel_uris:", todel_uris);
	let new_nodes = new_uris.map(x => [x, SHACLClassViewFactory_ston.get_object(x)]);
	this.diagram.current.set_nodes(new_nodes);
	this.diagram.current.remove_nodes(todel_uris);

	this.fuseki_prx.construct(rq_diagram).then(rq_res_ => {
	    let rq_res = utils.to_n3_model(rq_res_);
	    this.diagram.current.set_diagram(rq_res);
	    this.diagram.current.refresh();
	});
    }
    
    add_class() {
	debugger;
	let class_name = this.new_classname.current.value;
	if (class_name.length == 0) {
	    alert("class name is empty");
	    return;
	}
	
	let new_class_uri = "testdb:" + class_name;
	if (new_class_uri in SHACLClassViewFactory_ston.shacl_class_views) {
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
	    return SHACLClassViewFactory_ston.refresh([new_class_uri]);
	}).then(() => {
	    let o = SHACLClassViewFactory_ston.get_object(new_class_uri);
	    this.diagram.current.set_nodes([[new_class_uri, o]]);
	    this.diagram.current.refresh();
	});
    }

    show_class(class_uri) {
	if (class_uri.length == 0) {
	    alert("class name is empty");
	    return;
	}
	
	if (!(class_uri in SHACLClassViewFactory_ston.shacl_class_views)) {
	    alert("no such class defined: " + class_uri);
	    return;
	}

	let new_state = this.state;
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
	let all_classes = Object.keys(SHACLClassViewFactory_ston.shacl_class_views);
	//let all_classes = ['Security', 'Equity'];
	return (<div>
		<button onClick={() => this.add_class()}>ADD CLASS</button>
		<DropdownList items={all_classes} onChange={this.show_class}/>
		<input type="text" defaultValue="" ref={this.new_classname} onChange={(evt) => this.new_classname.current.value = evt.target.value}/>
		<input type="text" value={Array.from(this.state.class_uris).join(",")}></input>
		<button onClick={() => this.remove()}>DEL</button>
		<RDFDiagram ref={this.diagram}/>
	        </div>);
    }
};

