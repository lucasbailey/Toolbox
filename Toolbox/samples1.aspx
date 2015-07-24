<%@ Page Title="" Language="vb" AutoEventWireup="false" MasterPageFile="~/Site1.Master" CodeBehind="Samples.aspx.vb" Inherits="Toolbox.Samples" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <style type="text/css">
        .noDisplay {
            display: none;
        }

        .displaySortArrayInfo {
            border-collapse: collapse;
        }

            .displaySortArrayInfo td {
                border: solid black 1px;
                padding: 2px;
                width: 15px;
                text-align: center;
            }
    </style>
    <script src="Scripts/Generic.js" type="text/javascript"></script>
    <script src="Scripts/Conversions.js" type="text/javascript"></script>
    <script src="Scripts/Tabs.js" type="text/javascript"></script>
    <script src="Scripts/Sorts.js" type="text/javascript"></script>
    <script src="Scripts/Searches.js" type="text/javascript"></script>
    <script src="Scripts/Tries.js" type="text/javascript"></script>

</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script type="text/javascript">
        var g = new Generic();
        var convert = new Conversions();
        var tab = new Tabs();
        var sort = new Sorts();
        var search = new Searches();
        var trie = new Tries();

        var binaryTree = new BinaryTrees();
        
        function BinaryTrees() {
            BinaryTree = {};

            this.load = function(AryList){
                var _sort = new Sorts();
                //get all the inputs and sort them
                _sort.SetArrayList(AryList);
                AryList = _sort.InsertionSort().slice();

                BinaryTree = _CreateNode(AryList);

                //populate the right side node

            }

            function _CreateNode(AryList) {
                //grab the number in the middle
                //round down if necessary
                var middleIndex = Math.floor(AryList.length / 2);

                var node = new _newBinaryNode();

                var AboveList = AryList.slice(middleIndex + 1, AryList.length);
                var BelowList = AryList.slice(0, middleIndex);

                if (typeof middleIndex != "undefined" && middleIndex != null) {
                    node.value = AryList[middleIndex];
                }

                if (BelowList.length > 0) {
                    node.left = _CreateNode(BelowList);
                }

                if (AboveList.length > 0) {
                    node.right = _CreateNode(AboveList);
                }

                return node;
            }

            function _newBinaryNode() {
                //the value of the current node
                this.value = null;

                //a reference to the left and right nodes
                this.left = null;
                this.right = null;
            }

            this.InOrder = function (obj) {
                if (BinaryTree != null) {
                    obj.innerHTML = _TraverseNode(binaryTree, 1);
                }
            }

            function _TraverseNode(node, order) {
                var returnValue = "";

                if (order = 0) {//pre order
                    returnValue = [returnValue, node.value].join(", ");
                }

                if (node.left != null) {
                    returnValue = [returnValue, _TraverseNode(node.left, order)].join(", ");
                }

                if (order = 1) {//in order
                    returnValue = [returnValue, node.value].join(", ");
                }

                if (node.right != null) {
                    returnValue = [returnValue, _TraverseNode(node.left, order)].join(", ");
                }

                if (order = 2) {//pre order
                    returnValue = [returnValue, node.value].join(", ");
                }
            }

            this.PreOrder = function (obj) {

            }

            this.PostOrder = function (obj) {

            }
        }
    </script>

    <div id="tab0" class="tabContainer">
        <h2 class="tab">
            <a class="tabLink" href="javascript:g.void();" onclick="/*tab.addTab(g.FindParentByTag(this,'div'));*/tab.showTab(this);">Number Conversions</a>
        </h2>
        <hr />
        <div class="tabData noDisplay ">
            <h3>Hex To Decimal</h3>
            <input type="text" id="HexToDec" onkeyup="g.OutputToDestination('HexToDecDest', convert.HexToDecimal(this.value, this.form.ReverseHexToDec.checked));" />
            <input type="checkbox" id="ReverseHexToDec" onclick="this.form.HexToDec.onkeyup();" /><label for="ReverseHexToDec">Reverse</label>
            <div id="HexToDecDest"></div>

            <h3>Hex To Binary</h3>
            <input type="text" id="HexToBin" onkeyup="g.OutputToDestination('HexToBinDest', convert.HexToBinary(this.value, this.form.ReverseHexToBin.checked));" />
            <input type="checkbox" id="ReverseHexToBin" onclick="this.form.HexToBin.onkeyup();" /><label for="ReverseHexToBin">Reverse</label>
            <div id="HexToBinDest"></div>

            <h3>Decimal To Binary</h3>
            <input type="text" id="DecToBin" onkeyup="g.OutputToDestination('DecToBinDest', convert.DecToBinary(this.value, this.form.ReverseDecToBin.checked));" />
            <input type="checkbox" id="ReverseDecToBin" onclick="this.form.DecToBin.onkeyup();" /><label for="ReverseDecToBin">Reverse</label>
            <div id="DecToBinDest"></div>
        </div>
    </div>

    <div id="tab2" class="tabContainer">
        <h2 class="tab">
            <a class="tabLink" href="javascript:g.void();" onclick="DoSorts();tab.showTab(this);">Sorts</a>
        </h2>
        <hr />
        <div class="tabData noDisplay defaultTab">
            <span>The Array List:</span>
            <br />
            <div id="TheArrayListDisplayed"></div>
            <br />
            <span>The Bubble Sorted Array List:</span>
            <br />
            <div id="TheArrayListBubbleSortDisplayed"></div>
            <br />
            <br />
            <span>The Selection Sorted Array List:</span>
            <br />
            <div id="TheArrayListSelectionSortDisplayed"></div>
            <br />
            <br />
            <span>The Insertion Sorted Array List:</span>
            <br />
            <div id="TheArrayListInsertionSortDisplayed"></div>


            <script type="text/javascript">
                var theList = g.CreateRandomArray(150);
                var theDispObj;

                function DoSorts() {
                    sort.SetArrayList(theList.slice());

                    theDispObj = document.getElementById("TheArrayListDisplayed");
                    theDispObj.innerHTML = "";
                    sort.DisplayArrayList(theDispObj);

                    theDispObj = document.getElementById("TheArrayListBubbleSortDisplayed");
                    theDispObj.innerHTML = "";

                    sort.BubbleSort();
                    sort.DisplayArrayList(theDispObj);

                    theDispObj.innerHTML += "<br/>Number of Bubble Sort swaps: " + sort.BubbleSort.NumOfSwaps.toString();
                    theDispObj.innerHTML += "<br/>Number of Bubble Sort loops: " + sort.BubbleSort.NumOfLoops.toString();

                    sort.SelectionSort();

                    theDispObj = document.getElementById("TheArrayListSelectionSortDisplayed");
                    theDispObj.innerHTML = "";
                    sort.DisplayArrayList(theDispObj);

                    theDispObj.innerHTML += "<br/>Number of Selection Sort swaps: " + sort.SelectionSort.NumOfSwaps.toString();
                    theDispObj.innerHTML += "<br/>Number of Selection Sort loops: " + sort.SelectionSort.NumOfLoops.toString();

                    sort.InsertionSort();

                    theDispObj = document.getElementById("TheArrayListInsertionSortDisplayed");
                    theDispObj.innerHTML = "";
                    sort.DisplayArrayList(theDispObj);

                    theDispObj.innerHTML += "<br/>Number of Insertion Sort swaps: " + sort.InsertionSort.NumOfSwaps.toString();
                    theDispObj.innerHTML += "<br/>Number of Insertion Sort loops: " + sort.InsertionSort.NumOfLoops.toString();
                }
            </script>
        </div>
    </div>

    <div id="tab1" class="tabContainer">
        <h2 class="tab">
            <a class="tabLink" href="javascript:g.void();" onclick="DoSearch();tab.showTab(this);">Searches</a>
        </h2>
        <div class="tabData noDisplay ">
            <h3>The Array List</h3>
            <div id="TheSearchArray"></div>
            <br />
            <h3>The Linear Search:</h3>
            <br />
            <div id="TheLinearSearchDisplayed"></div>
            <h3>The Bubble Sorted Array List, Binary Search:</h3>
            <div id="TheBinarySearchDisplayed"></div>

            <script type="text/javascript">
                function DoSearch() {
                    search.SetArrayList(theList);

                    theDispObj = document.getElementById("TheSearchArray");
                    theDispObj.innerHTML = "";
                    search.DisplayArrayList(theDispObj);

                    theDispObj = document.getElementById("TheLinearSearchDisplayed");

                    theDispObj.innerHTML = "";
                    theDispObj.innerHTML += "<br/>Index via Linear Search found at: " + search.Linear(6, sort.BubbleSort).join(", ");
                    search.DisplayArrayList(theDispObj);

                    theDispObj = document.getElementById("TheBinarySearchDisplayed");

                    theDispObj.innerHTML = "";
                    theDispObj.innerHTML += "<br/>Index via Binary Search found at: " + search.Binary(7, sort.BubbleSort);
                    search.DisplayArrayList(theDispObj);
                    theDispObj.innerHTML += "<br/>Number of Binary Search loops: " + search.Binary.NumOfLoops.toString();

                }
            </script>
        </div>
    </div>

    <div id="tab4" class="tabContainer">
        <h2 class="tab">
            <a class="tabLink" href="javascript:g.void();" onclick="tab.showTab(this);">Trie</a>
        </h2>
        <div class="tabData noDisplay ">
            <h3>Trie</h3>
            Available suggestions:
            <br />
            <span id="TrieAvailableSuggestions"></span>
            <br />
            <input type="text" value="s" id="TrieSuggestionBox" onkeyup="DoSuggestion(event,this);"/>
            <script type="text/javascript">
                var TrieArrayToLoad = ["stat", "skat", "skar", "-supercalifragalisticexpialadocious", "bibbity/bobbity", "start", "skate", "skars", "a"];
                theDispObj = document.getElementById("TrieAvailableSuggestions");
                theDispObj.innerHTML = TrieArrayToLoad.join(", ");

                trie.load(TrieArrayToLoad);
                TrieArrayToLoad = ["start", "skate", "skars", "a"];

                //trie.load(TrieArrayToLoad);

                trie.remove(TrieArrayToLoad);

                function DoSuggestion(e, obj) {
                    var m = trie.suggest(obj.value);
                    var originalText = obj.value;
                    var keynum, bolDoSuggestion = false;

                    if (window.event) { // IE					
                        keynum = e.keyCode;
                    } else
                        if (e.which) { // Netscape/Firefox/Opera					
                            keynum = e.which;
                        }

                    switch (true) {
                        case (keynum >= 48 && keynum <= 90):
                        case (keynum >= 186 && keynum <= 192):
                        case (keynum >= 219 && keynum <= 222):
                            bolDoSuggestion = true;

                    };
                    if (bolDoSuggestion) {
                        obj.value = m;
                        obj.focus();
                        obj.setSelectionRange(originalText.length, obj.value.length);
                    }
                }

            </script>
        </div>
    </div>

    <div id="tab5" class="tabContainer">
        <h2 class="tab">
            <a class="tabLink" href="javascript:g.void();" onclick="tab.showTab(this);">Binary</a>
        </h2>
        <div class="tabData noDisplay ">
            <h3>Binary Tree</h3>
            In Order:
            <div id="BinaryTreeInOrderDisplay"></div>
            <script type="text/javascript">
                var ArrayToLoad = [1,2,3,4,5,6,7,8,9,10,11,66,78,99,100];

                binaryTree.load(ArrayToLoad);

                theDispObj = document.getElementById("BinaryTreeInOrderDisplay");

                binaryTree.InOrder(theDispObj);
            </script>
        </div>
    </div>

    <script type="text/javascript">
        tab.addTab(document.getElementById("tab5"));
        tab.showTab(document.getElementById("tab5"));


    </script>
</asp:Content>
