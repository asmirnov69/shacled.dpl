import React from 'react';
import ReactDOM from 'react-dom';
import RDFDiagram from './RDFDiagram.js';

class Badge extends React.Component {
    constructor(props) {
	super(props);
    }
    
    render() {
	return (<div>
		<h1>TEST123</h1>
		</div>);
    }
};

class RDFDiagramTest extends React.Component {
    constructor(props) {
	super(props);
	this.c = 0;
	this.diagram = React.createRef();
	this.add_cell_test = this.add_cell_test.bind(this);
    }

    add_cell_test() {
	console.log("add_cell_test:", this.diagram.current);
	let cell = <Badge el_id={"t" + this.c}/>;
	this.diagram.current.begin_update();
	this.diagram.current.add_cell(cell);
	this.diagram.current.end_update();
	this.c++;
    }
    
    render() {
	return (
		<div el_id={this.props.el_id}>
		<button onClick={this.add_cell_test}>PRESS</button>
		<button onClick={() => this.diagram.current.apply_layout()}>layout</button>
		<RDFDiagram ref={this.diagram}/>
		</div>);
    }
};
    
ReactDOM.render(<RDFDiagramTest/>, document.getElementById('root'));
