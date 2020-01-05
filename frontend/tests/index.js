import React from 'react';
import ReactDOM from 'react-dom';
import DataFactory from './node_modules/n3/src/N3DataFactory.js';
import N3Store from './node_modules/n3/src/N3Store.js'; // stream in N3Store.js
import RDFDiagram from '../src/RDFDiagram.js';

class Badge extends React.Component {
    constructor(props) {
	super(props);
    }
    
    render() {
	return (<div>
		<h1>{this.props.text}</h1>
		</div>);
    }
};

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

	
	let ss = store.getSubjects().map((x) => x.id);
	let oss = store.getObjects().map((x) => x.id);
	let nodes = Array.from(new Set([...ss, ...oss]));
	this.diagram.current.begin_update();
	for (let i = 0; i < nodes.length; i++) {
	    let cell = <Badge el_id={"t" + i} text={nodes[i]}/>;
	    this.cells[nodes[i]] = cell;
	    this.diagram.current.add_cell(cell);
	}
	let triples = store.getQuads();
	for (let i = 0; i < triples.length; i++) {
	    let from_cell = this.cells[triples[i].subject.id];
	    let to_cell = this.cells[triples[i].object.id];
	    this.diagram.current.add_arrow(from_cell, to_cell);
	}
	this.diagram.current.apply_layout();
	this.diagram.current.end_update();
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
