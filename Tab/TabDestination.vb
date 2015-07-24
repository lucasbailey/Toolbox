Imports System
Imports System.Collections.Generic
Imports System.ComponentModel
Imports System.Text
Imports System.Web
Imports System.Web.UI
Imports System.Web.UI.WebControls
Imports System.Text.RegularExpressions
Imports System.IO


<DefaultProperty("Path"), ToolboxData("<{0}:TabDestination runat=server></{0}:TabDestination>")>
Public Class TabDestination
    Inherits Panel


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

    Protected Overrides Sub RenderContents(ByVal output As HtmlTextWriter)
        Dim tempPath = "<div id=""tabSwapContainer"">" _
                     & "<div class=""tabData""></div>" _
                     & "</div>"

        output.Write(tempPath)
    End Sub


   
End Class
