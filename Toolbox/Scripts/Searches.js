function Searches() {
    ArrayList = [];
    OriginalList = ArrayList.slice();

    this.DisplayArrayList = function (destObj) {
        var html = "<table class='displaySortArrayInfo'><tr>";

        var rowHTML = "<tr>";
        var indexHTML = "<tr>";

        for (var i = 0; i < ArrayList.length; i++) {
            indexHTML += "<td>" + i.toString() + "</td>";
            rowHTML += "<td>" + ArrayList[i].toString() + "</td>";
        }

        rowHTML += "</tr>";
        indexHTML += "</tr>";

        html += indexHTML + rowHTML + "</tr></table>"

        if (destObj == null || typeof destObj == "undefined") {
            _g.DisplayCustomError("The destination doesn't exist.  Can't display the array.");

            return null;
        }

        destObj.innerHTML += html;
    }

    this.SetArrayList = function (theList) {
        ArrayList = theList.slice();
        OriginalList = ArrayList.slice();
    }

    //returns the indices where the value to search is located
    this.Linear = function (valueToSearch) {
        var returnArray = [];

        for (var i = 0; i < ArrayList.length; i++) {
            if (ArrayList[i] == valueToSearch) {
                returnArray[returnArray.length] = i;
            }
        }

        return returnArray;
    };

    //returns the index where the value to search is located
    //doesn't handle multiple occurrences...just the first index it finds
    this.Binary = function (valueToSearch, sortFunctionToUse) {
        var _g = new Generic();
        var _sort = new Sorts();
        var min, max, current;
        var InfiniteLoopSafety = ArrayList.length + 1;

        this.Binary.NumOfLoops = 0;

        min = current = 0;
        max = ArrayList.length - 1;

        _sort.SetArrayList(ArrayList.slice());

        if (sortFunctionToUse == null || typeof sortFunctionToUse == "undefined") {
            ArrayList = _sort.InsertionSort().slice();
        }
        else {
            if (sortFunctionToUse == _sort.INSERTION_SORT) {
                ArrayList = _sort.InsertionSort().slice();
            }
            else if (sortFunctionToUse == _sort.BUBBLE_SORT) {
                ArrayList = _sort.BubbleSort().slice();
            }
            else if (sortFunctionToUse == _sort.SELECTION_SORT) {
                ArrayList = _sort.SelectionSort().slice();
            }
            else {
                ArrayList = _sort.InsertionSort().slice();
            }
        }

        _sort.DisplayArrayList(document.getElementById("TheBinarySearchDisplayed"));

        while (ArrayList[current] != valueToSearch) {
            this.Binary.NumOfLoops++;

            if (ArrayList[current] > valueToSearch) {
                max = current - 1;
                if (max < 0) {
                    _g.DisplayCustomError("Searched value is outside lower bounds.")
                    return null;
                }
            }
            else if (ArrayList[current] < valueToSearch) {
                min = current + 1;
                if (min >= ArrayList.length) {
                    _g.DisplayCustomError("Searched value is outside upper bounds.");
                    return null;
                }
                else if (min > max) {
                    _g.DisplayCustomError("Value not found")
                    return null;
                }
            }
            
            current = Math.floor((max + min) / 2);

            if (InfiniteLoopSafety == 0) {
                _g.DisplayCustomError("Infinite Loop protection!!!")
                return null;
            }
            InfiniteLoopSafety--;
        }
        return current;
    };
}