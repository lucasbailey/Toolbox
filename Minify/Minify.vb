Imports System.IO
Imports System.Web.Script.Serialization

Public Class Minify

    ReadOnly APP_PATH = AppDomain.CurrentDomain.BaseDirectory
    ReadOnly APP_PATH_MINIFY_CONFIG = APP_PATH + "MinifyConfig\"

    Public Sub Minify(BasePath As String, FileToMinifyPath As String)
        Dim serializer As New JavaScriptSerializer()

        'read the config file
        Dim ConfigFileToDeMinify = File.ReadAllText(APP_PATH_MINIFY_CONFIG + FileToMinifyPath)

        'prep the config dictionary
        Dim ConfigDictionary As Dictionary(Of String, String) = serializer.Deserialize(Of Dictionary(Of String, String))(ConfigFileToDeMinify)

        'load the file to minify
        Dim FileToMinify = File.ReadAllText(BasePath + FileToMinifyPath)

        For Each key In ConfigDictionary.Keys
            FileToMinify = FileToMinify.Replace(key, ConfigDictionary.Item(key))
        Next

        File.WriteAllText(BasePath + FileToMinifyPath, FileToMinify)
    End Sub


    ''' <summary>
    ''' Takes a fully qualified path to the file being minified, or a relative path if the default app path is desired.  The default app path is assumed.  Do not use this if the file being minified is not part of the App's path.
    ''' </summary>
    ''' <param name="FileToMinifyPath"></param>
    ''' <remarks></remarks>
    Public Sub Minify(FileToMinifyPath As String)
        Minify(APP_PATH, FileToMinifyPath.Replace(APP_PATH, ""))
    End Sub

    Public Function DeMinify(FileToMinifyPath As String) As String
        Return DeMinify(FileToMinifyPath, APP_PATH_MINIFY_CONFIG + FileToMinifyPath)
    End Function

    Public Function DeMinify(FileToMinifyPath As String, ConfigAppPath As String) As String
        Dim serializer As New JavaScriptSerializer()

        'read the config file
        Dim ConfigFileToDeMinify = String.Join("", File.ReadAllText(ConfigAppPath))

        'prep the config dictionary
        Dim ConfigDictionary As Dictionary(Of String, String) = serializer.Deserialize(Of Dictionary(Of String, String))(ConfigFileToDeMinify)

        'load the file to de-minify
        Dim FileToDeMinify = File.ReadAllText(FileToMinifyPath)

        For Each key In ConfigDictionary.Keys
            FileToDeMinify = FileToDeMinify.Replace(ConfigDictionary.Item(key), key)
        Next

        'File.WriteAllText(APP_PATH_MINIFY_CONFIG + "test.json", FileToDeMinify)

        Return FileToDeMinify
    End Function

End Class
