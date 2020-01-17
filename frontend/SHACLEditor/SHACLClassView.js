import React from "react";
import ReactDOM from 'react-dom';
import * as utils from './utils.js';

export class SHACLClassViewFactory {
    constructor(shacl_diagram, fuseki_prx) {
	this.shacl_diagram = shacl_diagram;
	this.fuseki_prx = fuseki_prx;
	this.shacl_class_views = {}; // uri -> SHACLClassView element, use props.self to get access to object itself
    }

    refresh(class_uris) {
	let values_class_uris = '';
	if (class_uris) {
	    let class_uris_s = "(<" + class_uris.join(">)(<") + ">)";
	    values_class_uris = `values (?class_uri) { ${class_uris_s} }`;
	}
	let rq_class_details = `
            select ?class_uri ?mpath ?mclass ?mdt ?superclass_uri ?subclass_uri
            from <testdb:shacl-defs> 
            where {
              ${values_class_uris}
              {
               ?class_shape sh:targetClass ?class_uri; 
               optional { 
                 ?class_shape sh:property ?class_property.
                 ?class_property sh:path ?mpath.              
                 optional {?class_property sh:class ?mclass}
                 optional {?class_property sh:datatype ?mdt}
               }
              } union {
               ?class_uri rdfs:subClassOf ?superclass_uri
              } union {
               ?subclass_uri rdfs:subClassOf ?class_uri
              }
            }`;

	return this.fuseki_prx.select(rq_class_details).then(rq_res => {
	    let df = utils.to_n3_rows(rq_res);
	    let class_details = {};
	    for (let r of df) {
		if (!(r.class_uri.id in class_details)) {
		    class_details[r.class_uri.id] = [];
		}
		class_details[r.class_uri.id].push(r);
	    }

	    Object.keys(class_details).forEach(class_uri => {
		let new_node_props = {diagram: this.shacl_diagram.diagram.current,
				      top_app: this.shacl_diagram.props.top_app,
				      cell: null,
				      on_class_uri_add: (new_class_uri)=> this.shacl_diagram.on_class_uri_add(new_class_uri),
				      on_class_uri_del: (del_class_uri)=> this.shacl_diagram.on_class_hide(del_class_uri)};
		let o = (<SHACLClassView
			 class_uri={class_uri}
			 class_details={class_details[class_uri]}
			 el_id={"shacl-" + utils.generateQuickGuid()}
			 {...new_node_props}/>);
		this.shacl_class_views[class_uri] = o;
	    });
		    
	    return Promise.resolve();
	});
    }
    
    get_object(class_uri) {
	return class_uri in this.shacl_class_views ? this.shacl_class_views[class_uri] : null;
    }
};

export class SHACLClassView extends React.Component {
    constructor(props) {
	super(props);
	this.props.self = this;
	this.on_member_class_click = this.on_member_class_click.bind(this);
	this.on_superclass_click = this.on_superclass_click.bind(this);
	this.on_subclass_click = this.on_subclass_click.bind(this);

	this.get_superclass_uris = this.get_superclass_uris.bind(this);
    }

    get_superclass_uris() {
	return this.props.class_details.filter(x => x.superclass_uri != null).map(x => x.superclass_uri.id);
    }

    get_subclass_uris() {
	return this.props.class_details.filter(x => x.subclass_uri != null).map(x => x.subclass_uri.id);
    }

    get_members() {
	return this.props.class_details.filter(x => x.subclass_uri == null && x.superclass_uri == null && x.mpath != null);
    }
    
    on_member_class_click(member_class_uri) {
	//console.log("SHACLClassView.js onClick member", member_class_uri);
	this.props.on_class_uri_add(member_class_uri);
    }

    on_superclass_click(superclass_uri) {
	//console.log("SHACLClassView.js onClick superclass_uri", superclass_uri);
	this.props.on_class_uri_add(superclass_uri);
    }

    on_subclass_click(subclass_uri) {
	this.props.on_class_uri_add(subclass_uri);
    }
    
    render() {
	//debugger;
	//console.log("SHACLClassView:", this.props.class_details);
	let class_ctrl_id = this.props.el_id + "-class-ctrl";

	let class_details_pre = this.get_members().map((x) => {
	    let v = null;
	    if (x.mclass) {
		v = (<a href="#" onClick={() => this.on_member_class_click(x.mclass.id)}>{utils.compact_uri(x.mclass.id)}</a>);
	    } else if (x.mdt) {
		v = utils.compact_uri(x.mdt.id);
	    }
	    return (<tr><td>{utils.compact_uri(x.mpath.id)}</td><td><i>{v}</i></td></tr>);
	});
	
	let superclass_uris = this.get_superclass_uris()
	    .map((x) => (<a href="#" onClick={() => this.on_superclass_click(x)}>{x}</a>));
	let subclass_uris = this.get_subclass_uris()
	    .map((x) => (<a href="#" onClick={() => this.on_subclass_click(x)}>{x}</a>));

	let heading = null;
	if (superclass_uris.length > 0) {
	    heading = (<td><b>{this.props.class_uri}</b>(<i>{superclass_uris}</i>)</td>);
	} else {
	    heading = (<td><b>{this.props.class_uri}</b></td>);
	}

	return (
		<table id={class_ctrl_id}>
		 <tbody>
		<tr>{heading}
		 <td><input type="button" value="++" onClick={()=>this.props.top_app.class_editor_dialog_ref.current.show_dialog(this.props.class_uri)}/></td>
		 <td><input type="button" value="hide" onClick={()=>this.props.on_class_uri_del(this.props.class_uri)}/></td>
		  </tr>
	        {class_details_pre}
	        <tr><td>{subclass_uris}</td></tr>
	         </tbody>
	        </table>
	);
    }
};
