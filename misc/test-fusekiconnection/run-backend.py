import ipdb
import fuargs
import Ice, sys, os
sys.path.append("/home/asmirnov/pyjenautils")
from pyjenautils import fuseki, jenagraph as j

Ice.loadSlice("--all ./backend.ice")
import FusekiTest

def to_ice_UBL(col_vs):
    ret = []
    #print "col_vs:", type(col_vs)
    for el in col_vs:
        if isinstance(el, j.U):
            ret_el = FusekiTest.UBL(FusekiTest.EnumUBLType.U, el.jena_resource.toString())
        elif isinstance(el, j.B):
            ret_el = FusekiTest.UBL(FusekiTest.EnumUBLType.B, el.jena_resource)
        elif isinstance(el, j.L):
            #ipdb.set_trace()
            ret_el = FusekiTest.UBL(FusekiTest.EnumUBLType.L, el.jena_literal.toString())
        else:
            raise Exception("unknow type")
        ret.append(ret_el)
    return ret

def to_UBL_initial_bindins(initialBindings):
    initial_bindings = {}
    for k, v in initialBindings.items():
        if v.ublType == FusekiTest.EnumUBLType.U:
            vv = j.U(v.resource)
        elif v.ublType == FusekiTest.EnumUBLType.B:
            vv = j.B(v.resource)
        elif v.ublType == FusekiTest.EnumUBLType.L:
            vv = j.L(v.resource)
        else:
            raise Exception("unknown ubltype")
        initial_bindings[k] = vv
    return initial_bindings

class FusekiConnectionI(FusekiTest.FusekiConnection):
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
    
@fuargs.action
def run():
    with Ice.initialize() as communicator:
        port = 12345
        adapter = communicator.createObjectAdapterWithEndpoints("", "ws -p {port}".format(port = port))
        fuseki_url = "http://localhost:3030/testdb"
        fuseki_o = FusekiConnectionI(fuseki_url)
        adapter.add(fuseki_o, Ice.stringToIdentity("fuseki"))
        adapter.activate()
        communicator.waitForShutdown()

def get_fuseki_proxy(communicator):
    port = 12345
    prx_s = "fuseki:ws -h localhost -p {port}".format(port = port)
    o_prx = communicator.stringToProxy(prx_s)
    prx = FusekiTest.FusekiConnectionPrx.checkedCast(o_prx)
    if not prx:
        raise Exception("wrong proxy")
    return prx

@fuargs.action
def test_select():
    with Ice.initialize() as communicator:
        prx = get_fuseki_proxy(communicator)
        print prx.select("select * { ?s ?p ?o }", {})

@fuargs.action
def test_insert():
    with Ice.initialize() as communicator:
        prx = get_fuseki_proxy(communicator)
        prx.update("insert { <testdb:a> <testdb:member44> ?nn} where { bind(UUID() as ?nn) }", {})

@fuargs.action
def test_insert2(new_id):
    with Ice.initialize() as communicator:
        prx = get_fuseki_proxy(communicator)
        new_id = FusekiTest.UBL(FusekiTest.EnumUBLType.U, "testdb:" + new_id)
        prx.update("insert { <testdb:a> <testdb:member44> ?nn} where {}", {"nn": new_id})
        
if __name__ == "__main__":
    fuargs.exec_actions(sys.argv[1:])

