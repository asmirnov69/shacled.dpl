import sys
sys.path.append("/home/asmirnov/pyjenautils")
from pyjenautils import fuseki, prefix, jenagraph as j

if __name__ == "__main__":
    #prefix.add_prefix("sh", "http://www.w3.org/ns/shacl#")
    fuseki_conn = fuseki.FusekiConnection("http://localhost:3030/testdb")

    if 1:
        print fuseki_conn.select("select * { bind(?_p as ?p) ?s ?p ?o }", initial_binding = {'_p': j.U("rdf:type")})
        print fuseki_conn.select("select * { ?s ?p ?o }", initial_binding = {'p': j.U("rdf:type")})
        print fuseki_conn.select("select * { ?s ?p ?v }", initial_binding = {'v': j.L(12)})
        print fuseki_conn.select("select ?s ?p ?o { ?s ?p ?o }", initial_binding = {})

    if 0:
        # test of blak node binding    
        print fuseki_conn.select("select * from <testdb:shacl-defs> { ?s ?p ?o }")
        print "-------------------"

        df = fuseki_conn.select("select * from ?g { ?s ?p ?o }",
                                initial_binding = {
                                    '?g': j.U('testdb:shacl-defs'),
                                    '?o': j.U('testdb:member33')})
        print df
        print "================"
        print "o: ", df.iloc[0, 0], type(df.iloc[0, 0])
        #rq = "select * from ?g { bind(?o as ?o_) ?s ?p ?o }"
        rq = "select * from ?g { ?s ?p ?o_ }"
        df1 = fuseki_conn.select(rq, initial_binding = {'?g': j.U('testdb:shacl-defs'), '?o_': df.iloc[0, 0]})
        print df1

    if 0:
        fuseki_conn.update("insert data { <testdb:a> <testdb:member45> 'Hi5' }")
    
    
    if 0:
        rq = """
        insert {
          graph <testdb:shacl-defs> {
           ?class_shape rdf:type sh:NodeShape;
                        sh:targetClass <testdb:C>
          }
        } where {
          bind(UUID() as ?class_shape)
        }
        """
        fuseki_conn.update(rq)

    if 1:
        rq = """
        delete { graph ?sd {?class_shape sh:targetClass ?old_class } }
        #insert { graph ?sd { ?class_shape sh:targetClass <testdb:CCC> } } 
        insert { graph ?sd { ?class_shape sh:targetClass ?new_class } } 
        where {
          bind(<testdb:shacl-defs> as ?sd)
          #bind(<urn:uuid:68e5c14e-34e7-48f2-b04b-5c0a158eef50> as ?class_shape)
          graph ?sd {
           ?class_shape sh:targetClass ?old_class
          }
        }
        """
        #fuseki_conn.update(rq, {'class_shape': j.U('urn:uuid:68e5c14e-34e7-48f2-b04b-5c0a158eef50')})
        #fuseki_conn.update(rq)
        fuseki_conn.update(rq, {'class_shape': j.U('urn:uuid:68e5c14e-34e7-48f2-b04b-5c0a158eef50'), 'new_class': j.U('testdb:CDD')})
