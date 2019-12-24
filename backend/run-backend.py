#import ipdb
import sys, os
os.environ['JAVA_HOME'] = '/usr/lib/jvm/java-11-openjdk-amd64'
os.environ['JENA_HOME'] = '/home/asmirnov/Downloads/apache-jena-3.10.0'
import prctl, signal
import json

sys.path.append(os.path.join(os.environ['dipole_topdir'], "src"))
import libdipole
import FusekiConnection

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
    dispatcher.add_object("shacl_editor",
                          FusekiConnection.FusekiConnection(fuseki_url))

    dpl_server.run_listener(port = 0)
    
