import sys
sys.path.append("/home/asmirnov/pyjenautils")
from pyjenautils import fuseki, jenagraph as j

class SHACLClass:
    def __init__(self, class_uri):
        self.class_uri = class_uri
        self.members = {}

    def load_details(self, fuseki_con):
        rq = """select ?class_uri ?mpath ?mdt ?mclass
        from ?shacl_g
        { 
         { ?this_class_uri rdfs:subClassOf+ ?class_uri } 
         union { bind(?this_class_uri as ?class_uri) }
         ?shape rdf:type sh:NodeShape; sh:targetClass ?class_uri.
         ?shape sh:property ?shape_prop.
         ?shape_prop sh:path ?mpath.
         { ?shape_prop sh:datatype ?mdt } 
         union { ?shape_prop sh:class ?mclass }
        }
        """
        df = fuseki_con.select(rq, {'shacl_g': j.U('testdb:shacl-defs'),
                                    'this_class_uri': self.class_uri})
        for r in df.itertuples():
            self.members[r.mpath] = (r.class_uri, r.mpath, r.mdt, r.mclass)
        
    def dump(self):
        print "class:", self.class_uri
        print "members:", self.members
        
class SHACLDefs:
    def __init__(self):
        self.classes = {}

    def load(self, fuseki_con):
        rq = "select ?class_uri from ?shacl_g { ?class_uri rdf:type rdfs:Class }"
        df = fuseki_con.select(rq, {'shacl_g':j.U('testdb:shacl-defs')})
        for t in df.itertuples():
            #print t.class_uri
            shacl_class_def = SHACLClass(t.class_uri)
            shacl_class_def.load_details(fuseki_con)
            self.classes[t.class_uri] = shacl_class_def

    def dump(self):
        for class_uri in self.classes.values():
            class_uri.dump()

    def get_classes(self):
        return self.classes.keys()
            
    def get_class_members(self, class_uri):
        return self.classes[class_uri]
            
if __name__ == "__main__":
    fuseki_con = fuseki.FusekiConnection("http://localhost:3030/testdb")
    shacl_defs = SHACLDefs()
    shacl_defs.load(fuseki_con)
    shacl_defs.dump()
    
