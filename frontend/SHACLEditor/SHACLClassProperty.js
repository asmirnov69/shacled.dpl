// for complete description: https://www.w3.org/TR/shacl/#core-components-value-type
//
// The code uses the definitions resembling definitions from SHACL W3C doc section given above.
//
// - value_constr_type: value constraint type -- sh:datatype, sh:class etc...
// - value_type_uri: value type uri -- xsd:string, <testdb:ETF> etc...
//
// SHACL class property consists of:
// - path_uri:
// - value_constr_type:
// - value_type_uri:
//
// depending on value_constr_type we can choose value_type_uri to be from separate sources.
// sh:datatype assumes value_type_uri would be literal type. sh:class assumes that value_type_uri would be
// one of available class URIs.
//

export const ENUMSHACLValueConstrType = {
    DATATYPE: 1,
    CLASS: 2
};

export class SHACLValueConstrTypeFactory {
    constructor(shacl_class_view_factory) {
	this.shacl_class_view_factory = null;
	this.value_constr_types = {};
    }

    refresh(shacl_class_view_factory) {
	this.__set_value_constr_type_datatype();
	this.__set_value_constr_type_class(shacl_class_view_factory);
	this.__build_inv_dicts();
    };	

    __build_inv_dicts() {
	this.value_constr_types_by_str = {};
	this.value_constr_types_by_str["datatype"] = this.value_constr_types[ENUMSHACLValueConstrType.DATATYPE];
	this.value_constr_types_by_str["class"] = this.value_constr_types[ENUMSHACLValueConstrType.CLASS];
    }
    
    __set_value_constr_type_datatype() {
	let xsd = "http://www.w3.org/2001/XMLSchema#"
	this.value_constr_types[ENUMSHACLValueConstrType.DATATYPE] = {value_constr_type: ENUMSHACLValueConstrType.DATATYPE,
								      value_constr_type_str: "datatype",
								      value_constr_type_uri: "sh:datatype",
								      value_type_uris: ["string", "int"].map(x => xsd + x)};
    }

    __set_value_constr_type_class(shacl_class_view_factory) {
	this.value_constr_types[ENUMSHACLValueConstrType.CLASS] = {value_constr_type: ENUMSHACLValueConstrType.CLASS,
								   value_constr_type_str: "class",
								   value_constr_type_uri: "sh:class",
								   value_type_uris: Object.keys(shacl_class_view_factory.shacl_class_views)};
    }

    get_value_constr_types_out_str() {
	return Object.keys(this.value_constr_types).map(k => this.value_constr_types[k].value_constr_type_str);
    }

    get_value_constr_type_in_enum_out_str(enum_value_constr_type) {
	return this.value_constr_types[enum_value_constr_type].value_constr_type_str;
    }

    get_value_constr_type_in_str_out_enum(str_value_constr_type) {
	return this.value_constr_types_by_str[str_value_constr_type].value_constr_type;
    }

    get_value_type_uris(enum_value_constr_type) {
	return this.value_constr_types[enum_value_constr_type].value_type_uris;
    }

    validate(value_constr_type, value_type_uri) {
	if (!(value_constr_type in this.value_constr_types)) {
	    return false;
	}
	let value_type_uris = this.get_value_type_uris(value_constr_type);
	return value_type_uris.filter(x => x == value_type_uri).length > 0;
    }
};

export let SHACLValueConstrTypeFactory_ston = new SHACLValueConstrTypeFactory();

export class SHACLClassProperty {
    constructor(path_uri, value_constr_type, value_type_uri) {
	this.path_uri = path_uri;
	this.value_constr_type = value_constr_type;
	this.value_type_uri = value_type_uri;
    }	    
};
