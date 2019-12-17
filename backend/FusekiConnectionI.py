#import ipdb
#import fuargs
import Ice, sys, os
sys.path.append("/home/asmirnov/pyjenautils")
from pyjenautils import fuseki, jenagraph as j

Ice.loadSlice("--all -I. -I{ICE_SLICE_DIR} {top}/backend/backend.ice".format(ICE_SLICE_DIR = Ice.getSliceDir(), top = os.environ['topdir']))
import SHACLEditorMod

def to_ice_UBL(col_vs):
    ret = []
    #print "col_vs:", type(col_vs)
    for el in col_vs:
        if isinstance(el, j.U):
            ret_el = SHACLEditorMod.UBL(SHACLEditorMod.EnumUBLType.U, el.jena_resource.toString())
        elif isinstance(el, j.B):
            ret_el = SHACLEditorMod.UBL(SHACLEditorMod.EnumUBLType.B, el.jena_resource)
        elif isinstance(el, j.L):
            #ipdb.set_trace()
            ret_el = SHACLEditorMod.UBL(SHACLEditorMod.EnumUBLType.L, el.jena_literal.toString())
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

class FusekiConnectionI(SHACLEditorMod.FusekiConnection):
    def __init__(self, fuseki_url):
        self.fuseki_conn = fuseki.FusekiConnection(fuseki_url)
        
    def select(self, rq, initialBindings, current = None):
        initial_bindings = to_UBL_initial_bindins(initialBindings)
        ret = {}
        rq_res = self.fuseki_conn.select(rq, initial_bindings)
        print rq_res
        for col in rq_res.columns:
            ret[col] = to_ice_UBL(rq_res.loc[:, col])
        return ret

    def update(self, rq, initialBindings, current = None):
        initial_bindings = to_UBL_initial_bindins(initialBindings)
        self.fuseki_conn.update(rq, initial_bindings)
