import React from "react";
import SHACLEditor from './SHACLEditor.js';
import ReactDataSheet from 'react-datasheet';

export default class App extends React.Component {
    constructor(props) {
	super(props);
	this.state = {
	    grid: [
		[{value:  1}, {value:  3}],
		[{value:  2}, {value:  4}]
	    ]
	};
    }
    
    
    render() {
	return (<div>
		<SHACLEditor/>
		<div style={{position: "absolute", bottom: "0px"}}>
		<ReactDataSheet
		data={this.state.grid}
		valueRenderer={(cell) => cell.value}
		onCellsChanged={changes => {
		    const grid = this.state.grid.map(row => [...row])
		    changes.forEach(({cell, row, col, value}) => {
			grid[row][col] = {...grid[row][col], value}
		    })
		    this.setState({grid})
		}}
		/>
		</div>
		</div>);
    }
};

