import React from 'react';
import ReactDOM from 'react-dom';
import SHACLEditor from './SHACLEditor/SHACLEditor.js';
import {getArgv, getBackendCommunicator} from 'libdipole-js';

let argv = null;
getArgv().then((argv_) => {
    argv = argv_;
    if (argv.length != 3) {
	alert("too short argv");
	throw new Error();
    }
}).then(() => {
    return getBackendCommunicator();
}).then((communicator) => {
    let shapes_graph_uri = argv[2];
    ReactDOM.render(<SHACLEditor shapes_graph_uri={shapes_graph_uri}
		                 communicator={communicator}/>, document.getElementById('root'));
});

