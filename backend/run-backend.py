#import ipdb
import sys, os
os.environ['JAVA_HOME'] = '/usr/lib/jvm/java-11-openjdk-amd64'
os.environ['JENA_HOME'] = '/home/asmirnov/Downloads/apache-jena-3.10.0'
import prctl, signal
import json

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

@libdipole.exportclass
class Fuseki:
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


if __name__ == "__main__":
    # https://github.com/seveas/python-prctl -- prctl wrapper module
    # more on pdeathsignal: https://stackoverflow.com/questions/284325/how-to-make-child-process-die-after-parent-exits
    prctl.set_pdeathsig(signal.SIGTERM) # if parent dies this child will get SIGTERM

    dpl_server = libdipole.DipoleServer()
    dpl_event_handler = libdipole.BackendEventHandler(libdipole.port_assignment_handler, sys.argv[1])
    dpl_server.set_event_handler(dpl_event_handler)
    dispatcher = libdipole.Dispatcher(dpl_server)
    dpl_event_handler.dispatcher = dispatcher
    
    print "adding object shacl_editor"
    fuseki_url = 'http://localhost:3030/testdb'
    dispatcher.add_object("shacl_editor", Fuseki(fuseki_url))

    dpl_server.run_listener(port = 0)
    
