import sys, os
sys.path.append("/home/asmirnov/pyjenautils")
from pyjenautils import fuseki, jenagraph as j

sys.path.append(os.path.join(os.environ['dipole_topdir'], "src"))
import libdipole

def to_json_UBL(col_vs):
    ret = []
    #print "col_vs:", type(col_vs)
    for el in col_vs:
        if isinstance(el, j.U):
            ret_el = {'UBLType': 'U', 'resource': el.jena_resource.toString()}
        elif isinstance(el, j.B):
            ret_el = {'UBLType': 'B', 'resource': el.jena_resource}
        elif isinstance(el, j.L):
            #ipdb.set_trace()
            ret_el = {'UBLType': 'L', 'resource': el.jena_literal.toString()}
        else:
            raise Exception("unknow type")
        ret.append(ret_el)
    return ret

def to_UBL_initial_bindins(initialBindings):
    initial_bindings = {}
    for k, v in initialBindings.items():
        if v.ublType == SHACLEditorMod.EnumUBLType.U:
            vv = j.U(v.resource)
        elif v.ublType == SHACLEditorMod.EnumUBLType.B:
            vv = j.B(v.resource)
        elif v.ublType == SHACLEditorMod.EnumUBLType.L:
            vv = j.L(v.resource)
        else:
            raise Exception("unknown ubltype")
        initial_bindings[k] = vv
    return initial_bindings

@libdipole.exportclass
class FusekiConnection:
    def __init__(self, fuseki_url):
        self.fuseki_conn = fuseki.FusekiConnection(fuseki_url)
        
    def select(self, rq):
        print "Fuseki::select:", rq
        rq_res = self.fuseki_conn.select(rq)
        print rq_res
        ret = {}
        for col in rq_res.columns:
            ret[col] = to_json_UBL(rq_res.loc[:, col])
        return ret

    def update(self, rq):
        self.fuseki_conn.update(rq)
