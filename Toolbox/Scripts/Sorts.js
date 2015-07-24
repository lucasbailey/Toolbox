function Sorts(ctx) {
    ctx = (ctx == null || typeof ctx == 'undefined' ? this : ctx);

    ctx.INSERTION_SORT = 0;
    ctx.BUBBLE_SORT = 1;
    ctx.SELECTION_SORT = 2;    

    var ArrayList = [];
    var OriginalList = ArrayList.slice();

    _g = new Generic();

    ctx.GetContext = function () {
        return ctx;
    }

    ctx.SetArrayList = function (theArrayList) {
        ArrayList = theArrayList;
        OriginalList = ArrayList.slice();
    };

    ctx.InsertItem = function (theItem) {
        if (isNaN(theItem)) {
            _g.DisplayCustomError("The item to be inserted is not a number.  Insert failed.");
            return null;
        }

        ArrayList[ArrayList.length] = theItem;
    };

    ctx.DeleteItem = function (idx) {

    };

    ctx.DisplayArrayList = function (destObj) {
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

    function SwapThem(first, second) {
        var temp = ArrayList[first];
        ArrayList[first] = ArrayList[second];
        ArrayList[second] = temp;
    }

    function SortHelper(first, second, bolReverse) {
        return (!bolReverse ? second > first : first > second);
    }

    ctx.BubbleSort = function (bolReverse) {
        bolReverse = (bolReverse == null || typeof bolReverse == 'undefined' ? false : bolReverse);
        //"heavy" items sink to the bottom, "light" items float to the top

        ctx.BubbleSort.NumOfSwaps = 0;
        ctx.BubbleSort.NumOfLoops = 0;
        var dirty = false;

        //reset the array list to ignore previous sorts
        ArrayList = OriginalList.slice();

        for (var i = ArrayList.length - 1; i > 0; i--) {
            dirty = false;
            for (var j = 0; j < i; j++) {
                if (SortHelper(ArrayList[j + 1], ArrayList[j], bolReverse)) {
                    SwapThem(j + 1, j);
                    dirty = true;
                    ctx.BubbleSort.NumOfSwaps++;
                }
                ctx.BubbleSort.NumOfLoops++;
            }
            if (!dirty) {
                break;
            }
        }

        return ArrayList;
    };

    ctx.SelectionSort = function (bolReverse) {
        bolReverse = (bolReverse == null || typeof bolReverse == 'undefined' ? false : bolReverse);
        //selection sort finds the smallest number from the unsorted numbers
        //and moves them to the front of the list.
        var dirty = false;

        //reset the array list to ignore previous sorts
        ArrayList = OriginalList.slice();
        ctx.SelectionSort.NumOfSwaps = 0;
        ctx.SelectionSort.NumOfLoops = 0;

        for (var i = 0; i < ArrayList.length - 1; i++) {
            var temp;

            for (var j = i; j < ArrayList.length; j++) {
                temp = (temp == null ? j : temp);

                if (SortHelper(ArrayList[j], ArrayList[temp], bolReverse)) {
                    temp = j;
                    dirty = true;
                }

                ctx.SelectionSort.NumOfLoops++;
            }

            if (dirty) {
                SwapThem(temp, i);
                ctx.SelectionSort.NumOfSwaps++;
                dirty = false;
            }
            temp = null;
        }
        return ArrayList;
    };

    //ctx.MergeSort = function (bolReverse) {
    //    bolReverse = (bolReverse == null || typeof bolReverse == 'undefined' ? false : bolReverse);

    //    //reset the array list to ignore previous sorts
    //    ArrayList = OriginalList.slice();
    //};

    ctx.InsertionSort = function (bolReverse) {
        bolReverse = (bolReverse == null || typeof bolReverse == 'undefined' ? false : bolReverse);

        //insertion sort maintains a sorted and unsorted list
        //when it sees an unsorted number, it moves the number to the appropriate spot
        //in the sorted list.

        //reset the array list to ignore previous sorts
        ArrayList = OriginalList.slice();

        ctx.InsertionSort.NumOfSwaps = 0;
        ctx.InsertionSort.NumOfLoops = 0;

        var dirty = false;

        for (var i = 1; i < ArrayList.length; i++) {
            var j = i;
            var temp = ArrayList[i];

            if ((j == 0) || !SortHelper(temp, ArrayList[j - 1], bolReverse)) {
                ctx.InsertionSort.NumOfLoops++;
            }

            while ((j != 0) && SortHelper(temp, ArrayList[j - 1], bolReverse)) {
                SwapThem(j - 1, j);

                ctx.InsertionSort.NumOfSwaps++;
                ctx.InsertionSort.NumOfLoops++;

                j--;
            }
        }

        return ArrayList;
    };

}