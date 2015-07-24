Imports System
Imports System.Collections.Generic
Imports System.ComponentModel
Imports System.Text
Imports System.Web
Imports System.Web.UI
Imports System.Web.UI.WebControls
Imports System.Text.RegularExpressions
Imports System.IO


<DefaultProperty("Path"), ToolboxData("<{0}:Tab runat=server></{0}:Tab>")>
Public Class Tab
    Inherits Label


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

    Protected Overrides Sub RenderContents(ByVal output As HtmlTextWriter)
        Dim tempPath = "<div id=""" & Me.ID.ToString.ToLower & """ class=""tabContainer"" runat=""server"">" _
                     & GetHTMLTab(Path, FileName) _
                     & "</div>"


        output.Write(tempPath)
    End Sub


    Private Function GetHTMLTab(ByVal tabPath As String, ByVal pagePath As String)
        Dim regexp As New Regex("\..{0,}$")

        Dim FileName = regexp.Replace(pagePath, "")
        'Match(pagePath).ToString

        Dim theTabPath = "Tab" & FileName & "\" & tabPath & ".tab"
        Dim AppPath = AppDomain.CurrentDomain.BaseDirectory

        Dim output As String = File.ReadAllText(AppPath & theTabPath)

        Return output
    End Function

End Class
