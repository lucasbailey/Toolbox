function BinaryTrees() {
    BinaryTree = {};
    
    this.load = function (AryList) {
        var _sort = new Sorts();
        //get all the inputs and sort them
        _sort.SetArrayList(AryList);
        AryList = _sort.InsertionSort().slice();

        BinaryTree = _CreateNode(AryList);
    }

    this.FindNodeByValue = function(value, node) {
        if (node == null) {
            node = BinaryTree;
        }

        if (isNaN(value)) {
            return null;
        }

        value = Number(value);

        if (node.value < value) {
            if (node.right != null && typeof node.right != 'undefined') {
                return node = this.FindNodeByValue(value, node.right);
            }
            else {
                return null;
            }
        }
        else if (node.value > value) {
            if (node.left != null && typeof node.left != 'undefined') {
                return node = this.FindNodeByValue(value, node.left);
            }
            else {
                return null;
            }
        }
        else {
            return node;
        }
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
            obj.innerHTML = _TraverseNode(BinaryTree, 1);
        }
    }

    this.PreOrder = function (obj) {
        if (BinaryTree != null) {
            obj.innerHTML = _TraverseNode(BinaryTree, 0);
        }
    }

    this.PostOrder = function (obj) {
        if (BinaryTree != null) {
            obj.innerHTML = _TraverseNode(BinaryTree, 2);
        }
    }

    function _TraverseNode(node, order) {
        var returnValue = null;

        if (order == 0) {//pre order
            returnValue = node.value;
        }

        if (node.left != null) {
            var tempValue = _TraverseNode(node.left, order);
            returnValue = (returnValue == null ? tempValue : [returnValue, tempValue].join(", "));
        }

        if (order == 1) {//in order
            if (returnValue == null) {
                returnValue = node.value;
            }
            else {
                returnValue = [returnValue, node.value].join(", ");
            }

        }

        if (node.right != null) {
            returnValue = [returnValue, _TraverseNode(node.right, order)].join(", ");
        }

        if (order == 2) {//post order
            if (returnValue == null) {
                returnValue = node.value;
            }
            else {
                returnValue = [returnValue, node.value].join(", ");
            }

        }

        return returnValue;
    }

}