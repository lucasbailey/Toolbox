<%@ Page Title="" Language="vb" AutoEventWireup="false" MasterPageFile="~/Site1.Master" 
    CodeBehind="WordGame.aspx.vb" Inherits="Toolbox.WordGame" %>

<%@ Register Assembly="Tab" Namespace="Tab" TagPrefix="cc1" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">

    <style type="text/css">
        .letterBtn {
            width: 100%;
        }

        input, .letter, .letterMarker {
            font-size: 4em;
        }

            .letter:not(input) {
                color: black;
                text-decoration: none;
            }

            .letter[data-disabled=true] {
                background-color: red;
            }

            .letter:not(input):hover {
                /*background-image: url('/Images/drawingBold.svg');*/
            }

        .subscript {
            position: relative;
            bottom: -.65em;
        }

        .letterMarker {
            vertical-align: baseline;
        }

        .noDisplay {
            display: none;
        }
    </style>



    <script>
        var g = new Generic();
        var sort = new Sorts();
        var trie = new Tries();
        var usedTrie = new Tries();
        var currentTrie = new Tries();
        var possibleTrie = new Tries();
        var theWords = new EnglishWords();
        var ls = new LoadScreens();

        var w; //web worker...
        var OriginalRandomLetters = [];  //array of letters to be displayed

        var newTask = [];

        //load the english words
        newTask[newTask.length] = ls.newTask();
        newTask[newTask.length - 1].callback = function (ctx) {
            trie.load(theWords.Words);
            ls.TaskComplete(ctx);
        }
        newTask[newTask.length - 1].status = "Loading Dictionary...";

        //calculate the values for each letter
        newTask[newTask.length] = ls.newTask();
        newTask[newTask.length - 1].callback = function (ctx) {
            StartValueCalculator(ctx);
        }
        newTask[newTask.length - 1].status = "Calculating Letter Values...";

        //get random letters for the game
        newTask[newTask.length] = ls.newTask();
        newTask[newTask.length - 1].callback = function (ctx) {
            randomLetters.innerHTML += displayRandomLetters();
            StartCalculateAvailableWords();

            ls.TaskComplete(ctx);
        }
        newTask[newTask.length - 1].status = "Getting Random Letters...";

        //calculate the available words
        //this is dependant on the random letters being generated...
        //newTask[newTask.length] = ls.newTask();
        //newTask[newTask.length - 1].callback = function (ctx) {
        //    StartCalculateAvailableWords(ctx);
        //    ls.TaskComplete(ctx);
        //}
        //newTask[newTask.length - 1].status = "Calculating Available Words...";


        ls.addTask(newTask);

        theCurrentWord = "";

        var MAX_LETTERS = 25;
        var LETTERS_PER_ROW = 5;

        var WordString = "";

        var UsedLetterTiles = [];

        var _LetterValues = {};

        //gets a count of letters used in all words
        //and sets up an array containing the value
        //for each letter used.
        function StartValueCalculator(ctx) {
            var result;

            //check for web worker support, use web worker to find values
            //if available, otherwise find values (and freeze page in the process)
            if (typeof (Worker) !== "undefined") {
                if (theWords.LetterValues == null || typeof theWords.LetterValues == 'undefined') {
                    w = new Worker("/Scripts/LetterValueCalculator.js");

                    w.onmessage = function (event) {
                        result = event.data;

                        var total = 0;

                        for (var key in result) {
                            if (!isNaN(result[key])) {
                                total += result[key];
                            }
                            else {
                                delete result[key];
                            }
                        }

                        for (var key in result) {
                            var theValue = GetTheValue(result[key], total);
                            var theCount = result[key];
                            result[key] = { count: theCount, value: theValue };
                        }
                        _LetterValues = result;

                        if (ctx != null && typeof ctx != 'undefined') {
                            //inform the load screen that the task is complete...
                            ls.TaskComplete(ctx);
                        }
                        w.terminate();
                        w == null;
                    }

                    w.postMessage(JSON.stringify(trie.get()));
                }
                else {
                    _LetterValues = theWords.LetterValues;

                    if (ctx != null && typeof ctx != 'undefined') {
                        //inform the load screen that the task is complete...
                        ls.TaskComplete(ctx);
                    }
                }
            }
            else {
                // No Web Worker support..
            }
        }

        function StartCalculateAvailableWords(ctx) {
            var result;

            //check for web worker support, use web worker to find words
            //if available, otherwise find words (and freeze page in the process)
            if (typeof (Worker) !== "undefined") {
                var caw = new Worker("/Scripts/CalculateAvailableWords.js");

                caw.onmessage = function (event) {
                    result = event.data;
                    var count = 0;
                    var options = {
                        skipScore: true,
                        skipUpdateUsedList: true,
                        trieToUse: possibleTrie,
                        destObj: maxScore
                    };


                    for (var key in result) {
                        AddWord(key, options);
                        count++;
                    }

                    //display the word(s) in the used words list
                    //displaySuggestArray(usedWordList, options.possibleTrie.suggestArray("", { minLength: 0 }));

                    options = { trieToUse: possibleTrie, destObj: maxScore };
                    GetScore(options);

                    g.SetValue(NumPossibleWords, count);

                    if (ctx != null && typeof ctx != 'undefined') {
                        //inform the load screen that the task is complete...
                        ls.TaskComplete(ctx);
                    }
                }

                caw.postMessage([JSON.stringify(trie.get()), OriginalRandomLetters]);
            }
            else {
                // No Web Worker support..
            }

        }

        function GetTheValue(count, total) {
            return Math.floor(1 / (count / total));
        }

        function getRandomLetters(num) {
            var returnArray = [];

            for (var i = 0; i < num; i++) {
                returnArray[returnArray.length] = String.fromCharCode(Math.floor(Math.seededRandom() * 26 + 65));
            }
            return returnArray;
        }

        function displayRandomLetters() {
            var returnString = "";
            var ary = getRandomLetters(MAX_LETTERS);

            OriginalRandomLetters = ary;

            for (var i = 0; i < ary.length; i++) {
                if (i % LETTERS_PER_ROW == 0 && i != 0) {
                    returnString += "</tr><tr>"
                }
                returnString += "<td>" + ButtonHTML(ary[i], "newLetter" + i.toString()) + "</td>";
            }

            returnString = "<table><tr>" + returnString + "</tr></table>";

            return returnString;
        }

        function ButtonHTML(inputString, id) {
            //var StartBtnTag = ["<input id='" + id + "' class='letterBtn' type='button' value='", inputString, "' onclick='AddMe(this.id);' />"].join("");
            var EndBtnTag = "";
            var StartTag = "";//["<span style='display:none' id='span_" + id + "'>", inputString].join("");
            var EndTag = "";//"</span>";

            var StartBtnTag = [
                                "<a id='" + id
                                    + "' class='Card letter letterBtn' href='javascript:g.void();' onclick='AddMe(this.id);'>",
                                inputString,
                                "</a>"
                              ].join("");

            return [StartBtnTag, EndBtnTag, StartTag, EndTag].join("");
        }

        // the initial seed
        //        Math.seed = 6;
        Math.seed = 7;

        // in order to work 'Math.seed' must NOT be undefined,
        // so in any case, you HAVE to provide a Math.seed
        Math.seededRandom = function (max, min) {
            max = max || 1;
            min = min || 0;

            Math.seed = (Math.seed * 9301 + 49297) % 233280;
            var rnd = Math.seed / 233280;

            return min + rnd * (max - min);
        }

        function AddWord(word, options) {
            options = (options == null || typeof options == 'undefined' ? {} : options);

            options.skipScore = (
                                    options.skipScore == null || typeof options.skipScore == 'undefined'
                                        ? false
                                        : options.skipScore
                                );
            options.skipUpdateUsedList = (
                                            options.skipUpdateUsedList == null
                                                || typeof options.skipUpdateUsedList == 'undefined'
                                            ? false
                                            : options.skipScore
                                         );

            //find the word in the available word list.  If a real word, add it to the used word list, 
            //if it is not already there
            if (FindWord(word, options)) {
                if (!options.skipScore) {
                    //only get the score if the word exists...time saver
                    GetScore(options);
                }
            }
        }

        function GetScore(options) {
            options = (options == null || typeof options == 'undefined' ? {} : options);
            options.destObj = (options.destObj == null || typeof options.destObj == 'undefined'
                                ? score
                                : options.destObj
                              );
            options.trieToUse = (
                                    options.trieToUse == null || typeof options.trieToUse == 'undefined'
                                    ? usedTrie
                                    : options.trieToUse
                                );

            var destObj = options.destObj;
            var trieToUse = options.trieToUse;

            var total = 0;
            var usedWordListAry = trieToUse.suggestArray("", { minLength: 0 });

            for (var i = 0; i < usedWordListAry.length; i++) {
                for (var j = 0; j < usedWordListAry[i].length; j++) {
                    total += _LetterValues[String(usedWordListAry[i]).substr(j, 1).toUpperCase()].value;
                }
            }

            g.SetValue(destObj, total.toString());
        }

        function RemoveMe(obj) {
            var parentObj = obj.parentElement;
            parentObj.removeChild(obj);
            var isDirty = false;
            var grandParentObj = parentObj.parentElement;
            grandParentObj.removeChild(parentObj);

            //find a used letter tile matching the value of the one being removed...
            for (var i = 0; i < UsedLetterTiles.length; i++) {
                if (g.GetValue(obj) == g.GetValue(UsedLetterTiles[i]) && !isDirty) {
                    //make the letter clickable and remove the reference to the object
                    //if (obj.nodeName.toLowerCase() == "input") {
                    UsedLetterTiles[i].setAttribute("data-disabled", false);
                    //}
                    isDirty = true;
                }
                else if (isDirty) {
                    //shift the remaining letters up in the used letter array
                    UsedLetterTiles[i - 1] = UsedLetterTiles[i];
                }
                var test = 0;
            }

            if (isDirty) {
                //UsedLetterTiles[UsedLetterTiles.length - 1];
                UsedLetterTiles.splice(UsedLetterTiles.length - 1, 1)
            };

            //destroy the current trie and rebuild it,
            //since it is about to become invalid
            currentTrie = new Tries();

            var curString = grandParentObj.innerText;

            if (curString != "") {
                currentTrie.load([curString]);
            }
        }

        function AddMe(id) {
            var obj = document.getElementById(id);

            if (obj.getAttribute("data-disabled") == true || obj.getAttribute("data-disabled") == "true") {
                return;
            }

            //if (obj.nodeName.toLowerCase() == "input") {
            obj.setAttribute("data-disabled", true);
            //}

            UsedLetterTiles[UsedLetterTiles.length] = obj;

            var newLetterInput = document.createElement("a");
            var newWordGroup = marker.previousElementSibling;

            var newLetterContainer = document.createElement("span");

            if (newLetterInput.nodeName.toLowerCase() == "input") {
                newLetterInput.type = "button";
            }

            newLetterInput.className = "Card"; //letter

            g.SetValue(newLetterInput, g.GetValue(obj));

            newLetterInput.addEventListener("click", function () {
                RemoveMe(this);
            });

            //var newLetterSpan = document.createElement("span");

            //newLetterSpan.className = "noDisplay";
            //newLetterSpan.innerHTML = g.GetValue(obj);

            newLetterContainer.appendChild(newLetterInput);
            //newLetterContainer.appendChild(newLetterSpan);

            newWordGroup.appendChild(newLetterContainer);

            //destroy the current trie and rebuild it,
            //since it is about to become invalid
            currentTrie = new Tries();

            currentTrie.load([newWordGroup.innerText.trim()]);
        }


        //finds the word in the available word list
        //if the word exists, add it to the used word list
        //return true the word was added to the used word list
        //return false if not a valid word
        function FindWord(word, options) {
            options = (options == null || typeof options == 'undefined' ? {} : options);

            options.skipScore = (options.skipScore == null || typeof options.skipScore == 'undefined'
                                    ? false
                                    : options.skipScore
                                );
            options.skipUpdateUsedList = (
                                            options.skipUpdateUsedList == null
                                                || typeof options.skipUpdateUsedList == 'undefined'
                                            ? false
                                            : options.skipScore
                                        );
            options.trieToUse = (
                                    options.trieToUse == null
                                        || typeof options.trieToUse == 'undefined'
                                    ? usedTrie
                                    : options.trieToUse
                                );

            if (word != null) {
                currentTrie.load([word.toUpperCase()]);
            }

            //first, ensure the submitted word is an actual word...
            var theWordNode = trie.findNode(currentTrie.get());

            if (theWordNode == null || theWordNode.BolFullWord == false) {//word is not valid
                var dispOptions = new g.DisplayCustomErrorOptions();

                dispOptions.type = g.FLAG_DISPLAY;
                dispOptions.destObj = document.getElementById("errMsg");

                g.DisplayCustomError("Not a valid word!", dispOptions);

                return false;
            }
            else {//found a valid word
                //add the word to the used words trie
                options.trieToUse.load([currentTrie.suggest("", { minLength: 0 })]);
                if (!options.skipUpdateUsedList) {
                    //display the word(s) in the used words list
                    displaySuggestArray(usedWordList, options.trieToUse.suggestArray("", { minLength: 0 }));

                    //empty the current word and reset the letter grid buttons
                    for (var i = 0; i < UsedLetterTiles.length; i++) {
                        UsedLetterTiles[i].setAttribute("data-disabled", false);
                    }

                    currentWord.innerHTML = "";

                    //reset the Used Letter Tiles array
                    UsedLetterTiles = [];
                }

                currentTrie = new Tries();
            }
            return true;
        }

        function RemoveWord(obj) {
            usedTrie.remove([g.GetValue(obj)]);
            var parentObj = obj.parentElement;

            parentObj.removeChild(obj);

            GetScore();

            //remove duplicate occurances of line breaks
            parentObj.innerHTML = parentObj.innerHTML.replace(/<br\/?><br\/?>/g, "<br>");
        }

        function displaySuggestArray(obj, aryToDisplay) {
            //var beginTag = "<input type='button' onclick='RemoveWord(this);' value='";
            //var endTag = "'/><br/>";

            var beginTag = "<a href='javascript:g.void();' onclick='RemoveWord(this);'>";
            var endTag = "</a><br/>";

            obj.innerHTML = beginTag + aryToDisplay.join(endTag + beginTag) + endTag;
        }
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="HeaderPlaceHolder" runat="server">
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="FooterPlaceHolder" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder" runat="server">
    <div class="g w1" id="scoreContainer">
        <cc1:Tab ID="tab0" runat="server" Path="Score" FileName="WordGame"></cc1:Tab>
        <cc1:Tab ID="tab1" runat="server" Path="MaxStats" FileName="WordGame"></cc1:Tab>
        <cc1:TabDestination ID="tabSwapContainer" runat="server" CssClass="Card" Style="color: red;" />        
    </div>
    <div class="g w5-3 c" id="randomLetters">
        <span class=''>Letter Grid</span>
        <br />
        <br />
    </div>
    <div class="g w5-2 c" id="usedWordListContainer">
        <span class="">Used Words</span>
        <br />
        <div id="usedWordList"></div>
    </div>
    <div class="g w5-3 c" id="currentWordContainer">
        Current Word<br />
        <br />
        <span id="currentWord" class=""></span>
        <span class="letterMarker subscript" id="marker">&#172;</span>
        <br />
        <br />
        <%--<input type="button" style="" value="GO!" id="GoBtn" disabled="disabled" onclick="AddWord();" />--%>
        <a href="javascript:g.void();" onclick="AddWord();" id="GoBtn">GO!</a>
        <span id="errMsg"></span>

        <span class="g1" id="letterValues"></span>
    </div>
    <script>
        var defaultTab = "tab0";
        var tabOptions = { displayStyle: 1, destObjID: "tabSwapContainer" };

        var tab = new Tabs(tabOptions);

        tab.addTabs("tab");
        tab.showTab(document.getElementById(defaultTab));

        ls.StartLoad();

        //start the marker flashing timer
        StartFlasher($("#marker"));

        function StartFlasher(jQueryObj) {
            var jQOptions = {
                duration: 1000,
                complete: function () {
                    jQOptions.complete = function () {
                        StartFlasher(jQueryObj);
                    }
                    jQOptions.duration *= .5;

                    jQueryObj.fadeIn(jQOptions);
                }                
            };
            
            jQueryObj.fadeOut(jQOptions);
        }

        //$("body").keypress(function (evt) { keyHit(evt); });
        $("body").keydown(function (evt) { keyHit(evt); });
        
        function keyHit(event) {
            var test = 0;
            if (event.char == "\n") {//enter was pressed
                $("#GoBtn").click();
                return;
            }
            else if (event.char == "\b") {//the backspace key
                var theCurrentWord = document.getElementById("currentWord");

                if (theCurrentWord.lastChild != null) {
                    theCurrentWord.lastChild.lastChild.click();
                }

                return;
            }

            //find the first random letter that matches the key pressed
            for (var i = 0; i < OriginalRandomLetters.length; i++) {
                if (OriginalRandomLetters[i].toLowerCase() == event.char.toLowerCase()) {
                    var theLetter = document.getElementById("newLetter" + i.toString());
                    if (theLetter.getAttribute("data-disabled") == false
                            || theLetter.getAttribute("data-disabled") == null
                            || theLetter.getAttribute("data-disabled") == "false") {
                        AddMe(theLetter.id);
                        break;
                    }
                }

                //if this is the last iteration and we still haven't found the letter, show error
                if (i + 1 == OriginalRandomLetters.length) {
                    var dispOptions = new g.DisplayCustomErrorOptions();

                    dispOptions.type = g.FLAG_DISPLAY;
                    dispOptions.destObj = document.getElementById("errMsg");

                    g.DisplayCustomError("Letter not found!", dispOptions);
                }
            }

            return;
        }
    </script>
</asp:Content>
