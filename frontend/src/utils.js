import * as n3 from 'n3';

export function generateQuickGuid() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

export function get_uri(uri_scheme, s) {
    return "<" + uri_scheme + ":" + s + ">";
}

export function to_n3_rows(rq_select_result) {
    //debugger;
    let ret = [];
    let cols = Object.keys(rq_select_result);
    let rq_select_result_length = rq_select_result[cols[0]].length;
    for (let i = 0; i < rq_select_result_length; i++) {
	let row = {};
	cols.forEach((col) => {
	    let v = rq_select_result[col][i];
	    let n3_v = null;
	    if (v.UBLType === 'U') {
		n3_v = n3.DataFactory.namedNode(v.resource);
	    } else if (v.UBLType === 'B') {
		n3_v = n3.DataFactory.blankNode(v.resource);
	    } else if (v.UBLType === 'L') {
		n3_v = n3.DataFactory.literal(v.resource);
	    } else {
		alarm('unknown UBLType');
	    }
	    row = {...row, [col]: n3_v};
	});
	ret.push(row);
    }
    return ret;
}
