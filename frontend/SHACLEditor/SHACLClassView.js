import React from "react";
import ReactDOM from 'react-dom';
import {ENUMSHACLValueConstrType, SHACLValueConstrTypeFactory_ston, SHACLClassProperty} from './SHACLClassProperty.js';
import * as utils from './utils.js';

export class SHACLClassViewFactory {
    constructor(shacl_diagram, fuseki_prx) {
	this.shacl_diagram = shacl_diagram;
	this.fuseki_prx = fuseki_prx;
	this.shacl_class_views = {}; // uri -> SHACLClassView element
	this.shacl_class_views_objs = {}; // uri -> SHCALClassView object from inside of element
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

	    //console.log("class_details:", class_details);
	    Object.keys(class_details).forEach(class_uri => {
		if (class_uri in this.shacl_class_views_objs) {
		    this.shacl_class_views_objs[class_uri].props.class_details = class_details[class_uri];
		} else {
		    let o = (<SHACLClassView ref={(r) => this.shacl_class_views_objs[class_uri] = r}
			     shacl_diagram={this.shacl_diagram}
			     cell={null}			     
			     class_uri={class_uri}
			     class_details={class_details[class_uri]}
			     el_id={"shacl-" + utils.generateQuickGuid()}
			     on_class_uri_add={new_class_uri => this.shacl_diagram.on_class_uri_add(new_class_uri)}
			     on_class_uri_del={del_class_uri => this.shacl_diagram.on_class_hide(del_class_uri)}
			     />);
		    this.shacl_class_views[class_uri] = o;
		}
	    });

	    this.shacl_diagram.forceUpdate();
	    
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
	this.on_class_property_click = this.on_class_property_click.bind(this);
	this.on_superclass_click = this.on_superclass_click.bind(this);
	this.on_subclass_click = this.on_subclass_click.bind(this);
    }

    get_superclass_uris() {
	return this.props.class_details.filter(x => x.superclass_uri != null).map(x => x.superclass_uri.id);
    }

    get_subclass_uris() {
	return this.props.class_details.filter(x => x.subclass_uri != null).map(x => x.subclass_uri.id);
    }

    get_class_properties() {
	return this.props.class_details
	    .filter(x => x.subclass_uri == null && x.superclass_uri == null && x.mpath != null)
	    .map(x => {
		//console.log("x:", x.mpath.id, x.mdt);
		let vct = x.mdt ? ENUMSHACLValueConstrType.DATATYPE : ENUMSHACLValueConstrType.CLASS;
		let vt_uri = x.mdt ? x.mdt.id : x.mclass.id;
		if (!SHACLValueConstrTypeFactory_ston.validate(vct, vt_uri)) {
		    debugger;
		    throw "invalid value constr type, value type uri combination";
		}
		return new SHACLClassProperty(x.mpath.id, vct, vt_uri);
	    });
    }
    
    on_class_property_click(value_type_uri) {
	this.props.on_class_uri_add(value_type_uri);
    }

    on_superclass_click(superclass_uri) {
	this.props.on_class_uri_add(superclass_uri);
    }

    on_subclass_click(subclass_uri) {
	this.props.on_class_uri_add(subclass_uri);
    }
    
    render() {
	//debugger;
	//console.log("SHACLClassView:", this.props.class_details);
	let class_ctrl_id = this.props.el_id + "-class-ctrl";

	let class_details_pre = this.get_class_properties().map((x) => {
	    let v = null;
	    if (x.value_constr_type == ENUMSHACLValueConstrType.CLASS) {
		v = (<a href="#" onClick={() => this.on_class_property_click(x.value_type_uri)}>{utils.compact_uri(x.value_type_uri)}</a>);
	    } else if (x.value_constr_type == ENUMSHACLValueConstrType.DATATYPE) {
		v = utils.compact_uri(x.value_type_uri);
	    }
	    return (<tr><td>{utils.compact_uri(x.path_uri)}</td><td><i>{v}</i></td></tr>);
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
		 <td><input type="button" value="++" onClick={()=>this.props.shacl_diagram.class_editor_dialog.show_dialog(this.props.class_uri)}/></td>
		 <td><input type="button" value="hide" onClick={()=>this.props.on_class_uri_del(this.props.class_uri)}/></td>
		  </tr>
	        {class_details_pre}
	        <tr><td>{subclass_uris}</td></tr>
	         </tbody>
	        </table>
	);
    }
};
