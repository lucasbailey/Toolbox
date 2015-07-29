//this file depends on Tries.js
function TextBoxSuggestions(destContainerObj) {
    var ctx = this;
    options = {};

    var suggestIndex = 0;
    var parentContainer = document.createElement("div");


    var i = 0; //counter
    var strBeginSuggestionID = "suggestionBox";

    //build the text box
    var tBox = document.createElement("input");
    var nextObj = document.getElementById(strBeginSuggestionID + i.toString());

    //if suggestionBox0 is taken, keep incrementing until we find an
    //unused ID
    for (; nextObj != null || i >= 1000; i++) {
        nextObj = document.getElementById(strBeginSuggestionID + i.toString());
    }

    tBox.id = strBeginSuggestionID + i.toString();
    tBox.type = "text";

    tBox.onkeyup = function () {
        ctx.show(this);
    };

    tBox.onblur = function () {
        //wrap a timeout around the kill function to ensure that
        //if the user clicks on a suggestion, the click code will
        //have time to execute before we kill the suggestion box
        setTimeout(function () { ctx.kill(suggestionContainer) }, 200);
    };

    tBox.onfocus = function () {
        ctx.show(this);
    };

    var suggestionContainerPlaceholder = document.createElement("div");
    suggestionContainerPlaceholder.className = "suggestionContainerPlaceholder";

    var suggestionContainer = document.createElement("div");
    suggestionContainer.className = "suggestionContainer";

    suggestionContainerPlaceholder.appendChild(suggestionContainer);

    //assemble the final products
    parentContainer.appendChild(tBox);
    parentContainer.appendChild(suggestionContainerPlaceholder);
    destContainerObj.appendChild(parentContainer);


    this.DoSuggestion = function (e, obj) {
        var originalText = (typeof obj.value == 'undefined' ? "" : obj.value);
        var keynum, bolDoSuggestion = false, bolDoSuggestionArray = false;

        if (window.event) { // IE
            keynum = e.keyCode;
        }
        else if (e.which) { // Netscape/Firefox/Opera
            keynum = e.which;
        }


        switch (true) {
            case (keynum == 38 || keynum == 40): //up and down arrows
                ArrowKeyActions((keynum == 38 ? -1 : 1));
                break;
            case (keynum == 8): //backspace
                bolDoSuggestionArray = true;
                break;
            case (keynum == 32):
                bolDoSuggestion = false;
                bolDoSuggestionArray = false;
                SelectThisSuggestion(obj, suggestionContainer.childNodes[suggestIndex]);
                break;
            case (keynum >= 219 && keynum <= 222):
            case (keynum >= 186 && keynum <= 192):
            case (keynum >= 48 && keynum <= 90):
                bolDoSuggestion = true;
                bolDoSuggestionArray = true;
                break;
            case (typeof keynum == 'undefined'): //something other than a keypress caused the suggestion code...
                bolDoSuggestionArray = true;
                break;
        };

        var m = trie.suggest(obj.value);

        //alert(keynum);

        if (bolDoSuggestion) {
            obj.value = m;
            obj.focus();
            try {
                obj.setSelectionRange(originalText.length, obj.value.length);
            }
            catch (e) {

            }
        }
        return { bolDoSuggestionArray: bolDoSuggestionArray, userText: originalText };
    };

    this.displaySuggestArray = function (sourceObj, options) {
        var textToUse = (sourceObj.value == null || typeof sourceObj.value == 'undefined'
                            ? sourceObj.innerText
                            : sourceObj.value);
        //if there is a supplied text to use on searching...use that instead of what is in the text box.
        textToUse = (typeof options.textToUse == 'undefined' || options.textToUse == null
                        ? textToUse
                        : options.textToUse);

        var aryToDisplay = trie.suggestArray(textToUse, options)
        suggestionContainer.innerHTML = "";

        for (var i = 0; i < aryToDisplay.length; i++) {
            var newObj = document.createElement("a");

            newObj.className = "standardSuggestion";
            newObj.href = "#";
            newObj.innerText = aryToDisplay[i];
            newObj.onclick = function () {
                SelectThisSuggestion(sourceObj, this);
            };

            suggestionContainer.appendChild(newObj);
        }
    };

    this.kill = function (obj) {//obj is the container of the suggestions
        obj.innerHTML = "";
        obj.className = obj.className.replace(/ suggestionContainerShow /g, "");
    };

    this.show = function (obj) {
        var suggestionResult = ctx.DoSuggestion(event, obj);
        if (suggestionResult.bolDoSuggestionArray) {
            var options = {
                minLength: 0,
                //excludeWord: sourceObj.value,
                counter: 5,
                textToUse: suggestionResult.userText
            }
            ctx.displaySuggestArray(tBox, options);
            suggestionContainer.className += " suggestionContainerShow ";
        }
        
        ShowHighlight(suggestIndex, suggestIndex);
    };

    function ArrowKeyActions(direction) { //1 = up, -1 = down
        var oldSuggestIndex = suggestIndex;

        if (suggestIndex >= suggestionContainer.childNodes.length - 1 && direction == 1) {
            suggestIndex = 0;
        }
        else if (suggestIndex <= 0 && direction == -1) {
            suggestIndex = suggestionContainer.childNodes.length - 1;
        }
        else {
            suggestIndex += direction;
        }

        ShowHighlight(oldSuggestIndex, suggestIndex);

        //for (var i = 0; i < suggestionContainer.children.length; i++) {

        //}
    }

    function SelectThisSuggestion (sourceObj, currentObj) {
        if (typeof currentObj == 'undefined') {

        }
        else {
            sourceObj.value = currentObj.innerText;
            ctx.kill(suggestionContainer);
        }
    };

    function ShowHighlight(oldSuggestIndex, newSuggestIndex) {
        if (typeof suggestionContainer.childNodes[oldSuggestIndex] != 'undefined' && typeof suggestionContainer.childNodes[newSuggestIndex] != 'undefined') {
            suggestionContainer.childNodes[oldSuggestIndex].className = suggestionContainer.childNodes[oldSuggestIndex].className.replace(" highlightSuggestion ", "");
            suggestionContainer.childNodes[newSuggestIndex].className += " highlightSuggestion ";
        }
    }
}