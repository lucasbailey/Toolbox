Imports System.Net.Sockets
Imports TCPServerApp.TCPServerApp

Public Class TCPClientApp
    Dim theArgs As String()

    Public Sub New(args As String())
        theArgs = args
    End Sub

    Public Function ExecuteCommand(ipaddress As String, port As UShort) As String
        Dim consoleString As String = ""
        Dim client As TcpClient = Nothing

        Dim strHost As String = ipaddress
        Dim uiPort As UShort = port

        Dim strCmd As String 'The definition of the command line
        strCmd = String.Format("{0}", theArgs(0), Environment.NewLine)

        'consoleString += "Initialize the client..." & System.Environment.NewLine

        Try
            client = New TcpClient(strHost, uiPort)
        Catch e As Exception
            'consoleString += "Cannot connect to the server！" & System.Environment.NewLine

            Return consoleString
            Exit Function
        End Try

        'Initialize the network input and output stream
        Dim ns As NetworkStream = client.GetStream()
        Dim sr As New System.IO.StreamReader(ns)

        Dim result As String
        'consoleString += strCmd & System.Environment.NewLine

        Dim cmd As Byte() = System.Text.Encoding.UTF8.GetBytes(strCmd.ToCharArray())

        'Send the request instruction communication
        ns.Write(cmd, 0, cmd.Length)

        'Get feedback server
        'consoleString += "Results for the: " & System.Environment.NewLine

        While True
            'Receiving results
            result = sr.ReadLine()
            If result = "" Then
                Exit While
            End If
            consoleString += result & System.Environment.NewLine
        End While

        'consoleString += "Connection Closed..." & System.Environment.NewLine

        'Disconnect
        client.Close()

        Return consoleString
    End Function

    Public Function ExecuteCommand() As String
        Return ExecuteCommand(TCPServerApp.TCPServerApp.DEFAULT_IP_ADDRESS, TCPServerApp.TCPServerApp.DEFAULT_PORT)
    End Function

    Public Function ExecuteCommand(ipaddress As String) As String
        Return ExecuteCommand(ipaddress, TCPServerApp.TCPServerApp.DEFAULT_PORT)
    End Function

    Public Function ExecuteCommand(port As Long) As String
        Return ExecuteCommand(TCPServerApp.TCPServerApp.DEFAULT_IP_ADDRESS, port)
    End Function
End Class