function HuskyCompiler(){

	this.nameSet = ['a','b','c']
	this.mainLetter = this.nameSet[0];
	this.seconderyLetter = this.nameSet[1];

	this.dictionary = this.generateDictionary();
	this.octalDictionary = (function(){var translate_arr=[]; for (i=0; i<200; i++){translate_arr.push(eval('"\\'+i+'"'));}; return translate_arr;})()

	this.funcWrapper = format('{0}.{0}',this.mainLetter);
	this.returnString = this.getExpression('return'); 
	this.quote = format("{0}({1}+{2}+{3}+{2}+{2})()", this.funcWrapper, this.returnString, this.getExpression("'"), this.getExpression('\\'));
	this.dictionaryString = this.getDictionaryAsString();

	c = this;
}

HuskyCompiler.prototype.Compile = function(javascript_code) {
	var mainCodeString = this.octalStringtoExpression(this.stringToOctal(javascript_code));
    var wrappedMainCode = format("{1}({1}({2}+{3}+{0}+{3})())()",mainCodeString, this.funcWrapper, this.returnString, this.quote);
    return this.dictionaryString+wrappedMainCode; 
};

HuskyCompiler.prototype.getExpression = function(str) {
	return this._getExpression(str, ' ');
}

HuskyCompiler.prototype._getExpression = function(str, split) {
	var parts = str.split(split);
	var expressionParts = []

	for(index in parts){
		var part = parts[index]
		if(index != parts.length-1){
			part += split;
		}

		expression = this.getExpressionShortcut(part);

		if(expression != undefined){
			expressionParts.push(expression)
		} else if( split==' '){
			expressionParts.push(this._getExpression(part, ''))
		} else {
			expressionParts.push(this.octalStringtoExpression(this.stringToOctal(part)))
		}
	}
	return this.putSymbolsInPlaceholders(expressionParts.join('+'));
};

HuskyCompiler.prototype.stringToOctal = function(str) {
    var translate_arr=this.octalDictionary;
    var msg = ''
    
    for(index in str){
        var ch = str[index]
        msg += '\\'+translate_arr.indexOf(ch);
    }
    return msg
};

HuskyCompiler.prototype.octalStringtoExpression = function(octalStr) {
	var dict=this.dictionary;
    var arr={};

    for (i in dict) {
    	arr[dict[i]] = format('{0}.{1}',this.mainLetter,this.putSymbolsInPlaceholders(i+''));
    } 

    chars = [];
    for(index in octalStr){
        ch = octalStr[index];
        if(typeof ch == 'string' && arr[ch] != undefined){
            chars.push(arr[ch]);
        }
    }
    return chars.join('+');
};

HuskyCompiler.prototype.getExpressionShortcut = function(str) {
    var dict = this.dictionary;
    var arr={}; 
    for(i in dict){
    	arr[dict[i]] = this.mainLetter+'.'+i;
    } 
    return arr[str];
};

HuskyCompiler.prototype.generateDictionary = function() {
	M=+![];
    M={
        MMMM:(![]+'')[M],
        SSS:M++,
        MSMS:(![]+'')[M],
        SSM:M++,
        MSMM:({}+'')[M],
        MMSM:(([][+[]])+'')[M],
        SMS:M++,
        SMM:M++,
        MMMS:(![]+'')[M],
        MSS:M++,
        MMSS:({}+'')[M],
        MSM:M++,
        MMS:M++,
        MMM:M++,
        MSSS:M++,
        MSSM:M++
    };
    M.SM='\\';
    M.SS='\'';
    M.MM=(!![]+'')[M.SSM]+M.MMMS+(!![]+'')[M.SSS]+(!![]+'')[M.SMS]+(!![]+'')[M.SSM]+(([][+[]])+'')[M.SSM];
    M.MS=M.MMSS+(({}+'')+'')[M.SSM]+(([][+[]])+'')[M.SSM]+(![]+'')[M.SMM]+(!![]+'')[M.SSS]+(!![]+'')[M.SSM]+(!![]+'')[M.SMS]+M.MMSS+(!![]+'')[M.SSS]+(({}+'')+'')[M.SSM]+(!![]+'')[M.SSM];
    M.M=M.SSM[M.MS][M.MS];
    return M;
};

HuskyCompiler.prototype.getDictionaryAsString = function() {
    var func = this.generateDictionary+'';
    
    var lines = func.split('\n');
    lines = lines.slice(1, lines.length-2);
    code = lines.join('').replace(/ +?/g, '');
    
    return this.putSymbolsInPlaceholders(code);
};

HuskyCompiler.prototype.putSymbolsInPlaceholders = function(codeStr){
	/*
	codeStr = codeStr.replace(/M/g, '{0}');
    codeStr = codeStr.replace(/S/g, '{1}');
    codeStr = format(codeStr, this.mainLetter, this.seconderyLetter);
    return codeStr;
	*/
	
	var that = this;
	// the renaming object
	var parseObj = {}
	parseObj.id = [] // identification
	parseObj.incr = function ()
	{
		for(var i = 0;;i++)
		{
			var ix = that.nameSet.indexOf(this.id[i])
			if(ix == that.nameSet.length - 1)
			{
				this.id[i] = that.nameSet[0]
			}
			else
			{
				this.id[i] = that.nameSet[ix + 1]
				break;
			}
		}
		return this.id.join('');
	}
	// holds the already determined variable names
	parseObj.dict = {}
	 // used to reply to messages from the replace (in the next definition)
	parseObj.replaceReply = function (match) {
		if(this.dict[match])
			return this.dict[match]
		else
		{
			var x = this.incr()
			this.dict[match]=x;
			return x;
		}
	}
	
	return codeStr.replace(/[SM]+/g, function(match){return parseObj.replaceReply(match)});
};



/*********** HELPERS ***********/

function format(format){
	var args=[]; for(a in arguments){args.push(arguments[a])};
	args = args.slice(1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
}