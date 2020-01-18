import React from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as utils from './utils.js';

class MyChip extends React.Component {
    constructor(props) {
	super(props);
    }
    render() {
	return (<div>{this.props.label}<button onClick={() => this.props.onDelete(this.props.label)}>x</button></div>);
    }
};

class DropdownList extends React.Component {
    constructor(props) {
	super(props);
	this.state = {value: this.props.value};
	this.on_change = this.on_change.bind(this);
    }

    on_change(evt) {
	this.setState({value: evt.target.value}, () => {
	    if (this.props.onChange) {
		this.props.onChange(this.state.value);
	    }
	});
    }
    
    render() {
	let option_values = this.props.items.map(x => (<option value={x}>{x}</option>));
	return (<select style={{borderWidth: "0px"}} value={this.state.value} onChange={this.on_change}>
		{option_values}
		</select>);
    }
};

class SuperClassChooser extends React.Component {
    constructor(props) {
	super(props);
	this.state = {superclass_uri: null}
	this.add_superclass = this.add_superclass.bind(this);
    }

    add_superclass() {
	let class_uri = "<" + this.props.dialog.state.class_uri + ">";
	let superclass_uri = "<" + this.state.superclass_uri + ">";
	let rq = `insert {
                     graph <testdb:shacl-defs> { ?class_uri rdfs:subClassOf ?superclass_uri }
                     ?class_uri rdfs:subClassOf ?superclass_uri
                  } where {
                    bind(${class_uri} as ?class_uri)
                    bind(${superclass_uri} as ?superclass_uri)
                  }`;
        console.log("add_superclass:", rq);                      
	let fuseki_prx = this.props.dialog.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.fuseki_prx;
	fuseki_prx.update(rq).then(() => this.props.dialog.__refresh_after_update_rq());
	this.props.dialog.setState({subdialog_open: false});
    }
    
    render() {
	return (<div>
		<input type="text" value={this.state.superclass_uri} onChange={e => this.setState({superclass_uri: e.target.value})}/>
		<button onClick={this.add_superclass}>add</button>
	       </div>);
    }
};

class MemberEditor extends React.Component {
    constructor(props) {
	super(props);
	this.state = {member_name: this.props.member_name, m_spec_type: this.props.m_spec_type, m_type: this.props.m_type}

	this.__update_member = this.__update_member.bind(this);
    }

    __update_member() {
	let class_uri = "<" + this.props.dialog.state.class_uri + ">";
	let old_member_path = "<" + this.props.member_name + ">";
	let member_path = "<" + this.state.member_name + ">";
	let m_spec_type = 'sh:' + this.state.m_spec_type;
	let m_type = "<" + this.state.m_type + ">";
	let rq = `delete {
                    graph <testdb:shacl-defs> {
                      ?member ?old_m_pred ?old_m_obj
                    }
                  } insert {
                    graph <testdb:shacl-defs> {
                      ?member sh:path ?member_path; ?m_spec_type ?m_type; sh:minCount 1; sh:maxCount 1
                    }
                  } where {
                    bind(${class_uri} as ?class_uri)
                    bind(${member_path} as ?member_path)
                    bind(${old_member_path} as ?old_member_path)
                    bind(${m_spec_type} as ?m_spec_type)
                    bind(${m_type} as ?m_type)
                    graph <testdb:shacl-defs> {                      
                      ?class_shape sh:targetClass ?class_uri; sh:property ?member.
                      ?member sh:path ?old_member_path.
                      ?member ?old_m_pred ?old_m_obj
                    }
                  }`
	console.log("__update_member:", rq);
	let fuseki_prx = this.props.dialog.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.fuseki_prx;
	fuseki_prx.update(rq).then(() => this.props.dialog.__refresh_after_update_rq());
	this.props.dialog.setState({subdialog_open: false});
    }

    __get_classes() {
	return Object.keys(this.props.dialog.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.shacl_class_views);
    }

    __get_datatypes() {
	let xsd = "http://www.w3.org/2001/XMLSchema#"
	return ["string", "int"].map(x => xsd + x);
    }
    
    render() {
	return (<table><tbody><tr>
		<td><input type="text" value={this.state.member_name}
		           onChange={e => this.setState({member_name: e.target.value})}/></td>
		<td><DropdownList items={["datatype", "class"]}
		                  value={this.state.m_spec_type}
		                  onChange={v => this.setState({m_spec_type: v})}/></td>
		<td><DropdownList items={this.state.m_spec_type == "datatype" ? this.__get_datatypes() : this.__get_classes()}
		                  value={this.state.m_type}
		                  onChange={v => this.setState({m_type: v})}/></td>
		<td><button onClick={this.__update_member}>update</button></td>
		</tr></tbody></table>);
    }
};

export default class SHACLClassEditorDialog extends React.Component {
    constructor(props) {
	super(props);
	this.state = {class_uri: null, new_member: "", dialog_open: false, subdialog_open: false, subdialog_component: null};

	this.__add_new_member = this.__add_new_member.bind(this);
	this.__add_superclass = this.__add_superclass.bind(this);
	this.__remove_member = this.__remove_member.bind(this);
	this.__edit_member = this.__edit_member.bind(this);
	this.__remove_superclass = this.__remove_superclass.bind(this);
    }

    show_dialog(class_uri) {
	this.setState({...this.state, dialog_open: true, class_uri: class_uri});
    }

