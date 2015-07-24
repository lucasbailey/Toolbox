//Analytics is dependant upon jQuery!!!
//Analytics is dependant upon Generic.js!!!

function Analytics(options) {
    var BASE_PATH = "http://localhost:56489/WebAnalytics.asmx/"
    var COMMAND_BASE_ANALYTICS_OBJ = "GetBaseAnalyticsObj";
    var COMMAND_SEND_ANALYTICS_ENTRY = "AnalyticsEntry";
    var COMMAND_SEND_ANALYTICS_ARRAY = "AnalyticsEntryArray";
    var COMMAND_GET_ANALYTICS_ARRAY = "GetAnalytics";
    var AUTO_SEND_LIMIT = 1000;

    var AnalyticsObj = function () {
        this.ServerDateTimeEntry = new Date(); // 'date/time of event being logged as specified by the server
        this.ClientDateTimeEntry = new Date(); // 'date/time of event taking place as specified by the user's javascript
        this.ElementName = ""; //'html element type...div, span, body, etc...
        this.ElementID = ""; //'html ID of the element, blank if no ID is specified in html
        this.ElementInnerHTML = ""; //'inner html of the element causing event
        this.Action = ""; //'javascript event 
        this.URL = ""; //'the url of the page being analyzed, may or may not include any GET parameters
        this.Params = ""; //'GET/POST parameters of URL
    }

    this.AnalyticsObjAry = [];

    //using jquery will change the context of the "this" variable
    //save a reference to the current "this" variable, so that we can reliably
    //make calls to functions normally handled by "this"
    var ctx = this;

    function getAllEvents() {
        var result = [];

        var ignoreList = {
            'mousemove': 1,
            'pointermove': 1

        }

        for (var key in this) {
            if (key.indexOf('on') === 0) {
                var keySlice = key.slice(2);

                //ignore list
                if (ignoreList[keySlice] != 1) {
                    result.push(keySlice);
                }
            }
        }
        return result.join(' ');
    }

    this.BindBodyAnalytics = function (options) {
        options = objExists(options, options, {});
        options.NoDomainURL = objExists(options.NoDomainURL, options.NoDomainURL, false);

        $("body").find("*").bind(getAllEvents(), function (e) {
            var AnalyzeObj = ctx.NewAnalyticsObj();

            AnalyzeObj.Action = event.type;
            AnalyzeObj.ElementID = (this.id == null ? "" : this.id);
            AnalyzeObj.ElementInnerHTML = (this.innerHTML == null ? "" : /*SafeXML(this.innerHTML)*/ "");
            AnalyzeObj.ElementName = (this.nodeName == null ? "" : this.nodeName);
            AnalyzeObj.URL = (options.NoDomainURL == true ? location.pathname : location.href);
            AnalyzeObj.Params = location.search;//only useful w/ GET type parameters...

            //if it isn't good enough to have an ID, it isn't good enough to be tracked
            //if (test.ElementID != "") {
            ctx.AnalyticsObjAry[ctx.AnalyticsObjAry.length] = AnalyzeObj;
            //}

            //every xxx items entered, automatically send the data.
            //this will require us to make a copy of the current array
            //then re-initialize the current array...
            if (ctx.AnalyticsObjAry.length % AUTO_SEND_LIMIT == 0) {
                //make copy of the object
                var AnalyticsObjAry_Copy = ctx.AnalyticsObjAry.slice();

                ctx.AnalyticsObjAry = [];

                var AnalyticsAjaxObj = {
                    bolAsync: true
                }

                //todo: maybe create a way to do this async?
                ctx.SendAnalyticsEntryAry(AnalyticsObjAry_Copy, AnalyticsAjaxObj);
            }


            //prevent the parent container objects from executing event code...
            event.stopPropagation();

        });
    }

    ///this gets a base Analytics object from the server.
    ///this base object will be the basis for every newly 
    ///created analytics object created in Javascript.
    this.GetBaseAnalyticsObj = function () {
        var newObj = new AnalyticsObj();
    }

    this.NewAnalyticsObj = function () {
        var returnObj = new AnalyticsObj();

        returnObj.ElementName = "test";

        return returnObj;
    }

    this.SendAnalyticsEntry = function (analyticsObj, opts) {
        var AjaxOptions = {
            urlAddress: BASE_PATH + COMMAND_SEND_ANALYTICS_ENTRY,
            requestType: "POST",
            requestParams: "jsonString=" + JSON.stringify(analyticsObj)
        }

        //merge and overwrite the default ajax options
        //this won't necessarily work for multi-tiered objects
        //ex: obj = { tier1 : { tier2: ""} };
        for (var key in opts) {
            AjaxOptions[key] = opts[key];
        }

        AjaxOptions.success = function (response) {

        };

        AjaxOptions.fail = function (response) {
            var msg = response;
            DisplayError(msg);
        };

        ajax(AjaxOptions);
    }

    this.SendAnalyticsEntryAry = function (analyticsAry, opts) {
        //set the default ajax options
        var AjaxOptions = {
            urlAddress: BASE_PATH + COMMAND_SEND_ANALYTICS_ARRAY,
            requestType: "POST",
            requestParams: "jsonString={'AnalyticsAry':" + JSON.stringify(analyticsAry) + "}",
            bolAsync: false
        }

        //merge and overwrite the default ajax options
        //this won't necessarily work for multi-tiered objects
        //ex: obj = { tier1 : { tier2: ""} };
        for (var key in opts) {
            AjaxOptions[key] = opts[key];
        }

        AjaxOptions.success = function (response) {

        };

        AjaxOptions.fail = function (response) {
            var msg = response;
            DisplayError(msg);
        };
        var test = 0;
        ajax(AjaxOptions);
    }

    this.GetAnalytics = function (SearchOptions, OverrideDefaultOptions) {
        SearchOptions = objExists(SearchOptions, SearchOptions, {});
        var keyValuePairs = objExists(SearchOptions.keyValuePairs, SearchOptions.keyValuePairs, "");
        var callback = objExists(SearchOptions.callback, SearchOptions.callback);
        var callbackArgs = objExists(SearchOptions.callbackArgs, SearchOptions.callbackArgs);

        var AjaxOptions = {
            urlAddress: BASE_PATH + COMMAND_GET_ANALYTICS_ARRAY,
            requestType: "POST",
            requestParams: "keyValueJSON=" + JSON.stringify(keyValuePairs) + "",
            bolAsync: true
        }

        //merge and overwrite the default ajax options
        //this won't necessarily work for multi-tiered objects
        //ex: obj = { tier1 : { tier2: ""} };
        for (var key in OverrideDefaultOptions) {
            AjaxOptions[key] = OverrideDefaultOptions[key];
        }

        AjaxOptions.success = function (xmlHTTP, a, b, c) {
            if (callback != false) {
                callback(xmlHTTP,callbackArgs);
            }
        };

        AjaxOptions.fail = function (response) {
            var msg = response;
            DisplayError(msg);
        };
        
        ajax(AjaxOptions);
    }

    this.StartAnalyticsVisualization = function () {

    }

    function DisplayError(error) {
        g.DisplayCustomError("jQuery Ajax error: " + error);
    }

    function ajax(paramsObj) {
        var urlAddress = objExists(paramsObj.urlAddress, paramsObj.urlAddress, "");
        var requestType = objExists(paramsObj.requestType, paramsObj.requestType, "GET");
        var requestParams = objExists(paramsObj.requestParams, paramsObj.requestParams, "");
        var bolAsync = objExists(paramsObj.bolAsync, paramsObj.bolAsync, true);
        var success = objExists(paramsObj.success, paramsObj.success, null);
        var successArgs = objExists(paramsObj.successArgs, paramsObj.successArgs, null);

        var fail = objExists(paramsObj.fail, paramsObj.fail, null);
        var failArgs = objExists(paramsObj.failArgs, paramsObj.failArgs, null);

        if (requestType == "GET" && requestParams != "") {
            urlAddress += "?" + requestParams;
        }

        var xmlhttp;
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        }
        else {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.withCredentials = true;

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                //try {
                tsv = xmlhttp.responseText;
                success(xmlhttp, successArgs);
            }
            else if (xmlhttp.readyState == 4 && xmlhttp.status != 200) {
                fail(xmlhttp.responseText, failArgs);
            }
        }
        xmlhttp.open(requestType, urlAddress, bolAsync);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send((requestType == "POST" ? requestParams : null));
    }

    function SafeXML(strInput) {
        var returnString = strInput.replace("<", "&lt;")
                                   .replace(">", "&gt;");

        return returnString;
    }

    function objExists(obj, existsObj, missingObj) {
        existsObj = (existsObj == null || typeof obj == 'undefined' ? true : existsObj);
        missingObj = (missingObj == null || typeof missingObj == 'undefined' ? false : missingObj);
        return (obj == null || typeof obj == 'undefined' ? missingObj : existsObj);
    }
}