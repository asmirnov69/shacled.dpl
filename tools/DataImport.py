import ipdb
import sys, fuargs
import pandas as pd
import uuid
from SHACLDefs import *
sys.path.append("/home/asmirnov/pyjenautils")
from pyjenautils import jenagraph as j, conversions

def df_row_to_dict(r, remove_na = False):
    if remove_na:
        r = r.dropna()
    keys = r.index.tolist()
    values = r.tolist()
    return dict(zip(keys, values))

def is_ttl_uri(s):
    return s[0] == "<" and s[-1] == ">"

def ttl_uri_to_U(s):
    if not is_ttl_uri(s):
        raise Exception("string is not turtle uri")
    return j.U(s.replace("<", "").replace(">", ""))

def U_to_ttl_uri(u):
    if isinstance(u, j.U):
        raise Exception("argument is not U")
    return "<" + u.jena_resource.toString() + ">"

class TurtleMatrixProcessor:
    def __init__(self, shacl_defs):
        self.shacl_defs = shacl_defs
    
    def process_row(self, r, fuseki_con):
        r = df_row_to_dict(r, remove_na = True)
        action = r['action']; del r['action']
        if action == 'insert':
            self.process_insert(r, fuseki_con)
        elif action == 'insertupdate':
            self.process_insertupdate(r, fuseki_con)
            
    def process_insert(self, r, fuseki_con):
        if not 'class' in r:
            raise Exception('class must be specfied')
        class_uri = ttl_uri_to_U(r['class']); del r['class']
        if not class_uri in self.shacl_defs.get_classes():
            raise Exception('unknown class %s' % class_uri)
        class_members = self.shacl_defs.get_class_members(class_uri)
        subj = j.U("testdb:" + uuid.uuid4().hex)
        triples = []
        triples.append((subj, j.U("rdf:type"), class_uri))
        for member in filter(lambda x: is_ttl_uri(x), r.keys()):
            member_uri = ttl_uri_to_U(member)
            if not member_uri in class_members.members.keys():
                raise Exception("no such member: %s" % member)
            triples.append((subj, member_uri, j.L(r[member])))
        g = j.JenaGraph()
        ipdb.set_trace()
        g.add_triples(triples)
        fuseki_con.write_model(g)
        
    def process_insertupdate(self, r, fuseki_con):
        #ipdb.set_trace()
        if not 'class' in r:
            raise Exception('class must be specfied')
        class_uri = ttl_uri_to_U(r['class']); del r['class']
        if not class_uri in self.shacl_defs.get_classes():
            raise Exception('unknown class %s' % class_uri)
        maybe_subj = j.U("testdb:"+ uuid.uuid4().hex)
        values = []
        for col in filter(lambda x: is_ttl_uri(x), r.keys()):
            values.append((col, r[col]))
        #ipdb.set_trace()
        values_s = "(" + ")(".join([v[0] + ' "' + v[1] + '"' for v in values]) + ")"
        key = ttl_uri_to_U(r['key'])
        key_value = j.L(r[r['key']])
        rq = """
        delete {
          ?s ?pred ?old_v
        } insert {
          ?s ?pred ?v
        } where {
          optional {?sx ?key ?key_val}
          bind(if(bound(?sx), ?sx, ?maybe_s) as ?s)
          values (?pred ?v) {
            %s
          }
          optional {?s ?pred ?old_v}
        }
        """ % values_s
        bindings = {"maybe_s": maybe_subj, "key": key, "key_val": key_value}
        #print rq
        #print bindings
        #ipdb.set_trace()
        fuseki_con.update(rq, bindings)
        
@fuargs.action
def dump_turtle_matrix(fn,sheet):
    fuseki_con = fuseki.FusekiConnection("http://localhost:3030/testdb")
    shacl_defs = SHACLDefs()
    shacl_defs.load(fuseki_con)
    
    df = pd.read_excel(fn, sheet_name=sheet)
    print df
    
    ttlmp = TurtleMatrixProcessor(shacl_defs)
    for ii, r in df.iterrows():
        ttlmp.process_row(r, fuseki_con)

    """
    value_cols = list(set(df.columns) - set(['proc:action', 'rdfs:Class', 'proc:lookup']))

    lookup_cols = df.loc[:, 'proc:lookup'].unique().tolist()
    print lookup_cols
    print value_cols
    print df.loc[:, ['rdfs:Class'] + lookup_cols]

    for ii, r in df.iterrows():
        lookup = []
        if r['proc:action'] == "insertupdate":
            lookup.append(('rdfs:Class', r['rdfs:Class']))
            lookup.append((r['proc:lookup'], r[r['proc:lookup']]))
            lookups.append(lookup)
    print lookups
    """
    
    rq = """
    select * where {
    value (?class_uri ?lookup_pred ?lookup_value) {
    (...)
    }
    optional {?s rdf:type ?class_uri; $lookup_pred ?lookup_value}
    }
    """
    #print rq
    #subjects = fuseki_con.select(rq)
    #print subjects
    
    """
    delete {
    ?s ?pred ?old_value
    insert {
    ?s ?pred ?value
    } where {
    values (?s ?pred ?value) {(..)}
    }
    """
                
if __name__ == "__main__":
    fuargs.exec_actions(sys.argv[1:])
