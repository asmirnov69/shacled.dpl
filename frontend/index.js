import React from 'react';
import ReactDOM from 'react-dom';
import SHACLEditor from './SHACLEditor/SHACLEditor.js';
import {getBackendCommunicator} from 'libdipole-js';


getBackendCommunicator().then((communicator) => {
    ReactDOM.render(<SHACLEditor communicator={communicator}/>, document.getElementById('root'));
});

