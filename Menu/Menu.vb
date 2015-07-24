Imports System
Imports System.Collections.Generic
Imports System.ComponentModel
Imports System.Text
Imports System.Web
Imports System.Web.UI
Imports System.Web.UI.WebControls
Imports System.Text.RegularExpressions
Imports System.IO
Imports System.Web.Script.Serialization

<DefaultProperty("isFooter"), ToolboxData("<{0}:Menu runat=server></{0}:Menu>")>
Public Class Menu
    Inherits Panel
    Const MENU_FILE = "config/menu.json"
    Const DEFAULT_CLASS_NAME = "_HeaderMenu"
    Const FOOTER_CLASS_NAME = "_FooterMenu"

    ReadOnly APP_PATH = AppDomain.CurrentDomain.BaseDirectory
    ReadOnly APP_PATH_PAGE = APP_PATH + "Pages\"
    ReadOnly APP_PATH_CONFIG = APP_PATH + "Config\"

    Private Class DirectoryHeirarchy
        Private _indexCount As Integer = 100
        Public dirChild As New List(Of DirectoryHeirarchy)

        Sub New()

        End Sub

        Sub New(strInput As String)
            dir = strInput
        End Sub

        Sub New(ByVal num As Integer)
            _indexCount = num
        End Sub

        Sub New(strInput As String, num As Integer)
            _indexCount = num
            dir = strInput

            For i = 0 To num - 1
                SetChild(i, New DirectoryHeirarchy())
            Next

        End Sub

        Public dir As String 'main directory
        'children of main directory

        Public FileList As String() 'files in main directory

        'Public Function GetChild() As List(Of DirectoryHeirarchy)
        '    Return dirChild
        'End Function

        Public Sub SetChild(numIndex As Integer, value As DirectoryHeirarchy)
            While (dirChild.Count < numIndex + 1)
                dirChild.Add(New DirectoryHeirarchy)
            End While

            dirChild(numIndex) = value

        End Sub

        'Function clone()
        '    Dim theClone As New DirectoryHeirarchy(Me.dir, Me.dirChild.Count)

        '    theClone.dirChild = Me.dirChild

        '    Return theClone
        'End Function


    End Class

    Private Class MenuOptions
        Private _className As String = ""
        Private _ParentFolder As String = " "
        Private _MenuLevel As Integer = 0 'zero is the main LI element, 1 is the first group of child LI elements, 2 is the second group, etc...

        Sub New()
            _className = DEFAULT_CLASS_NAME
            _ParentFolder = " "
            _MenuLevel = 0

        End Sub

        Public Sub SetClassName(className As String)
            _className = className
        End Sub

        Public Function GetClassName() As String
            Return _className
        End Function

        Public Sub SetParentFolder(ParentFolder As String)
            _ParentFolder = ParentFolder
        End Sub

        Public Function GetParentFolder() As String
            Return _ParentFolder
        End Function

        Public Sub SetMenuLevel(MenuLevel As Integer)
            _MenuLevel = MenuLevel
        End Sub

        Public Function GetMenuLevel() As Integer
            Return _MenuLevel
        End Function

        Public Function clone() As MenuOptions
            Dim returnOpts = New MenuOptions
            returnOpts.SetClassName(Me.GetClassName)
            returnOpts.SetParentFolder(Me.GetParentFolder)
            returnOpts.SetMenuLevel(Me.GetMenuLevel)


            Return returnOpts
        End Function
    End Class

    <Bindable(True), Category("Appearance"), DefaultValue(""), Localizable(True)>
    Property Path() As String
        Get
            Dim s As String = CStr(ViewState("Path"))
            If s Is Nothing Then
                Return "[" & Me.ID & "]"
            Else
                Return s
            End If
        End Get

        Set(ByVal Value As String)
            ViewState("Path") = Value
        End Set
    End Property

    <Bindable(True), Category("Appearance"), DefaultValue(""), Localizable(True)>
    Property FileName() As String
        Get
            Dim s As String = CStr(ViewState("FileName"))
            If s Is Nothing Then
                Return "[" & Me.ID & "]"
            Else
                Return s
            End If
        End Get

        Set(ByVal Value As String)
            ViewState("FileName") = Value
        End Set
    End Property

    <Bindable(True), Category("Appearance"), DefaultValue("false"), Localizable(True)>
    Property isFooter() As Boolean
        Get
            Dim s As String = CStr(ViewState("isFooter"))
            If s Is Nothing Then
                Return False
            Else
                Return s
            End If
        End Get

        Set(ByVal Value As Boolean)
            ViewState("isFooter") = Value
        End Set
    End Property

    <Bindable(True), Category("Appearance"), DefaultValue("index.aspx"), Localizable(True)>
    Property DefaultPage() As String
        Get
            Dim s As String = CStr(ViewState("DefaultPage"))
            If s Is Nothing Then
                Return "index.aspx"
            Else
                Return s
            End If
        End Get

        Set(ByVal Value As String)
            ViewState("DefaultPage") = Value
        End Set
    End Property

    Protected Overrides Sub RenderContents(ByVal output As HtmlTextWriter)
        Dim out As DirectoryHeirarchy

        'get shortcut file information
        Dim sFileInfo As New FileInfo(APP_PATH + MENU_FILE)

        If sFileInfo.Exists = False OrElse _
            (DateDiff(DateInterval.Minute, sFileInfo.LastWriteTimeUtc.ToLocalTime, Now) >= 30) Then
            out = GetFolders(APP_PATH_PAGE)
            CreateMenuConfigFiles(out)
        Else
            Dim serializer As New JavaScriptSerializer()
            out = serializer.Deserialize(Of DirectoryHeirarchy)(File.ReadAllText(APP_PATH + MENU_FILE))
        End If

        Dim outputString As String

        Dim _menuOptions = New MenuOptions

        If (isFooter) Then
            _menuOptions.SetClassName("_FooterMenu")
        End If

        outputString = GetMenuHTML(out, _menuOptions)
        output.Write(outputString)
    End Sub

    Private Sub CreateMenuConfigFiles(out As DirectoryHeirarchy)
        Dim serializer As New JavaScriptSerializer()
        Dim serialString As New StringBuilder

        serializer.Serialize(out, serialString)

        If Not (Directory.Exists(APP_PATH_CONFIG)) Then
            Directory.CreateDirectory(APP_PATH_CONFIG)
        End If

        File.WriteAllText(APP_PATH + MENU_FILE, serialString.ToString)
    End Sub

    Private Function GetMenuHTML(out As DirectoryHeirarchy, Optional opts As MenuOptions = Nothing)
        If IsNothing(opts) Then
            opts = New MenuOptions
        End If

        opts.SetParentFolder(out.dir)

        Return "<div class='" & opts.GetClassName & "Container'><ul class='" & opts.GetClassName & "'>" & GetMenuItemsHTML(out, opts) & "</ul></div>"
    End Function

    Private Function GetMenuItemsHTML(out As DirectoryHeirarchy, Optional opts As MenuOptions = Nothing)
        If IsNothing(opts) Then
            opts = New MenuOptions
        End If

        Dim copyParentOpts = opts.clone

        'increment the copied menu level, so that children links show up with the correct level
        'necessary for aiding the proper generation of unique HTML element ids
        copyParentOpts.SetMenuLevel(copyParentOpts.GetMenuLevel + 1)

        Dim outputString As String = ""

        If out.dir.Replace(Webicize(APP_PATH_PAGE), "") = "" Then
            outputString = ""
        Else
            'peek ahead and see if "index.aspx" is available in the files...
            'if so, wrap a link around the folder name and delete the index.aspx entry

            Dim FolderLabel As String = ""
            Dim cleanDir = CleanUp(out.dir), cleanParent = CleanUp(opts.GetParentFolder())

            If (InStr(String.Join("", out.FileList), DefaultPage)) Then
                FolderLabel += "<a href='/" + out.dir.Replace(Webicize(APP_PATH), "") + "/" + DefaultPage + "'>" + cleanDir.Substring(0, cleanDir.Length - 1).Replace(cleanParent, "") + "</a>"
                out.FileList = RemoveFile(out.FileList, DefaultPage)

                ReDim Preserve out.FileList(out.FileList.Length - 2)
            Else
                FolderLabel = cleanDir.Substring(0, cleanDir.Length - 1).Replace(cleanParent, "")
            End If

            'outputString = "<li><span class='_folder'>" + FolderLabel.Replace(opts.GetParentFolder(), "") + "</span><ul>"
            outputString = "<li class='_folder'><span>" + FolderLabel + "</span><ul>"
            copyParentOpts.SetParentFolder(out.dir)
        End If

        If out.FileList.Length > 0 Then
            For Each item As String In out.FileList
                Dim anchorString As String = CleanUp(item).Replace(CleanUp(out.dir), "").Replace(CleanUp(opts.GetParentFolder()), "")

                outputString += "<li>" _
                             + "<a id='" + anchorString.Replace("'", "").Replace(" ", "") + "_" + opts.GetMenuLevel.ToString + opts.GetClassName + "' href='/" + out.dir.Replace(Webicize(APP_PATH), "") + item.Replace(out.dir, "").Replace(opts.GetParentFolder(), "") + "'>" _
                             + anchorString _
                             + "</a>" _
                             + "</li>"
            Next

            'outputString += String.Join("</li><li>", out.FileList)) + "</li>"
        End If

        For Each dirChild In out.dirChild
            outputString += GetMenuItemsHTML(dirChild, copyParentOpts)
        Next

        If out.dir.Replace(APP_PATH_PAGE, "") = "" Then
        Else
            outputString += "</ul></li>"
        End If

        'outputString = outputString.Replace(out.dir + "\", "")

        Return outputString
    End Function

    Private Function RemoveFile(ByVal fileList As String(), stringToRemove As String) As String()
        Dim arrayCopy(fileList.Length - 1) As String
        Dim placeholder As Integer = 0

        For i = 0 To fileList.Length - 1
            If fileList(i).Substring(fileList(i).Length - stringToRemove.Length, stringToRemove.Length) = stringToRemove Then

            Else
                arrayCopy(placeholder) = fileList(i)
                placeholder += 1
            End If
        Next
        Return arrayCopy
    End Function

    Private Function GetFolders(ByVal sourcePath As String) As DirectoryHeirarchy
        Dim dirs As String() = Directory.GetDirectories(sourcePath)

        dirs = WebicizeList(dirs)

        Dim dirHeirarchy As New DirectoryHeirarchy(Webicize(sourcePath), dirs.Length)

        For i = 0 To dirs.Length - 1
            dirHeirarchy.SetChild(i, GetFolders(dirs(i) + "/"))
        Next

        dirHeirarchy.FileList = GetFiles(sourcePath)

        Return dirHeirarchy
    End Function

    Private Function GetFiles(ByVal sourcePath As String) As String()
        Dim fileTypePattern = "*.aspx"
        Dim Files As String() = Directory.GetFiles(sourcePath, fileTypePattern)

        Files = WebicizeList(Files)

        Return Files
    End Function

    Private Function WebicizeList(strInput As String()) As String()
        For i = 0 To strInput.Length - 1
            strInput(i) = Webicize(strInput(i))
        Next

        Return strInput
    End Function

    Private Function Webicize(strInput As String) As String
        Dim regexp As New Regex("\\")

        Return regexp.Replace(strInput, "/")
    End Function

    Private Function CleanUp(strInput As String) As String
        'regex to remove extensions from names
        Dim ext As New Regex(GetExtensions)

        'regex to put a space between capital letters
        Dim caps As New Regex("([a-zA-Z])([A-Z])")
        'System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase("this string should be capitalized!")
        'Return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(caps.Replace(ext.Replace(strInput, ""), "$1 $2"))
        Return caps.Replace(ext.Replace(strInput, ""), "$1 $2")
        'Return ext.Replace(strInput, "")
    End Function

    Private Function GetExtensions()
        Return ".aspx"
    End Function

End Class