    __get_member_row(r) {
	let is_literal = r.mdt != null;
	let object_type = r.mdt != null ? r.mdt.id : r.mclass.id;
	let ret = (<tr key={utils.generateQuickGuid()}>
		   <td><input type="text" style={{borderWidth: "0px"}} value={r.mpath.id} readonly/></td>
		   <td><input type="text" value={is_literal ? "datatype" : "class"} style={{borderWidth: "0px"}}/></td>
		   <td><input type="text" style={{borderWidth: "0px"}} value={object_type} readonly/></td>
		   <td><button onClick={() => this.__edit_member(r)}>E</button></td>
		   <td><button onClick={() => this.__remove_member(r)}>X</button></td>
		   </tr>);
	return ret;
    }

    __refresh_after_update_rq() {
	this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.refresh([this.state.class_uri]).then(() => {
	    debugger;
	    let shacl_class_view = this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.shacl_class_views_objs[this.state.class_uri];	    
	    this.setState({new_member: ""}, () => {
		this.props.top_app.shacl_diagram_ref.current.load_classes();
		let c_state = this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.shacl_class_views_objs[this.state.class_uri].state;
		this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.shacl_class_views_objs[this.state.class_uri].forceUpdate();
		//this.props.top_app.shacl_diagram_ref.current.diagram.current.fit_cell_content(this.state.class_uri);
		console.log('diagram refreshed');
	    });
	});	
    }    
    
    __remove_member(member) {
	let member_name = "<" + member.mpath.id + ">";
	let class_uri = "<" + this.state.class_uri + ">";
	let rq = `delete {
                   graph <testdb:shacl-defs> {
                    ?member ?p ?o
                   }
                  } where {
                   graph <testdb:shacl-defs> {
                    bind(${class_uri} as ?class_uri)
                    bind(${member_name} as ?member_name)
                    ?class_shape sh:targetClass ?class_uri; sh:property ?member.
                    ?member sh:path ?member_name.
                    ?member ?p ?o
                    }
                  }`
	console.log("__remove_member:", rq);
	let fuseki_prx = this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.fuseki_prx;
	fuseki_prx.update(rq).then(() => this.__refresh_after_update_rq());
    }

    __edit_member(member) {
	console.log("__edit_member");
	this.setState({subdialog_open: true,
		       subdialog_component: (<MemberEditor dialog={this} member_name={member.mpath.id}
					     m_spec_type={member.mdt ? "datatype" : "class"}
					     m_type={member.mdt ? member.mdt.id : member.mclass.id}/>)});
    }
    
    __add_new_member() {
	// if (this.state.new_member in ... -- check if such member already exists
	let member_uri = utils.get_uri("testdb", utils.generateQuickGuid());
	let member_name = "<" + this.state.new_member + ">";
	let class_uri = "<" + this.state.class_uri + ">";
	let rq = `insert { 
                   graph <testdb:shacl-defs> { 
                    ?class_shape sh:property ?member.
                    ?member sh:path ?member_name; sh:datatype xsd:string; sh:minCount 1; sh:maxCount 1
                   }
                  } where {
                    graph <testdb:shacl-defs> {
                      bind(${member_uri} as ?member)
                      bind(${member_name} as ?member_name)
                      ?class_shape sh:targetClass ${class_uri}
                    }
                  }`;

	console.log("__add_new_member:", rq);
	let fuseki_prx = this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.fuseki_prx;
	fuseki_prx.update(rq).then(() => this.__refresh_after_update_rq());
    }

    __add_superclass() {
	console.log("__add_superclass");
	this.setState({subdialog_open: true, subdialog_component: (<SuperClassChooser dialog={this}/>)});
    }

    __remove_superclass(key) {
	debugger;
	console.log("__remove_superclass");
	let shacl_class_view = this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.shacl_class_views_objs[this.state.class_uri];
	let class_uri = "<" + this.state.class_uri + ">";
	let superclass_uri = "<" + key + ">";
	let rq = `delete {
                   graph <testdb:shacl-defs> { ?class_uri rdfs:subClassOf ?superclass_uri }
                   ?class_uri rdfs:subClassOf ?superclass_uri
                  } where {
                    bind(${class_uri} as ?class_uri)
                    bind(${superclass_uri} as ?superclass_uri)
                  }`;
	console.log("__remove_superclass:", rq);
	let fuseki_prx = this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.fuseki_prx;
	fuseki_prx.update(rq).then(() => this.__refresh_after_update_rq());
    }
    
    render() {
	let member_rows = null;
	let superclasses = null;
	if (this.props.top_app.shacl_diagram_ref.current) {
	    let shacl_class_view = this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.shacl_class_views_objs[this.state.class_uri];
	    superclasses = shacl_class_view.get_superclass_uris().map(x => (<MyChip label={x} onDelete={this.__remove_superclass}/>));
	    member_rows = shacl_class_view.get_members().map(x => this.__get_member_row(x));
	}

	
	return (
	    	<Dialog onClose={(v) => { this.setState({dialog_open: false}); }} aria-labelledby="simple-dialog-title" open={this.state.dialog_open}>
		<DialogTitle>{this.state.class_uri}</DialogTitle>

		 <Dialog onClose={(v) => { this.setState({subdialog_open: false}); }} aria-labelledby="simple-dialog-title" open={this.state.subdialog_open}>
		 <DialogTitle>subdialog</DialogTitle>
		 {this.state.subdialog_component}
		 </Dialog>
		 
		<div>{superclasses}<button onClick={this.__add_superclass}>add</button></div>
		<br/>
		<table>
		<tbody>
		<tr><td>
		<input type="text" value={this.state.new_member}
	               onChange={e => this.setState({...this.state, new_member:e.target.value})}/>
		<button disabled={this.state.new_member.length==0} onClick={this.__add_new_member}>add</button>
		</td></tr>
		{member_rows}
		</tbody>
		</table>
		</Dialog>
	);
    }
};
