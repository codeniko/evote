function Voter(arg_ssn, arg_name) {
	var ssn_ = arg_ssn;
	var name_ = arg_name;
	this.valNum = undefined;
	this.idNum = undefined;
	this.vote = undefined;
	this.voteFlag = false;	


	this.ssn = function() {
		return ssn_;
	}

	this.name = function() {
		return name_;
	}
};

module.exports = Voter;
