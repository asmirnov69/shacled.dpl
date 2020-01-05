import sys, os
sys.path.append("/home/asmirnov/pyjenautils")
from pyjenautils import fuseki, jenagraph as j

sys.path.append(os.path.join(os.environ['dipole_topdir'], "src"))
import libdipole

def to_UBL(v):
    ret_v = None
    if isinstance(v, j.U):
        ret_v = {'UBLType': 'U', 'resource': v.jena_resource.toString()}
    elif isinstance(v, j.B):
        ret_v = {'UBLType': 'B', 'resource': v.jena_resource}
    elif isinstance(v, j.L):
        #ipdb.set_trace()
        ret_v = {'UBLType': 'L', 'resource': v.jena_literal.toString()}
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
    def __init__(self, fuseki_url):
        self.fuseki_conn = fuseki.FusekiConnection(fuseki_url)
        
    def select(self, rq):
        print "Fuseki::select:", rq
        rq_res = self.fuseki_conn.select(rq)
        print "Fuseki::select res:", rq_res
        ret = {}
        for col in rq_res.columns:
            ret[col] = to_json_UBL(rq_res.loc[:, col])
        return ret

    def update(self, rq):
        print "Fuseki::update:", rq
        self.fuseki_conn.update(rq)
        print "DONE Fuseki::update:", rq
        
    def construct(self, rq):
        print "Fuseki::construct:", rq
        rq_res = self.fuseki_conn.construct(rq)
        print "Fuseki::construct res:", rq_res
        return map(lambda row: map(to_UBL, row), rq_res)
