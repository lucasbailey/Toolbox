Imports System.Security.Cryptography
Imports System.Web.Script.Serialization ''add reference to system.web.extensions to make this available...
Imports System.Net.Sockets
Imports System.Net
Imports System.Text
Imports System.IO
Imports System.Runtime.Serialization
Imports System.Security.Permissions
Imports System.Data
Imports System.Data.SqlClient
Imports System.Threading
Imports Minify
'Imports TcpClient

Public Class TCPServerApp
    Private theOutput As String = ""

    Public _ObjInMemory As New Dictionary(Of String, PayloadContainer) 'the in-memory object we will use to hold our saved objects

    Public Const DEFAULT_IP_ADDRESS As String = "172.16.0.75"
    Public Const DEFAULT_PORT As Long = 60000

    'a list of servers in use
    'basically, a server for every combination of IP address and port
    Private servers As New List(Of TcpListener)

    'a list of all the IP Addresses the app is available
    Private _Address As New List(Of IPAddress)

    'a list of all ports the app is listening to
    Private _Port As New List(Of Long)

    'dictionary of ipaddress strings
    Private _ExternalAddress As New Dictionary(Of String, String)

    'Private Function GetLocalPorts() As List(Of Long)
    '    Return _Port
    'End Function

    Shared Function StringToStream(strInput As String) As MemoryStream
        Dim byteArray As Byte() = Encoding.UTF8.GetBytes(strInput)
        Return New MemoryStream(byteArray)
    End Function

    'a helper class to keep track of connections to a specific machine,
    'regardless of # of ipaddress/ports in use on a machine
    'the idea is that we could help distribute load balancing to other servers
    Public Class ConnectionStatisticsEntry
        Public Property IPAddress As String
        Public Property Port As Long
        Public Property ConnectionDate As DateTime
    End Class

    Public Class ConnectionStatistics
        Public Property Entries As List(Of ConnectionStatisticsEntry)
    End Class

    Private Class Results
        Property StatusCode As Integer
        Property StatusMessage As String

        Private Const SUCCESS_MSG As String = "Success"
        Private Const SUCCESS_CODE As Integer = 1
        Private Const FAIL_CODE As Integer = -1

        Public Sub SetSuccess()
            SetSuccess(SUCCESS_MSG)
        End Sub

        Public Sub SetSuccess(msg As String)
            StatusCode = SUCCESS_CODE
            StatusMessage = msg
        End Sub

        Public Sub SetFailure(FailMessage As String)
            StatusCode = FAIL_CODE
            StatusMessage = FailMessage
        End Sub
    End Class

    Public Class PayloadContainer
        'all requests the server recieves should be in the following payload format...

        Public Class PayloadCommandTypes
            Public Const SQL = "SQL"
            Public Const FILE_PATH = "FILEPATH"

            Public Shared Property AvailOptions As New Dictionary(Of String, String) From _
            {{SQL, "SQL"}, {FILE_PATH, "Load File Path"}}
        End Class

        Public Class PayloadCommands
            Public Const INSERT = "INSERT"
            Public Const DELETE = "DELETE"
            Public Const UPDATE = "UPDATE"
            Public Const RETRIEVE = "RETRIEVE"
            Public Const LOCAL_PORTS = "LOCAL_PORTS"
            Public Const LOCAL_IPADDRESS = "LOCAL_IPADDRESS"
            Public Const REGISTER_ADDRESS = "REGISTER_IPADDRESS"

            Public Shared Property AvailOptions As New Dictionary(Of String, String) From _
            {
                {INSERT, "INSERT"}, {DELETE, "DELETE"}, {UPDATE, "UPDATE"}, {RETRIEVE, "RETRIEVE"},
                {LOCAL_PORTS, "LOCAL PORTS"}, {LOCAL_IPADDRESS, "LOCAL IP ADDRESSES"},
                {REGISTER_ADDRESS, "REGISTER IP ADDRESS"}
            }

        End Class

        Public Class PayloadConnectionStrings
            'Public Shared Property AvailOptions As New Dictionary(Of String, String) From _
            '{{"Server=localhost;Database=Dashboards;User Id=sa;Password=szfzpk501!", "localhost / Dashboards / sa"}, {"Y:\Projects\Toolbox\Toolbox\MinifyConfig\Analytics\analytics.json", "JSON Analytics Minify Config File"}}

        End Class

        Public Command As String 'options are insert, delete, update, retrieve...
        Public CommandType As String 'are SQL, FILEPATHXML, FILEPATHJSON...
        Public Payload As String 'sql command, or a file path to a file needing to be opened

        'the result of running the command and payload...
        'in the case of SQL queries, the result should be serialized to a string
        'before storing it in the result variable
        Public Result As String

        'when running a sql command, this should contain the connection string needed
        'to connect to the database...If loading a file, this should be the fully qualified
        'file path 
        Public ConnectionString As String

        Public Sub New(strCommand As String, strCommandType As String, strPayload As String)
            If (strCommand = "" OrElse strCommandType = "" OrElse strPayload = "") Then
                Throw New Exception("No supplied argument can be a blank string.")
            End If

            Command = strCommand
            CommandType = strCommandType
            Payload = strPayload
        End Sub
        Public Sub New()

        End Sub
    End Class

    Private Class ServerActions
        'Private ObjInMemory As Dictionary(Of String, PayloadContainer)
        Private theCtx As TCPServerApp
        Private serializer As New JavaScriptSerializer()

        Public Sub New(ByRef ctx As TCPServerApp)
            'ObjInMemory = theObjInMemory
            theCtx = ctx
        End Sub

        Private Sub Insert(key As String, objToSave As PayloadContainer)
            If theCtx._ObjInMemory.ContainsKey(key) Then
                Throw New Exception("Key already exists.  Can't insert new instance.")
            End If

            theCtx._ObjInMemory.Add(key, objToSave)
        End Sub

        Private Sub Delete(key As String)
            theCtx._ObjInMemory.Remove(key)
        End Sub

        Private Sub Update(key As String, objToSave As PayloadContainer)
            If Not theCtx._ObjInMemory.ContainsKey(key) Then
                Throw New Exception("Key doesn't exist.  Can't update existing instance.")
            End If

            theCtx._ObjInMemory.Item(key) = objToSave
        End Sub

        Private Function Retrieve(key As String) As PayloadContainer
            If Not theCtx._ObjInMemory.ContainsKey(key) Then
                Throw New Exception("Key doesn't exist.  Can't retrieve existing instance.")
            End If

            Return theCtx._ObjInMemory.Item(key)
        End Function

        Public Function ExecutePayload(ByVal thePayload As PayloadContainer) As Object
            Dim desCrypto As New DESCryptoServiceProvider
            Dim payLoadCom As New PayloadContainer.PayloadCommands

            Dim sha As New SHA1CryptoServiceProvider

            Dim strHash As String = thePayload.Payload
            Dim tempBytAry(strHash.Length) As Byte
            Dim charAry = strHash.ToCharArray

            For i = 0 To charAry.Length - 1
                tempBytAry(i) = Convert.ToByte(charAry(i))
            Next

            Dim key = ASCIIEncoding.ASCII.GetString(sha.ComputeHash(tempBytAry))
            Dim theResult = New Results

            Try
                Select Case thePayload.Command
                    Case PayloadContainer.PayloadCommands.DELETE
                        Delete(key)

                    Case PayloadContainer.PayloadCommands.INSERT
                        'insert into the in-memory object
                        Insert(key, thePayload)

                        'execute the payload and store the results to
                        'the in-memory object
                        ExecuteCommand(thePayload)
                    Case PayloadContainer.PayloadCommands.UPDATE
                        'update the in memory object
                        Update(key, thePayload)

                        'execute the payload and store the results to
                        'the in-memory object
                        ExecuteCommand(thePayload)
                    Case PayloadContainer.PayloadCommands.RETRIEVE

                        'if retrieving, return what the user requested
                        'otherwise, we will return a result object later on
                        Return Retrieve(key)
                    Case PayloadContainer.PayloadCommands.LOCAL_PORTS
                        Dim resultDic As New Dictionary(Of String, Long)

                        For Each item In theCtx._Port
                            resultDic.Add(item.ToString, item)
                        Next

                        thePayload.Result = serializer.Serialize(resultDic)

                        Return thePayload
                    Case PayloadContainer.PayloadCommands.LOCAL_IPADDRESS
                        Dim resultDic As New Dictionary(Of String, String)

                        For Each item As IPAddress In theCtx._Address
                            If Not resultDic.ContainsKey(item.ToString) Then
                                resultDic.Add(item.ToString, item.ToString)
                            End If
                        Next

                        thePayload.Result = serializer.Serialize(resultDic)

                        Return thePayload

                    Case PayloadContainer.PayloadCommands.REGISTER_ADDRESS
                        Dim resultDic As Dictionary(Of String, String) = serializer.Deserialize(Of Dictionary(Of String, String))(thePayload.Payload)

                        'merge the newly added IP address with the existing IP addresses
                        theCtx._ExternalAddress = theCtx._ExternalAddress.Concat(resultDic).Distinct().ToDictionary( _
                            Function(item) item.Key, Function(item) item.Value)
                    Case Else

                End Select
                theResult.SetSuccess()
            Catch ex As Exception
                theResult.SetFailure(ex.Message)
            End Try

            Return theResult
        End Function

        Private Function ExecuteCommand(ByRef payload As PayloadContainer) As Object
            Dim resultObj As Object
            Dim payLoadCont As New PayloadContainer.PayloadCommandTypes

            Select Case payload.CommandType
                Case PayloadContainer.PayloadCommandTypes.SQL
                    resultObj = ExecuteSQL(payload)
                Case PayloadContainer.PayloadCommandTypes.FILE_PATH
                    resultObj = ExecuteFile(payload)
                Case Else
                    Throw New Exception("Unknown Command")

            End Select

            Return resultObj
        End Function

        Private Function ExecuteSQL(ByRef payload As PayloadContainer) As Object
            Return LoadQuery(payload)
        End Function

        Private Function ExecuteFile(ByRef payload As PayloadContainer) As Object
            Return LoadFile(payload)
        End Function

        Private Function LoadFile(ByRef payload As PayloadContainer) As Object
            Dim serializer As New JavaScriptSerializer()
            Dim min As New Minify.Minify

            Dim theFile As String = File.ReadAllText(payload.Payload)

            'attempt to deminify the file,
            'if no config info is available, skip the step
            Try
                theFile = min.DeMinify(payload.Payload, payload.ConnectionString)
            Catch ex As Exception

            End Try

            payload.Result = theFile
            Return payload.Result
        End Function

        Private Function LoadQuery(ByRef payload As PayloadContainer) As Object
            Dim dbConn = New SqlConnection(payload.ConnectionString)
            dbConn.Open()

            ' Create a SqlCommand object and pass the constructor the connection string and the query string.
            Dim sqlQuery As New SqlCommand(payload.Payload, dbConn)

            ' Use the above SqlCommand object to create a SqlDataReader object.
            Dim queryCommandReader As SqlDataReader = sqlQuery.ExecuteReader()

            ' Create a DataTable object to hold all the data returned by the query.
            Dim dt As New DataTable()

            ' Use the DataTable.Load(SqlDataReader) function to put the results of the query into a DataTable.
            dt.Load(queryCommandReader)

            Dim serializer As New JavaScriptSerializer()

            Dim list = New List(Of Dictionary(Of String, Object))

            For Each dr As DataRow In dt.Rows

                Dim dict = New Dictionary(Of String, Object)

                For Each col As DataColumn In dt.Columns
                    dict(col.ColumnName) = dr(col)
                Next
                list.Add(dict)
            Next

            payload.Result = serializer.Serialize(list)
            dbConn.Close()

            Return payload.Result
        End Function
    End Class

    Sub New()
        createTheServer()
    End Sub

    Sub New(ByVal theIPAddressString As List(Of String))
        createTheServer(theIPAddressString)
    End Sub

    Sub New(ByVal thePort As List(Of Long))
        createTheServer(Nothing, thePort)
    End Sub

    Sub New(ByVal theIPAddressString As List(Of String), ByVal thePort As List(Of Long))
        createTheServer(theIPAddressString, thePort)
    End Sub

    Private Sub createTheServer(Optional ByVal theIPAddressString As List(Of String) = Nothing, _
                                Optional ByVal thePort As List(Of Long) = Nothing)

        If IsNothing(theIPAddressString) Then
            theIPAddressString = New List(Of String) From {DEFAULT_IP_ADDRESS}
        End If

        If IsNothing(thePort) Then
            thePort = New List(Of Long) From {DEFAULT_PORT}
        End If

        For Each address In theIPAddressString
            For Each port In thePort

                _Address.Add(IPAddress.Parse(address))
                _Port.Add(port)

                servers.Add(New TcpListener(_Address.Item(_Address.Count - 1), _Port.Item(_Port.Count - 1)))
            Next
        Next
    End Sub

    Public Sub StopServer()
        For Each server In servers
            server.Stop()
        Next
    End Sub



    Async Function MainAsync() As Task

        Console.WriteLine("Starting...")

        For Each server In servers
            server.Start()
        Next

        'start all servers/ports listening
        For Each server In servers
            Console.WriteLine("Started.")
            'While (True)
            StartListening(server)
        Next

    End Function

    Private Sub StartListening(server As TcpListener)
        server.BeginAcceptTcpClient(New AsyncCallback(AddressOf AwaitAsync), server)
    End Sub


    Private Async Sub AwaitAsync(ByVal ar As IAsyncResult)
        Dim server = DirectCast(ar.AsyncState, TcpListener)
        Dim client = server.EndAcceptTcpClient(ar)
        Dim cw = New ClientWorking(client, True, _ObjInMemory, Me)

        'maybe a better way to do this???
        ''todo: get rid of green squigglies
        Await cw.Communicate()

        'restart the current server
        StartListening(server)
    End Sub


    Private Class ClientWorking

        Dim _client As TcpClient
        Dim _ownsClient As Boolean
        Dim _objInMemory As Dictionary(Of String, PayloadContainer)
        Dim _ctx As TCPServerApp


        Sub New(client As TcpClient, ownsClient As Boolean, ByRef objInMemory As Dictionary(Of String, PayloadContainer), ByRef ctx As TCPServerApp)
            _objInMemory = objInMemory
            _client = client
            _ownsClient = ownsClient
            _ctx = ctx
        End Sub

        Public Async Function Communicate() As Task
            Try
                Dim stream As NetworkStream = _client.GetStream()
                Using stream
                    Dim sr = New StreamReader(stream)
                    Using sr
                        Dim sw = New StreamWriter(stream)
                        Using sw
                            Dim data As String = Await sr.ReadLineAsync().ConfigureAwait(False)

                            'While Not (data.Equals("exit", StringComparison.OrdinalIgnoreCase))
                            Dim dataResult = ExecuteCommands(data)

                            Await sw.WriteLineAsync(dataResult).ConfigureAwait(False)
                            Await sw.FlushAsync().ConfigureAwait(False)
                            'End While
                        End Using

                    End Using
                End Using
            Catch

            Finally
                If (_ownsClient And Not IsNothing(_client)) Then
                    DirectCast(_client, IDisposable).Dispose()
                    _client = Nothing
                End If
            End Try

        End Function

        Private Function ExecuteCommands(ByVal data As String) As String
            Dim thePayloadContainer As PayloadContainer
            Dim serializer As New JavaScriptSerializer()

            thePayloadContainer = serializer.Deserialize(Of PayloadContainer)(data)

            Dim theServerAction As New ServerActions(_ctx)

            Dim theResult = theServerAction.ExecutePayload(thePayloadContainer)

            'theResult will either be of the class..
            '     1. "Results" or...
            '     2. "PayloadContainer"

            Dim res As String

            If theResult.GetType = GetType(Results) Then
                res = DirectCast(theResult, Results).StatusMessage
            Else
                res = theResult.result.ToString
            End If

            Return res
        End Function
        Function StreamToString(stream As NetworkStream) As String
            Dim reader As System.IO.StreamReader
            Dim cmd As String

            reader = New System.IO.StreamReader(stream)

            'each payload container should be sent as a single line
            cmd = reader.ReadLine()  'Reading the client sent the command

            Return cmd
        End Function
    End Class
End Class
