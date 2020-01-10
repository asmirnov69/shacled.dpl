import React from 'react';
import ReactDOM from 'react-dom';

import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import SHACLEditor from './SHACLEditor/SHACLEditor.js';
import DataImport from './DataImport/DataImport.js';
import {getBackendCommunicator} from 'libdipole-js';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));


class App extends React.Component {
    constructor(props) {
	super(props);
	this.state = {value: 0}
	this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event, newValue) {
	this.setState({value: newValue});
    }
    
    render() {
	//const classes = useStyles();
	return (<div>
		<AppBar position="static">
		<Tabs value={this.state.value}
		      onChange={this.handleChange}
		      aria-label="simple tabs example">
		<Tab label="Item One" {...a11yProps(0)} />
		<Tab label="Item Two" {...a11yProps(1)} />
		</Tabs>
		</AppBar>
		<TabPanel value={this.state.value} index={0}>
		<DataImport/>
	    </TabPanel>
		<TabPanel value={this.state.value} index={1}>
		<SHACLEditor communicator={this.props.communicator}/>
	    </TabPanel>
		</div>
	);
	
    }
};

getBackendCommunicator().then((communicator) => {
    ReactDOM.render(<App communicator={communicator}/>, document.getElementById('root'));
});

