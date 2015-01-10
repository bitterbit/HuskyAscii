function CodePictureBaker(asciiTemplate, placeholderChar){
    this.asciiTemplate = asciiTemplate;
    this.placeholderChar = placeholderChar;

    this.picParts = this.groupSimilarChars(asciiTemplate);
};

CodePictureBaker.prototype.BakePicture = function(jscode) {
    return this.bakePic(jscode, function(index, picPartsLength, codeExpsLength){
        return (index < picPartsLength);
    })
};

// insert js code into picture placeholder. will stop when all js code is in the picture
CodePictureBaker.prototype.BakePartialPicture = function(jscode) {
    return this.bakePic(jscode, function(index, picPartsLength, codeExpsLength){
        return (index < picPartsLength && codeExpsLength >= 1);
    })
};

CodePictureBaker.prototype.bakePic = function(jscode, shouldStopFunction) {
    this.codeExps = this.splitCodeToExpressions(jscode);
    var parts = [];

    for (var i = 0; shouldStopFunction(i, this.picParts.length, this.codeExps.length); i++) {
        var picPart = this.picParts[i];
        if (picPart[0] == this.placeholderChar){
            var p = this.insertCodeInPlaceholderGroup(picPart);
        } 
        else {
            var p = picPart;
        }
        parts.push(p);
    }

    console.log("code expressions left:", this.codeExps.length, "number of parts left:", (this.picParts.length - parts.length))
    return parts.join("");
};

CodePictureBaker.prototype.insertCodeInPlaceholderGroup = function(placeholderGroup) {
    if(placeholderGroup.indexOf(this.placeholderChar) == -1){
        return placeholderGroup;
    }

    if (this.codeExps.length > 0){
        var exp = this.codeExps.shift();

        if (exp.length <= placeholderGroup.length){
            var leftover = placeholderGroup.slice(exp.length);
            leftover = this.insertCodeInPlaceholderGroup(leftover);
            return exp + leftover;
        }
        else {
            this.codeExps.unshift(exp);
        }
    }
    return this.getUslessJsExpression(placeholderGroup.length);
};

// converts a string to an array of similar groups
// for example: "AAAABBBBBABAA" => ["AAAA", "BBBBB", "A", "B", "AA"]
CodePictureBaker.prototype.groupSimilarChars = function (str) {
    var arr = [];

    for (var i=0; i<str.length; i++) {
        var ch = str[i];
        if (arr.length == 0 || arr[arr.length-1][0] != ch){
            arr.push(ch);
        }
        else {
            arr[arr.length-1] += ch;
        }
    }
    return arr;
};

// splits the code to the smallest expressions that can still function with comments between them
CodePictureBaker.prototype.splitCodeToExpressions = function (jscode) {
    var expressions = [];
    for (var i=0; i<jscode.length; i++) {
        var ch = jscode[i];
        
        if (ch == '\r' || ch == '\n'){
            continue;
        } 
        else if (expressions.length > 0 && 
                 this.isUnspreable(ch) && 
                 this.isUnspreable(expressions[expressions.length - 1])){
            expressions[expressions.length - 1] += ch;
        }
        else {
            expressions.push(ch)
        }
    }
    return expressions;
};

CodePictureBaker.prototype.isUnspreable = function (expression) {
    return expression.match(/[A-Za-z\+\\\'\\\\]/)
    // return re.match('[A-Za-z\+\\\'\\\\]', expression)
};

CodePictureBaker.prototype.getUslessJsExpression = function (len) {
    if (len >= 4){
        return "/*" + repeatStr("*", len) + "*/";
    }
    return repeatStr(" ", len);
};

function repeatStr (str, times){
    return new Array( times + 1 ).join(str);
}


