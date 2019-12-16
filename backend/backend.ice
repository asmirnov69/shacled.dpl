// -*- mode: C++ -*-
//

module SHACLEditorMod {
  enum EnumUBLType { U, B, L };    
  struct UBL {
    EnumUBLType ublType;
    string resource;
  };
  sequence<UBL> UBLSeq;
  dictionary<string, UBLSeq> UBLDF;
  dictionary<string, UBL> SUBLDict;
    
  interface FusekiConnection {
    UBLDF select(string rq, SUBLDict initialBindings);
    void update(string rq, SUBLDict initialBindings);
  };

  interface SHACLEditorIfc {
    void saveDia(string filename, string shaclDiaJSON);
    string loadDia(string filename);
  };
};
