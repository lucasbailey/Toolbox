function Heaps() {
    //heap's only real requirement is that parent nodes be greater than children nodes
    //by definition, the largest number must be at the top of the heap

    //heaps are usually implemented via arrays

    var Heap = [15, 12, 10, 6, 1, 9, 11, 14, 19, 20, 21, 23, 25, 27, 29];
    //15, 12, 11, 6, 1, 9, 10

    this.load = function (AryList) {
        Heap = AryList.slice();
        _balance();
        var test = 0;
    }

    //this function will go through all the nodes and ensure 
    //that the parent nodes are always > children.
    //if they aren't it will call the swap function to swap the 
    //parent and child.

    function _balance() {
        var isDirty = false;

        for (var i = 0; i < Heap.length - 2; i++) {
            var indexToSwap = (Heap[2 * i + 1] < Heap[2 * i + 2] ? 2 * i + 2 : 2 * i + 1); //find the bigger of the two children

            if (Heap[i] < Heap[indexToSwap]) {
                _SwapValues(i, indexToSwap);
                isDirty = true;
            }
        }
        if (isDirty) {
            _balance();
        }
        return isDirty;
    }

    function _SwapValues(indexOne, indexTwo) {
        var temp = Heap[indexOne];
        Heap[indexOne] = Heap[indexTwo];
        Heap[indexTwo] = temp;
    }

    this.GetHeap = function () {
        return Heap;
    }
}