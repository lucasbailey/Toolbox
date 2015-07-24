function Tries() {
    //Tries is the root node for the trie
    //each letter will create the next level in the trie dictionary

    var TrieList = null;
    var Character = "";
    var nodeCount = -1;

    this.get = function () {
        return TrieList;
    }

    this.set = function (theTrie) {
        if (theTrie != null && typeof theTrie != 'undefined') {
            if (theTrie.BolFullWord != null && typeof theTrie.BolFullWord != 'undefined'
                && theTrie.CurrentTrie != null && typeof theTrie.CurrentTrie != 'undefined') {
                TrieList = theTrie;
            }
        }
    }

    this.load = function (trieAry) {
        for (var i = 0; i < trieAry.length; i++) {
            TrieList = _trie(trieAry[i], TrieList);
        }
        var test = 0;
    }

    this.remove = function(trieAry){
        for (var i = 0; i < trieAry.length; i++) {
            var node = _getTrie(trieAry[i], TrieList);
            node.BolFullWord = false;
        }

        while (_trieCleanup()) { }
    }

    
    //loops through every node/branch of a trie
    //finds branches that don't end in a full word
    //and removes the nodes until it reaches a full word
    //if a node is removed, return true
    //if nothing is done return false
    function _trieCleanup(nodeToUse) {
        var isDirty = false;
        if (TrieList == null) {
            return isDirty;
        }

        if (nodeToUse == null) {
            nodeToUse = TrieList;
        }

        for (var key in nodeToUse.CurrentTrie) {
            var node = nodeToUse.CurrentTrie[key];
            if (IsEmpty(node.CurrentTrie)) {
                if (node.BolFullWord == false) {
                    //delete the current node
                    delete nodeToUse.CurrentTrie[key];
                    nodeCount--;
                    isDirty = true;
                }
            }
            else {
                //move down a level and check the child
                _trieCleanup(node);
            }
        }
        return isDirty;
    }

    function IsEmpty(obj) {
        for (var i in obj)
        {
            return false;
        }
        return true;
    }

    this.suggest = function (partialWord, options) {
        options = (options == null ? {} : options);

        var node = _getTrie(partialWord, TrieList, options);
        var partialSuggest = "";

        if (!node.BolFullWord) {
            for (var key in node.CurrentTrie) {
                partialSuggest += this.suggest(partialWord + key.toString(), options);
                break;
            }
        }
        else {
            partialSuggest = partialWord;
        }


        return partialSuggest;
    };

    //partialTrie can be any trie without multiple branches,
    //usually a single word trie, and it didn't necessarily need
    //to be derived from the current trie being compared.
    this.findNode = function (partialTrie, node) {
        node = (node == null || typeof node == 'undefined' ? TrieList : node);

        return _findNode(partialTrie, node);
    }

    function _findNode(partialTrie, node) {
        for (var key in partialTrie.CurrentTrie) {
            var tempKey = key.toLowerCase();
            if (typeof node.CurrentTrie[tempKey] != 'undefined') {
                return _findNode(partialTrie.CurrentTrie[key], node.CurrentTrie[tempKey]);
            }
            else {
                return null;
            }
        }
        return node;
        
    }


    
    //get an array of suggestions based on a partial word
    //requires at least 3 characters before it will
    //activate.
    this.suggestArray = function (partialWord, options) {
        options = (options == null ? {} : options);

        var wordList = _getWordsInTrie(partialWord, options);

        return wordList;
    };

    function _getWordsInTrie(partialWord, options) {
        //options = (options == null ? {} : options);
        options.minLength = (options.minLength == null ? 1 : options.minLength);
        options.counter = (options.counter == null ? 1 : options.counter);
        options.excludeWord = (options.excludeWord == null ? "" : options.excludeWord);

        var node = _getTrie(partialWord, TrieList);
        var wordList = [];
        
        if (partialWord.length >= options.minLength) {
            for (var key in node.CurrentTrie) {//grab each letter
                if (node.CurrentTrie[key].BolFullWord) {
                    if (options.excludeWord != partialWord + key.toString()) {
                        wordList[wordList.length] = partialWord + key.toString();
                    }
                }
                wordList = wordList.concat(_getWordsInTrie(partialWord + key.toString(), options));
            }
        }
        else {
            return [];
        }

        return wordList;
    }

    //get the trie up to the last letter supplied in the word parameter            
    function _getTrie(word, node, options) {
        var substring = String(word).substring(1, String(word).length);
        var currentChar = String(word).charAt(0);
        
        var newNode = node.CurrentTrie[currentChar];

        if (newNode == null || typeof newNode == "undefined") {
            newNode = node;
        }
        else {
            newNode = _getTrie(substring, newNode);
        }

        return newNode;
    }

    function _trieNode() {
        nodeCount++;

        this.BolFullWord = false;
        this.CurrentTrie = {};
    };

    function _trie(word, node) {
        var CurrentChar = String(word).charAt(0);
        var substring = String(word).substring(1, String(word).length);

        if (node == null) {
            node = new _trieNode();
            
        }

        if (node.CurrentTrie[CurrentChar] == null) {
            node.CurrentTrie[CurrentChar] = new _trieNode();
            
        }

        if (substring != "") {
            node.CurrentTrie[CurrentChar] = _trie(substring, node.CurrentTrie[CurrentChar]);
        }

        node.CurrentTrie[CurrentChar].BolFullWord = (substring.length == 0 ? true : node.CurrentTrie[CurrentChar].BolFullWord);

        return node;
    }
}