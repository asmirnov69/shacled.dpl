import React from 'react';
import ReactDOM from 'react-dom';
import DataFactory from './node_modules/n3/src/N3DataFactory.js';
import N3Store from './node_modules/n3/src/N3Store.js'; // stream in N3Store.js
import RDFDiagram from '../SHACLEditor/RDFDiagram.js';

class RDFDiagramTest extends React.Component {
    constructor(props) {
	super(props);
	this.diagram = React.createRef();
	this.cells = {};
	this.add_cell_test = this.add_cell_test.bind(this);
	this.add_arrow_test = this.add_arrow_test.bind(this);
    }

    add_cell_test() {
	console.log("add_cell_test:", this.diagram.current);
	let store = new N3Store();	
	store.addQuad(DataFactory.namedNode('testdb:A1'),
		      DataFactory.namedNode('testdb:l'),
		      DataFactory.namedNode('testdb:A2'));
	store.addQuad(DataFactory.namedNode('testdb:A1'),
		      DataFactory.namedNode('testdb:l'),
		      DataFactory.namedNode('testdb:A3'));
	store.addQuad(DataFactory.namedNode('testdb:A1'),
		      DataFactory.namedNode('testdb:ll'),
		      DataFactory.namedNode('testdb:A3'));
	store.addQuad(DataFactory.namedNode('testdb:A2'),
		      DataFactory.namedNode('testdb:ll'),
		      DataFactory.namedNode('testdb:A3'));
	store.addQuad(DataFactory.namedNode('testdb:A4'),
		      DataFactory.namedNode('testdb:ll'),
		      DataFactory.namedNode('testdb:A3'));

	this.diagram.current.set_diagram(store, null, null);
    }

    add_arrow_test() {
	this.diagram.current.begin_update();
	this.diagram.current.add_arrow(this.cells[1], this.cells[3]);
	this.diagram.current.end_update();
    }
    
    render() {
	return (
		<div el_id={this.props.el_id}>
		<button onClick={this.add_cell_test}>PRESS</button>
		<button onClick={this.add_arrow_test}>add arrow</button>
		<button onClick={() => this.diagram.current.apply_layout()}>layout</button>
		<RDFDiagram ref={this.diagram}/>
		</div>);
    }
};
    
ReactDOM.render(<RDFDiagramTest/>, document.getElementById('root'));
