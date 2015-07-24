function LoadScreens() {
    var tasks = [];
    var tasksInProgress = 0;
    var tasksCompleted = 0;

    var LoadScreenOverlay;
    var StatusTextContainer, StatusBar, StatusText;
    var LogoContainer;
    var LoadScreenContainer;

    var sbT;//status bar timer
    var lst;//load screen timer...

    var StatusTextContainerOptions = function(){
        this.textAlign = "center";
        this.position = "relative";
        this.backgroundColor = "green";
    };

    NewStatusTextContainerOptions = new StatusTextContainerOptions();

    var StatusBarOptions = function(){
        this.display = "inline-block";
        this.backgroundColor = "#c0c0c0";
        this.width = "0%";
        this.height = "100%";
        this.position = "absolute";
        this.backgroundImage = "url(Images/lukebailey.svg);";        
    };

    NewStatusBarOptions = new StatusBarOptions();

    var StatusTextOptions = function(){
        this.position = "relative";
        this.color =  "black";
    };

    NewStatusTextOptions = new StatusTextOptions();


    var _TaskTemplate = function () {
        this.callback = {};
        this.status = "Sample Status Text...";
    }

    this.newTask = function () { return new _TaskTemplate() };

    this.addTask = function (taskAry) {
        for (var i = 0; i < taskAry.length; i++) {
            tasks[tasks.length] = function (j) {
                tasksInProgress++;
                
                SetStatusText(taskAry[j].status);

                taskAry[j].callback(this[j]);
                
            }
        }
    }


    //ctx is the context of the task being completed...
    //this should allow for easily finding the task being
    //completed and removing it
    this.TaskComplete = function (ctx) {
        var isDirty = false;
        var itemComplete = 0;

        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i] == ctx) {
                tasks[i] = null;

            }
        }

        //check to see if all tasks are completed
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i] != null) {
                isDirty = true;
            }
            else {
                itemComplete++;
            }
        }

        UpdateStatusText(itemComplete);

        if (!isDirty) {//all items are complete, start the loadscreen backout process
            SetStatusText("Starting game!")
            lst = setTimeout(function () {
                //the following prevents an error if multiple items get marked complete before the timeout expires
                lst = clearTimeout(lst);
                KillLoadScreen();
                    }, 200);
        }
    }

    function CreateLoadScreen() {
        CreateLoadScreenOverlay();
        CreateLogo();
        CreateStatusText();
    }

    function CreateLoadScreenOverlay() {
        //create the overlay
        LoadScreenOverlay = document.createElement("div");
        LoadScreenOverlay.style.position = 'fixed';
        LoadScreenOverlay.style.width = "100%";
        LoadScreenOverlay.style.height = '100%';
        LoadScreenOverlay.style.left = '0px';
        LoadScreenOverlay.style.top = '0px';
        LoadScreenOverlay.style.backgroundColor = "rgba(200,200,200,.9)";
    }

    function KillLoadScreen() {
        document.body.removeChild(LoadScreenOverlay);
    }

    function CreateStatusText() {
        StatusTextContainer = document.createElement("div");

        for (var key in NewStatusTextContainerOptions) {
            StatusTextContainer.style[key] = NewStatusTextContainerOptions[key];
        }

        StatusBar = document.createElement("div");
        StatusBar.innerHTML = "&nbsp;";//ensure the height of the box is properly set per the size of the text;

        for (var key in NewStatusBarOptions) {
            StatusBar.style[key] = NewStatusBarOptions[key];
        }
        
        StatusText = document.createElement("span");
        
        for (var key in NewStatusTextOptions) {
            StatusText.style[key] = NewStatusTextOptions[key];
        }

        StatusTextContainer.appendChild(StatusBar);
        StatusTextContainer.appendChild(StatusText);

        LoadScreenOverlay.appendChild(StatusTextContainer);
    }

    function SetStatusText(status) {
        StatusText.innerHTML = status;
    }

    function UpdateStatusText(intComplete) {
        //animate the width of the bar from its current position to the percentage complete
        var destinationWidth = parseFloat(intComplete / tasks.length) * 100;

        sbT = clearInterval(sbT);

        sbT = setTimeout(function () {
            ResizeStatusBar(destinationWidth);
        }, 100);
    }

    function ResizeStatusBar(destinationWidth) {
        var step = 1;
        var currentWidth = parseFloat(StatusBar.style.width.replace(/[^0-9\.]/g, ""));

        var newWidth = currentWidth + step;

        if (newWidth > destinationWidth) {
            StatusBar.style.width = destinationWidth.toString() + "%";
            sbT = clearTimeout(sbT);
        }
        else {
            StatusBar.style.width = newWidth.toString() + "%";
            sbT = setTimeout(function () {
                ResizeStatusBar(destinationWidth);
            }, 1);
        }        
    }

    function CreateLogo() {
        LogoContainer = document.createElement("div");

        LogoContainer.style.textAlign = "center";


        var img = document.createElement("img");
        img.alt = "logo";
        img.src = "/Images/lukebailey.svg";
        img.style.width = "80%";
        

        LogoContainer.appendChild(img);
        LoadScreenOverlay.appendChild(LogoContainer);
    }


    this.StartLoad = function(){
        if (tasks.length > 0) {
            //create the load screen
            CreateLoadScreen();

            //show the load screen
            document.body.appendChild(LoadScreenOverlay);

            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i] != null && typeof tasks[i] != 'undefined') {
                    tasks[i](i);
                }
            }
        }
    }

}