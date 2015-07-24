var trieList;
var trie;
var availableWords = {};

importScripts('Tries.js');

function CalculateAvailableWords(arrayOfLetters) {
    var currentPartialWord = "";
    var currentNode = trieList;

    PartialWordSearch(arrayOfLetters, "", trieList);
    

    postMessage(availableWords);
    //for (var i = 0; i < arrayOfLetters.length; i++) {//loop for the first letter

    //}
    //for (var key in trieList.CurrentTrie) {

    //}
}

function PartialWordSearch(arrayOfLetters, currentPartialWord, node) {
    var partialWord = "";
    
    for (var i = 0; i < arrayOfLetters.length; i++) {
        if (node.CurrentTrie[arrayOfLetters[i].toLowerCase()] != null && typeof node.CurrentTrie[arrayOfLetters[i].toLowerCase()] != 'undefined') {
            var tempArray = arrayOfLetters.slice();

            delete tempArray[i];

            for (var j = i; j < tempArray.length - 1; j++) {
                tempArray[j] = tempArray[j + 1];
            }

            tempArray.pop();

            PartialWordSearch(tempArray, currentPartialWord + arrayOfLetters[i].toLowerCase(), node.CurrentTrie[arrayOfLetters[i].toLowerCase()]);
        }

        if (node.BolFullWord) {
            availableWords[currentPartialWord] = true;
        }
    }


    //return partialWord;
}





self.addEventListener("message", function (e) {
    //data [0] is the trie object
    //data [1] is the array of letters available;

    trieList = JSON.parse(e.data[0]);
    trie = new Tries();

    trie.set(trieList);

    var arrayOfLetters = e.data[1];
    availableWords = CalculateAvailableWords(arrayOfLetters);
});