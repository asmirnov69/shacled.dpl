// -*- mode: C++ -*-
//

module SHACLEditorMod {
  interface SHACLEditorIfc {
    void saveDia(string filename, string shaclDiaJSON);
    string loadDia(string filename);
  };
};
