import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App.js';
import {getBackendCommunicator} from 'libdipole-js';

getBackendCommunicator().then((communicator) => {
    ReactDOM.render(<App communicator={communicator}/>, document.getElementById('root'));
});

