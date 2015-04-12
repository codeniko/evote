function Voter(a, b, c) {
	var ssn_ = a;
	var name_ = b;
	this.valNum;
	this.idNum;
	this.vote = c;
	this.voteFlag;	


	this.ssn = function() {
		return ssn_;
	}

	this.name = function() {
		return name_;
	}
};

module.exports = Voter;
