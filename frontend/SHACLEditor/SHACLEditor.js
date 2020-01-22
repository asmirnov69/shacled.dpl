import React from "react";
import SHACLDiagram from './SHACLDiagram.js';
import HierarchyView from './HierarchyView.js';
import DataSheet from './DataSheet.js';

import FusekiDatasetsPrx from '../gen-js/FusekiDatasetsPrx.js';
import * as utils from './utils.js';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import {DropdownList} from './misccomponents.js';

class SHACLEditorSettingsDialog extends React.Component {
    constructor(props) {
	super(props);
	this.dataset_urls = []
	this.state = {dialog_open: false, dataset_url: null}
    }

    componentDidMount() {
	let fuseki_datasets_prx = new FusekiDatasetsPrx(this.props.parent.props.communicator, 'datasets');
	fuseki_datasets_prx.get_dataset_urls().then(dataset_urls => {
	    this.dataset_urls = dataset_urls;
	});
    }
    
    render() {
	return (
		<Dialog onClose={v => this.setState({dialog_open: false})}
	                aria-labelledby="simple-dialog-title" open={this.state.dialog_open}>
		<DialogTitle>Settings...</DialogTitle>
		<DropdownList items={this.dataset_urls} selected_item={this.state.dataset_url} onChange={v => this.setState({dataset_url: v})}/>
		<button onClick={() => this.setState({dialog_open: false}, ()=>this.props.onOK(this.state))}>OK</button>
		</Dialog>
	);
    }
};

export default class SHACLEditor extends React.Component {
    constructor(props) {
	super(props);
	this.settings_dialog = null;
	this.state = {dataset_url: null}
	this.shacl_diagram = null;
	this.shacl_diagram_component = (<h1>empty</h1>);
    }

    set_new_dataset_url(new_dataset_url) {
	this.setState({dataset_url: new_dataset_url}, () => {
	    this.shacl_diagram_component = (<SHACLDiagram key={utils.generateQuickGuid()}
					    ref={r=>this.shacl_diagram=r}
					    communicator={this.props.communicator}
					    dataset_url={new_dataset_url}/>);
	    this.forceUpdate();
	});		     
    }

    
    render() {
	return (<div style={{display: "grid", width: "100%", height: "100%",
			     gridTemplateColumns: "180px auto",
			     gridTemplateRows: "auto 200px"}}>
		 <div>
		<button onClick={() => this.settings_dialog.setState({dialog_open: true, dataset_url: this.state.dataset_url})}>settings</button>
		  <input type="text" value={this.state.dataset_url}/>
		<SHACLEditorSettingsDialog ref={r=>this.settings_dialog=r} parent={this}
		                           onOK={(out_state) => this.set_new_dataset_url(out_state.dataset_url)}/>
		 </div>
		 <div style={{backgroundColor: "cyan"}}>
		  {this.shacl_diagram_component}
		 </div>
		</div>);

	/*		
	*/
	
	/*
	return (<div style={{display: "grid", width: "100%", height: "100%",
			     gridTemplateColumns: "180px auto",
			     gridTemplateRows: "auto 200px"}}>
		<div>
		 <button onClick={() => this.settings_dialog.setState({dialog_open: true})}>settings</button>
		 <input type="text" value={this.state.base_uri}/>
		 <SHACLEditorSettingsDialog ref={r => this.settings_dialog=r} parent={this}/>
		 <HierarchyView communicator={this.props.communicator}/>
		</div>
		<div style={{backgroundColor: "cyan"}}>
		<SHACLDiagram communicator={this.props.communicator} base_uri={this.state.base_uri}/>
		</div>
		<div style={{backgroundColor: "blue", gridColumn: "1/3"}}>
		<DataSheet/>
		</div>
		</div>);
	*/
    }
};

