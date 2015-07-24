function Tabs(defaultOptions) {
    var _g = new Generic();

    defaultOptions = (defaultOptions == null || typeof defaultOptions == 'undefined' ? {} : defaultOptions);
    defaultOptions.displayStyle =(defaultOptions.displayStyle == null || typeof defaultOptions.displayStyle == 'undefined' ? 0 : defaultOptions.displayStyle);
    defaultOptions.destObjID = (defaultOptions.destObjID == null || typeof defaultOptions.destObjID == 'undefined' ? "tabSwapContainer" : defaultOptions.destObjID);

    var tabList = [];
    var visibleTab = null;
    var displayStyle = defaultOptions.displayStyle; //tabs are a row going down the screen = 0; tabs are columns across the screen = 1
    //var destObj = document.getElementByID(defaultOptions.destObjID);

    this.addTab = function (obj) {
        var idx = this.findTabIdx(obj);

        if (idx != null) {
            tabList[tabList.length] = obj;

            //add the css class for horizontal tabs if necessary
            if (displayStyle == 1) {
                obj.className += " horizontalTabs ";
            }
        }
    };

    this.addTabs = function (strID) {
        var obj;
        var i = 0;
        for (obj = document.getElementById(strID + i.toString()); obj != null; i++) {
            this.addTab(obj);
            obj = document.getElementById(strID + i.toString());
        }
    }

    this.findTabIdx = function (obj) {
        for (var i = 0; i < tabList.length; i++) {
            if (obj === tabList[i]) {
                return i;
            }
        }
        return -1;
    };

    this.showTab = function (obj, options) {
        options = (options == null || typeof options == 'undefined' ? {} : options);        

        //obj can be the tab, or a child element of the tab...
        //working under the assumption that a tab can't contain another tab

        var aTab, tmpTab;

        if (obj == null || typeof obj == 'undefined') {
            _g.DisplayCustomError("Cannot show the specified tab.  It doesn't exist.  The default tab will be shown instead.");
            this.displayDefaultTab();
            return null;
        }

        if (obj.className.search("tabContainer") == -1) {
            aTab = _g.FindParentByTag(obj, "div");
        }
        else {
            aTab = obj;
        }

        //just because it is a div, doesn't mean it is a tab...
        var idx;

        tmpTab = aTab;

        while ((idx = this.findTabIdx(aTab)) == -1) {
            aTab = _g.FindParentByTag(aTab, "div");

            if (aTab == null) {
                break;
            }
        }

        if (aTab == null) { //didn't find the current tab before reaching root node
            this.addTab(tmpTab);
            aTab = tmpTab;
            tmpTab = null;
        }

        //hide the previous tab
        this.hideTab(visibleTab);

        //show the current tab's data
        visibleTab = aTab;

        var childData = _g.FindChildByClass(aTab, "tabData");

        if (childData != null && typeof childData != 'undefined') {
            childData.className = childData.className.replace(/ noDisplay /g, " ")
        }

        if (displayStyle == 0) {

        }
        else if (displayStyle == 1) {
            var theSwapContainer = document.getElementById(defaultOptions.destObjID); //document.getElementById("tabSwapContainer");

            if (theSwapContainer != null) {
                moveChildren(childData, theSwapContainer);
            }
        }

        return aTab;
    };

    this.hideTab = function (aTab) {
        if (aTab != null && typeof aTab != 'undefined') {
            var childData = _g.FindChildByClass(aTab, "tabData");

            if (childData == null || typeof childData == 'undefined') {
                _g.DisplayCustomError("TabData class is missing from Tab: " + aTab.id);
            }
            else {
                childData.className += " noDisplay ";
            }


            if (displayStyle == 0) {

            }
            else if (displayStyle == 1) {
                var theSwapContainer = document.getElementById(defaultOptions.destObjID); //document.getElementById("tabSwapContainer");

                if (theSwapContainer != null) {
                    moveChildren(theSwapContainer, childData);
                    //aTab.innerHTML = theSwapContainer.innerHTML;
                }
            }
        }
    };

    function moveChildren(fromObj, toObj) {
        //get the last child in the from Obj...
        while (fromObj.lastChild != null) {
            toObj.insertBefore(fromObj.lastChild, toObj.firstChild);
        }

    }

    this.displayDefaultTab = function () {
        //grab the first tab marked default;
        var tabData = g.FindChildByClass(document.body, "defaultTab");

        var theTab = this.showTab(tabData);

    }
}