import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
//import builtins from 'rollup-plugin-node-builtins';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'index.js',
    output: {
	file: 'public/bundle.js',
	format: 'iife', // immediately-invoked function expression — suitable for <script> tags
	sourcemap: true,
    },
    plugins: [
	//builtins({preferBuiltins: true}),
	babel({babelrc: false, presets: ['@babel/react']}),
	replace({'process.env.NODE_ENV': JSON.stringify('production'),}), // to fix react imports
	resolve(), // tells Rollup how to find date-fns in node_modules
	commonjs({namedExports: {		
		'node_modules/react-is/index.js': ['ForwardRef'],
		'node_modules/react/index.js': ['createContext', 'createElement', 'Children', 'PureComponent', 'Component', 'createRef', 'Fragment', 'isValidElement', 'cloneElement'],
		'node_modules/react-dom/index.js': ['unstable_batchedUpdates', 'findDOMNode'],
		'node_modules/prop-types/index.js': ['shape', 'instanceOf', 'node', 'object', 'string', 'func', 'bool', 'oneOfType', 'number', 'arrayOf', 'oneOf', 'any', 'elementType'],
	    }}), // converts date-fns to ES modules
	//production && terser() // minify, but only in production
    ]
};
