Imports System.Web.Services
Imports System.Web.Services.Protocols
Imports System.ComponentModel
Imports System.Web.Script.Serialization
Imports System.IO
Imports System.Web.Script.Services
Imports System.Reflection
Imports Minify

' To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line.
<System.Web.Script.Services.ScriptService()> _
<System.Web.Services.WebService(Namespace:="http://localhost.org/")> _
<System.Web.Services.WebServiceBinding(ConformsTo:=WsiProfiles.BasicProfile1_1)> _
<ToolboxItem(False)> _
Public Class WebAnalytics
    Inherits System.Web.Services.WebService

    Const ANALYTICS_BASE_PATH As String = "Analytics\"
    Const ANALYTICS_FILE_PATH As String = ANALYTICS_BASE_PATH + "analytics.json"

    ReadOnly APP_PATH = AppDomain.CurrentDomain.BaseDirectory
    ReadOnly APP_PATH_PAGE = APP_PATH + "Pages\"
    ReadOnly APP_PATH_CONFIG = APP_PATH + "Config\"

    Private Class AnalyticsSearch
        Private _AnalyticsList As AnalyticsList
        Private _AnalyticsDictionary As New Dictionary(Of String, Dictionary(Of String, AnalyticsList))


        Sub New(aList As AnalyticsList)
            _AnalyticsList = aList

            Dim pType = (New Analytics).GetType().GetFields

            For Each typeObj As FieldInfo In pType
                _AnalyticsDictionary.Add(typeObj.Name, New Dictionary(Of String, AnalyticsList))
            Next

            For Each analyzeItem As Analytics In _AnalyticsList.AnalyticsAry
                For Each typeObj As FieldInfo In analyzeItem.GetType().GetFields
                    Dim itemValue As String = analyzeItem.GetType().GetField(typeObj.Name).GetValue(analyzeItem).ToString

                    If (_AnalyticsDictionary.Item(typeObj.Name).ContainsKey(itemValue)) Then
                        'key exists, so just add the item
                        _AnalyticsDictionary.Item(typeObj.Name).Item(itemValue).append(analyzeItem)
                    Else
                        'create the key
                        _AnalyticsDictionary.Item(typeObj.Name).Add(itemValue, New AnalyticsList)

                        'now add the item to the list
                        _AnalyticsDictionary.Item(typeObj.Name).Item(itemValue).append(analyzeItem)
                    End If


                Next
            Next

        End Sub

        Public Function Search(keyvalueDictionary As Dictionary(Of String, String)) As AnalyticsList
            Dim output As New AnalyticsList

            For Each key As String In keyvalueDictionary.Keys
                If _AnalyticsDictionary.Item(key).ContainsKey(keyvalueDictionary.Item(key)) Then
                    output.merge(_AnalyticsDictionary.Item(key).Item(keyvalueDictionary.Item(key)))
                End If
            Next

            Return output
        End Function
    End Class

    Private Class Analytics
        Public ServerDateTimeEntry As Date 'date/time of event being logged as specified by the server
        Public ClientDateTimeEntry As Date 'date/time of event taking place as specified by the user's javascript
        Public ElementName As String 'html element type...div, span, body, etc...
        Public ElementID As String 'html ID of the element, blank if no ID is specified in html
        Public ElementInnerHTML As String 'inner html of the element causing event
        Public Action As String 'javascript event 
        Public URL As String 'the url of the page being analyzed, may or may not include any GET parameters
        Public Params As String 'GET/POST parameters of URL
        'Public EncryptedKey As String 'an encrypted string we will use to verify that the source sending the analytics data is a verified source

        Sub New()
            ElementName = ""
            ElementID = ""
            ElementInnerHTML = ""
            Action = ""
            URL = ""
            Params = ""
        End Sub

        Sub New(jsonString)
            Dim serializer As New JavaScriptSerializer()
            Dim obj As Analytics = serializer.Deserialize(Of Analytics)(jsonString)

            'maybe we can come up w/ a generic way to do this?
            'and automatically use the json object to initialize the
            'current instance?

            ElementName = obj.ElementName
            ElementID = obj.ElementID
            ElementInnerHTML = obj.ElementInnerHTML
            Action = obj.Action
            URL = obj.URL
            Params = obj.Params
            ClientDateTimeEntry = obj.ClientDateTimeEntry

            ServerDateTimeEntry = Now()

        End Sub

    End Class

    Private Class AnalyticsList
        Public AnalyticsAry As New List(Of Analytics)

        Public Sub New()

        End Sub

        Public Sub New(jsonString As String)
            Dim serializer As New JavaScriptSerializer()

            Dim aList As AnalyticsList = serializer.Deserialize(Of AnalyticsList)(jsonString)
            AnalyticsAry = aList.AnalyticsAry
        End Sub

        Public Function append(entry As Analytics) As AnalyticsList
            AnalyticsAry.Add(entry)

            Return Me
        End Function

        Public Function append(jsonEntry As String) As AnalyticsList
            Dim serializer As New JavaScriptSerializer()

            AnalyticsAry.Add(serializer.Deserialize(Of Analytics)(jsonEntry))

            Return Me
        End Function

        Public Function merge(aList As AnalyticsList)
            For Each item As Analytics In aList.AnalyticsAry
                'ensure we update the server time of the user supplied item...
                item.ServerDateTimeEntry = Now()

                Me.append(item)
            Next

            Return Me
        End Function

        Public Function toJsonString() As String
            Dim serializer As New JavaScriptSerializer()

            Return serializer.Serialize(Me)
        End Function
    End Class

    <WebMethod()> _
    <ScriptMethod()> _
    Public Function AnalyticsEntry(jsonString As String) As String
        Dim newEntry As New Analytics(jsonString)

        Dim analyticsPath = APP_PATH + ANALYTICS_FILE_PATH
        Dim serializer As New JavaScriptSerializer()

        TestCreateAnalyticsFile(analyticsPath)

        Dim analyst As AnalyticsList = serializer.Deserialize(Of AnalyticsList)(DeMinify())

        'in case the analytics file is empty
        If IsNothing(analyst) Then
            analyst = New AnalyticsList
        End If

        analyst.append(newEntry)

        Minify(analyticsPath, serializer.Serialize(analyst))

        Return ""
    End Function

    <WebMethod()> _
    Public Function AnalyticsEntryArray(jsonString As String) As String
        Dim serializer As New JavaScriptSerializer()
        Dim analyticsPath = APP_PATH + ANALYTICS_FILE_PATH

        TestCreateAnalyticsFile(analyticsPath)

        Dim newList As AnalyticsList = serializer.Deserialize(Of AnalyticsList)(jsonString)
        Dim curList As AnalyticsList = serializer.Deserialize(Of AnalyticsList)(DeMinify())

        'in case the analytics file is empty
        If IsNothing(curList) Then
            curList = New AnalyticsList
        End If

        curList.merge(newList)

        Minify(analyticsPath, serializer.Serialize(curList))
        Return ""
    End Function

    ''' <summary>
    ''' Returns a basic json string of the Analytics class.  Call this on the client to get an always up-to-date version of the base class
    ''' </summary>
    ''' <returns>JSON string representation of an empty Analytics class</returns>
    ''' <remarks></remarks>
    <WebMethod()> _
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)> _
    Public Function GetBaseAnalyticsObj() 'As String
        Dim obj As New Analytics()
        Dim serializer As New JavaScriptSerializer()

        Return obj 'serializer.Serialize(obj)
    End Function

    ''' <summary>
    ''' Returns a JSON string of stored analytics data based on the supplied JSON string of desired key value pairs
    ''' </summary>
    ''' <param name="keyValueJSON">a json string of keys with matching values</param>
    ''' <returns>returns json string of all analytics based on the desired key/values</returns>
    ''' <remarks></remarks>
    <WebMethod()> _
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)> _
    Public Function GetAnalytics(keyValueJSON As String) As String
        Dim serializer As New JavaScriptSerializer()

        Dim keyValues As Dictionary(Of String, String) = serializer.Deserialize(Of Dictionary(Of String, String))(keyValueJSON)

        Dim analyticsPath = APP_PATH + ANALYTICS_FILE_PATH

        Dim AnalyticsAry = serializer.Deserialize(Of AnalyticsList)(String.Join("", DeMinify(analyticsPath)))
        Dim newSearch As New AnalyticsSearch(AnalyticsAry)


        Dim searchOutput = newSearch.Search(keyValues)


        Return serializer.Serialize(searchOutput)
    End Function

    ''' <summary>
    ''' Creates the analytics file if it doesn't already exist
    ''' </summary>
    ''' <param name="analyticsPath"></param>
    ''' <remarks></remarks>
    Sub TestCreateAnalyticsFile(analyticsPath As String)
        If (Not File.Exists(analyticsPath)) Then
            File.WriteAllText(analyticsPath, "")
        Else
            'todo: remove code that deletes the analytics file in production environment
            'delete and recreate the file
            If DateDiff(DateInterval.Day, File.GetLastWriteTime(analyticsPath), Now()) > 7 Then
                File.Delete(analyticsPath)
                File.WriteAllText(analyticsPath, "")
            End If
        End If
    End Sub

    Private Sub Minify(analyticsPath As String, strToSave As String)
        Dim min As New Minify.Minify

        'File.WriteAllText(analyticsPath, strToSave)

        min.Minify(ANALYTICS_FILE_PATH)
    End Sub

    Private Function DeMinify() As String
        Dim min As New Minify.Minify

        Return min.DeMinify(ANALYTICS_FILE_PATH)
    End Function

End Class