function Generic() {
    this.void = function () { };

    this.STANDARD_DISPLAY = 1;
    this.FLAG_DISPLAY = 2;

    this.DisplayCustomError = function (msg, options) {


        options = (options == null || typeof options == 'undefined' ? {} : options);
        options.type = (options.type == null || typeof options.type == 'undefined'
                            ? this.STANDARD_DISPLAY
                            : options.type);

        var custErrContainer = document.createElement("div");;
        custErrContainer.id = "_custErrorContainer";

        if (options.type == this.STANDARD_DISPLAY) {
            var closeErrorButton = "<div class='GenericErrorButtonContainer'>"
            + "<a class='GenericErrorBtn' href='javascript:g.void();' "
               + "onclick='g.HideCustomError(\""
               + custErrContainer.id
               + "\");'>Close</a>"
            + "</div>";

            custErrContainer.className = "GenericErrorContainerOverlay";
            custErrContainer.innerHTML = "<div class='GenericErrorContainer'><br/>" + msg
                                       + closeErrorButton + "</div>";

            document.body.appendChild(custErrContainer);
        }
        else if (options.type == this.FLAG_DISPLAY) {
            if (options.destObj == null || typeof options.destObj == 'undefined') {
                this.DisplayCustomError("A flag display cannot be shown without a destination.");
                return null;
            }

            var parentObj = options.destObj.parentElement;

            custErrContainer.className = "GenericErrorFlag";
            custErrContainer.style.opacity = "0";

            custErrContainer.innerHTML = msg;
            parentObj.appendChild(custErrContainer);

            //add the appropriate callbacks to the option container
            if (options.callback == null || typeof options.callback == 'undefined') {
                options.callback = [StartShowFlag];
            }

            if (options.step == null || typeof options.callback == 'undefined') {
                options.step = 1;
            }
            custErrContainer.style.opacity = 0;

            if ((typeof flagT == 'undefined' || flagT == null)
                && (typeof flagI == 'undefined' || flagI == null)) {
                StartShowFlag(custErrContainer, options)
            }

        }
    }

    var flagT, flagI;
    var FLAG_OPACITY_STEP = .03;

    function StartShowFlag(obj, options) {
        var step = options.step;
        var callback = options.callback;

        flagI = setInterval(function () {
            obj.style.opacity = parseFloat(obj.style.opacity) + (parseFloat(FLAG_OPACITY_STEP) * step);

            if (parseFloat(obj.style.opacity) <= 0) {
                obj.style.opacity = "0";
                flagI = clearInterval(flagI);
            }

            if (parseFloat(obj.style.opacity) >= 1) {
                obj.style.opacity = "1";
                flagI = clearInterval(flagI);

                if (callback[0] != null && typeof callback[0] != 'undefined') {
                    var tempAry = callback.splice();
                    tempAry.shift();

                    options.step = -1;
                    options.callback = tempAry;

                    flagT = setTimeout(function () {
                        callback[0](obj, options);
                        flagT = clearTimeout(flagT);
                    }, options.autoClear);
                }
            }

        }, 1)
    }

    this.DisplayCustomErrorOptions = function () {
        this.type = 1;
        this.objDest = null;

        this.autoClear = 500; //time in milliseconds, 0 means don't autoclear
    }

    this.HideCustomError = function (obj) {
        if ((typeof obj).toString().toLowerCase() == "string") {
            obj = document.getElementById(obj);
        }

        document.body.removeChild(obj);
    }

    this.OutputToDestination = function (destID, output) {
        var destObj = document.getElementById(destID);

        if (destObj.innerHTML != null && typeof destObj.innerHTML != 'undefined') {
            destObj.innerHTML = output;
        }
        else if (destObj.value != null && typeof destObj.value != 'undefined') {
            destObj.value = output;
        }
        else if (destObj.text != null && typeof destObj.text != 'undefined') {
            destObj.text = output;
        }
    };

    this.FindParentByTag = function (obj, tag) {
        obj = obj.parentElement; //ensure we don't evaluate the original object

        if (obj == null || typeof obj == 'undefined') {
            return null;//the parent is not found
        }

        if (obj.nodeName.toLowerCase() != tag.toLowerCase() && (obj != null && typeof obj != 'undefined')) {
            obj = this.FindParentByTag(obj, tag);
        }

        return obj;
    };

    this.FindChildByClass = function (obj, tag) {
        var returnObj;
        for (var i = 0; i < obj.children.length; i++) {
            if (obj.children[i].className.search(tag) != -1) {
                returnObj = obj.children[i];
            }
            else {
                returnObj = this.FindChildByClass(obj.children[i], tag);
            }

            if (returnObj != null) {
                break;
            }
        }

        return returnObj;
    }

    this.CreateRandomArray = function (intSize) {
        var returnArray = [];
        for (var i = 0; i < intSize; i++) {
            returnArray[returnArray.length] = Math.round(Math.random() * intSize);
        }

        return returnArray.slice();
    }

    //takes a dom object parameter
    //function determines the element type
    //and returns the appropriate value based on the type
    //ex...inputs = input.value
    //ex...div = div.innerHTML
    //ex...select = select.options[select.selectedIndex].value
    //etc...
    this.GetValue = function (obj) {
        switch (obj.nodeName.toLowerCase()) {
            case "select":
                return obj.options[obj.selectedIndex].value;
            case "input":
            case "textarea":
                return obj.value;

            default:
                return obj.innerHTML;

        }
    }

    //takes a dom object parameter
    //function determines the element type
    //and set the appropriate value based on the type
    //ex...inputs = input.value
    //ex...div = div.innerHTML
    //ex...select = select.options[select.selectedIndex].value
    //etc...
    this.SetValue = function (obj, value) {
        switch (obj.nodeName.toLowerCase()) {
            case "select":
                break;//not sure how to handle select lists
                //return obj.options[obj.selectedIndex].value;
            case "input":
            case "textarea":
                obj.value = value;

            default:
                obj.innerHTML = value;

        }
    }
}