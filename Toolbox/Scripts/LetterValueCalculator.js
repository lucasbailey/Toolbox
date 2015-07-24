var trie;

function GetLetterValues(nodeToUse) {
    var ArrayToReturn = InitializeLetterArray();
    var returnedNums = null;
    
    if (nodeToUse == null) {
        importScripts('Tries.js', 'EnglishWords.js');

        //var trie = new Tries();
        //var theWords = new EnglishWords();
        //trie.load(theWords.Words);
        nodeToUse = trie.get();
    }

    for (var key in nodeToUse.CurrentTrie) {

        //eval("ArrayToReturn." + key.toUpperCase() + "++");
        ArrayToReturn[key.toUpperCase()]++;

        var node = nodeToUse.CurrentTrie[key];
        if (!IsEmpty(node.CurrentTrie)) {
            //move down a level and check the child
            returnedNums = GetLetterValues(node);

            for (var key in returnedNums) {
                ArrayToReturn[key] += returnedNums[key];
            }
        }
    }



    return  ArrayToReturn;
}

function InitializeLetterArray() {
    var returnObj = {}
    for (var i = 65; i <= 90; i++) {
        eval("returnObj." + String.fromCharCode(i) + "=0;");
    }

    return returnObj;
}

function IsEmpty(obj) {
    for (var i in obj) {
        return false;
    }
    return true;
}

function GetValues(trieAsString) {
    trie = JSON.parse(trieAsString);

    postMessage(GetLetterValues(trie));
}


self.addEventListener("message", function (e) {
    //self.postMessage(e.data);
    GetValues(e.data)
});

//GetValues();