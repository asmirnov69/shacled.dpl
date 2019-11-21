export class SHACLClassMember {
    constructor() {
	//debugger;
	console.log("SHACLClassMember ctor");
	this.path = null;
	this.is_object_literal = true;
	this.object_type = null;
	this.member_to_del = false;
    }

    get_json() {
	return {path: this.path, is_object_literal: this.is_object_literal, object_type: this.object_type};
    }

    set_from_json(j) {
	this.path = j.path;
	this.is_object_literal = j.is_object_literal;
	this.object_type = j.object_type;
    }
};

export default class SHACLClass {
    constructor() {
	this.class_name = null;
	this.members = [];
    }

    add_new_member() {
	let new_member = new SHACLClassMember();
	this.members.push(new_member);
	return new_member;
    }
    
    get_json() {
	let members = [];
	for (let i = 0; i < this.members.length; i++) {
	    members.push(this.members[i].get_json());
	}
	return {class_name: this.class_name, members: members};
    }

    set_from_json(j) {
	this.class_name = j.class_name;
	for (let i = 0; i < j.members.length; i++) {
	    let m = new SHACLClassMember();
	    m.set_from_json(j.members[i]);
	    this.members.push(m);
	}
    }
};
