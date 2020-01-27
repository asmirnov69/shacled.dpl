import sys, os
import pandas as pd
sys.path.append("/home/asmirnov/pyjenautils")
from pyjenautils import fuseki, jenagraph as j, prefix

sys.path.append(os.path.join(os.environ['dipole_topdir'], "src"))
import libdipole

def to_UBL(v):
    #print "to_UBL:", v, type(v)
    ret_v = None
    if pd.isnull(v):
        ret_v = {'UBLType': 'N', 'resource': None}
    elif isinstance(v, j.U):
        ret_v = {'UBLType': 'U', 'resource': v.jena_resource.toString()}
    elif isinstance(v, j.B):
        ret_v = {'UBLType': 'B', 'resource': v.jena_resource}
    elif isinstance(v, j.L):
        ret_v = {'UBLType': 'L', 'resource': v.jena_literal.toString()}
    else:
        raise Exception("to_UBL: unknown value %s" % v)
    return ret_v

def to_json_UBL(col_vs):
    ret = []
    #print "col_vs:", type(col_vs)
    for el in col_vs:
        ret_el = to_UBL(el)
        if ret_el == None:
            raise Exception("unknow type for element %s" % el)
        ret.append(ret_el)
    return ret

@libdipole.exportclass
class FusekiConnection:
    def __init__(self):
        self.fuseki_conn = None
        
    def set_dataset_url(self, dataset_url):
        print "Fuseki::set_dataset_url:", dataset_url
        self.fuseki_conn = fuseki.FusekiConnection(dataset_url)
        
    def set_base_uri(self, base_uri):
        print "Fuseki::set_base_uri:", base_uri
        prefix.set_base_uri(base_uri)
        
    def select(self, rq, initial_bindings_):
        print "Fuseki::select:", rq, initial_bindings_
        initial_bindings = {k:j.U(v) for k, v in initial_bindings_.items()}
        rq_res = self.fuseki_conn.select(rq, initial_bindings)
        print "Fuseki::select res:"
        ret = {}
        for col in rq_res.columns:
            ret[col] = to_json_UBL(rq_res.loc[:, col])
        return ret

    def update(self, rq, initial_bindings_):
        print "Fuseki::update:", rq, initial_bindings_
        initial_bindings = {k:j.U(v) for k, v in initial_bindings_.items()}
        self.fuseki_conn.update(rq, initial_bindings)
        print "DONE Fuseki::update:"
        
    def construct(self, rq, initial_bindings_):
        print "Fuseki::construct:", rq, initial_bindings_
        initial_bindings = {k:j.U(v) for k, v in initial_bindings_.items()}
        rq_res = self.fuseki_conn.construct(rq, initial_bindings)
        print "Fuseki::construct res:"
        return map(lambda row: map(to_UBL, row), rq_res)
