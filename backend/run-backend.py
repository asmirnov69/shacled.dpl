#import ipdb
import Ice, sys, os
import prctl, signal
import json

if not 'topdir' in os.environ:
    raise Exception("no topdir specified in env")

Ice.loadSlice("--all -I. -I{ICE_SLICE_DIR} {top}/backend/backend.ice".format(ICE_SLICE_DIR = Ice.getSliceDir(), top = os.environ['topdir']))
import SHACLEditorMod

class SHACLEditorI(SHACLEditorMod.SHACLEditorIfc):
    def saveDia(self, filename, dia_json, current = None):
        print "saveDia", filename
        #ipdb.set_trace()
        out_fn = os.path.expanduser(filename)
        with open(out_fn, "w") as fd:
            fd.write(dia_json)

    def loadDia(self, filename, current = None):
        print "loadDia", filename
        fn = os.path.expanduser(filename)
        j = json.load(open(fn, "r"))
        return json.dumps(j)
    
if __name__ == "__main__":
    # https://github.com/seveas/python-prctl -- prctl wrapper module
    # more on pdeathsignal: https://stackoverflow.com/questions/284325/how-to-make-child-process-die-after-parent-exits
    prctl.set_pdeathsig(signal.SIGTERM) # if parent dies this child will get SIGTERM

    with Ice.initialize() as communicator:
        xfn_fn = sys.argv[1]

        # server
        port = 0
        adapter = communicator.createObjectAdapterWithEndpoints("", "ws -p {port}".format(port = port))
        endpoints = adapter.getEndpoints()
        ep_s = endpoints[0].toString()
        print ep_s
        port = int(ep_s.split(" ")[2])
        print "running server at port", port
        xfn_fd = open(xfn_fn, "w+b")
        print >>xfn_fd, port
        xfn_fd.close()
        print "port assigned"
        sys.stdout.flush()

        adapter.add(SHACLEditorI(), Ice.stringToIdentity("shacl_editor"))
        adapter.activate()
        communicator.waitForShutdown()

