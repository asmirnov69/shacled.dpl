import React from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Chip from '@material-ui/core/Chip';
import * as utils from './utils.js';

export default class SHACLClassEditorDialog extends React.Component {
    constructor(props) {
	super(props);
	this.state = {class_uri: null, dialog_open: false, new_member: ""};

	this.__add_new_member = this.__add_new_member.bind(this);
    }

    show_dialog(class_uri) {
	this.setState({...this.state, dialog_open: true, class_uri: class_uri});
    }

    __get_member_row(r) {
	let is_literal = r.mdt != null;
	let object_type = r.mdt != null ? r.mdt.id : r.mclass.id;
	let ret = (<tr key={utils.generateQuickGuid()}>
		   <td><input type="text" tyle={{borderWidth: "0px"}} value={r.mpath.id} onChange={null}/></td>
		   <td><select value={is_literal ? "datatype" : "class"} style={{borderWidth: "0px"}}
		               onChange={this.set_is_object_literal}>
		        <option value="datatype">datatype</option>
		        <option value="class">{"class"}</option>
		       </select></td>
		   <td><input type="text" style={{borderWidth: "0px"}} value={object_type} onChange={this.set_object_type}/></td>
		   <td><button>X</button></td>
		   </tr>);
	return ret;
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
	fuseki_prx.update(rq).then(() => {
	    // refresh shacl class view factory
	    debugger;
	    return this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.refresh([this.state.class_uri]);
	}).then(() => {
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
    
    render() {
	let member_rows = null;
	let superclasses = null;
	if (this.props.top_app.shacl_diagram_ref.current) {
	    let shacl_class_view = this.props.top_app.shacl_diagram_ref.current.shacl_class_view_factory.shacl_class_views_objs[this.state.class_uri];
	    superclasses = shacl_class_view.get_superclass_uris().map(x => (<Chip label={x} onDelete={() => {return}}/>));
	    member_rows = shacl_class_view.get_members().map(x => this.__get_member_row(x));
	}

	
	return (
	    	<Dialog onClose={(v) => { this.setState({...this.state, dialog_open: false}); }} aria-labelledby="simple-dialog-title" open={this.state.dialog_open}>
		<DialogTitle>{this.state.class_uri}</DialogTitle>
		<div>{superclasses}<button>add</button></div>
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
