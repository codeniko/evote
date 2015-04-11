function Voter(a, b, c) {
	var ssn_ = a;
	var name_ = b;
	this.valNum;
	this.idNum;
	var vote_ = c;
	this.voteFlag;	


	this.ssn = function() {
		return ssn_;
	}

	this.name = function() {
		return name_;
	}

	this.vote = function() {
		return vote_;
	}
};

module.exports = Voter;
