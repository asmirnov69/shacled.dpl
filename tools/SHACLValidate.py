import sys
import fuargs
sys.path.append("/home/asmirnov/pyjenautils")
from pyjenautils import jenaimports as ji, fuseki, jenagraph as j

@fuargs.action
def run_shacl_validation():
    fuseki_con = fuseki.FusekiConnection("http://localhost:3030/testdb")

    data_model = fuseki_con.construct("construct {?s ?p ?o} where {?s ?p ?o}", convert_to_python = False)
    shapes_model = fuseki_con.construct("construct {?s ?p ?o} from <testdb:shacl-defs> where {?s ?p ?o}", convert_to_python = False)
    #print data_model
    #print shapes_model
    report = ji.ValidationUtil.validateModel(data_model, shapes_model, True)
    report_g = j.JenaGraph(report.getModel())
    report_df = report_g.select("select ?s ?p ?o {?s ?p ?o}")
    print report_df

if __name__ == "__main__":
    fuargs.exec_actions(sys.argv[1:])
    
