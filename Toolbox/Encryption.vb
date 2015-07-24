Imports System.IO
Imports System.Security
Imports System.Security.Cryptography

Public Class Encryption
    Private SECRET_KEY As String = ";LKAOAIMF9083MC9MNPWAECNasnoi0943nj09f-nmao9[0i32"
    Private TripleDes As New TripleDESCryptoServiceProvider


    Public Class EncryptionResult
        Private _datTime As DateTime
        Private _PublicKey As String

        Public Sub New()
            _datTime = Now
            _PublicKey = ""
        End Sub

        Public Sub New(datTime As DateTime, PubKey As String)
            _datTime = datTime
            _PublicKey = PubKey
        End Sub

        Public Function GetKey() As String
            Return _PublicKey
        End Function

        Public Function GetDate() As DateTime
            Return _datTime
        End Function
    End Class

    Public Function GetPublicHash() As String
        Dim er As EncryptionResult = GeneratePublicKey()

        'force the ticks to a fixed width
        Dim theTicks As String = er.GetDate.Ticks.ToString.PadLeft(32, "0")


        Return EncryptData(theTicks & er.GetKey)
    End Function

    Private Function GeneratePublicKey() As EncryptionResult
        Dim convertDate As Date = Convert.ToDateTime(Format(Now(), "MM/dd/yyyy HH:mm:ss"))

        Return GeneratePublicKey(convertDate)
    End Function

    Private Function GeneratePublicKey(DateAndTime As DateTime) As EncryptionResult
        Dim desCrypto As New DESCryptoServiceProvider

        Dim datTim As DateTime = DateAndTime
        Dim sha As New SHA1CryptoServiceProvider

        Dim strHash As String = SECRET_KEY & datTim.ToFileTimeUtc
        Dim tempBytAry(strHash.Length) As Byte
        Dim charAry = strHash.ToCharArray

        For i = 0 To charAry.Length - 1
            tempBytAry(i) = Convert.ToByte(charAry(i))
        Next

        Dim er As New EncryptionResult(datTim, ASCIIEncoding.ASCII.GetString(sha.ComputeHash(tempBytAry)))

        Return er
    End Function

    ''' <summary>
    ''' Takes a supplied encrypted key and breaks it down to determine if it is valid
    ''' </summary>
    ''' <returns>True if the supplied arguments are valid, false if not</returns>
    ''' <remarks></remarks>
    Public Function VerifyKey(EncryptedKey As String) As Boolean
        'The public key is an encrypted string that consists of:
        'the time the key was generated (in ticks)
        'the generated hash...
        'the ticks are the first 32 characters in the decryptd string
        'the hash is everything after that

        Const BEGIN_DATE_TIME_MARKER As Integer = 0
        Const END_DATE_TIME_MARKER As Integer = 32

        'first decrypt the string
        Dim dec = DecryptData(EncryptedKey)

        Dim DateAndTime As DateTime = New Date(Convert.ToDouble(dec.Substring(BEGIN_DATE_TIME_MARKER, END_DATE_TIME_MARKER)))
        Dim PublicKey As String = dec.Substring(END_DATE_TIME_MARKER, dec.Length - END_DATE_TIME_MARKER)

        Return VerifyKey(PublicKey, DateAndTime)

    End Function

    Private Function VerifyKey(ByVal PublicKey As String, DateAndTime As DateTime) As Boolean
        Dim sha As New SHA1CryptoServiceProvider

        'ensure that someone can't try to verify a key that
        'wasn't generated in the current or previous 2 hours
        If DateDiff(DateInterval.Hour, DateAndTime, Now()) > 2 Then
            Return False
        Else
            Dim pk As EncryptionResult = GeneratePublicKey(DateAndTime)

            'compare the supplied key against the generated one...
            If (pk.GetKey = PublicKey) Then
                Return True
            Else
                Return False
            End If
        End If
    End Function

    Private Function EncryptData(ByVal plaintext As String) As String

        ' Convert the plaintext string to a byte array. 
        Dim plaintextBytes() As Byte =
            System.Text.Encoding.Unicode.GetBytes(plaintext)

        ' Create the stream. 
        Dim ms As New System.IO.MemoryStream
        ' Create the encoder to write to the stream. 
        Dim encStream As New CryptoStream(ms, TripleDes.CreateEncryptor(), System.Security.Cryptography.CryptoStreamMode.Write)

        ' Use the crypto stream to write the byte array to the stream.
        encStream.Write(plaintextBytes, 0, plaintextBytes.Length)
        encStream.FlushFinalBlock()

        ' Convert the encrypted stream to a printable string. 
        Return Convert.ToBase64String(ms.ToArray)
    End Function

    Private Function DecryptData(ByVal encryptedtext As String) As String

        ' Convert the encrypted text string to a byte array. 
        Dim encryptedBytes() As Byte = Convert.FromBase64String(encryptedtext)

        ' Create the stream. 
        Dim ms As New System.IO.MemoryStream
        ' Create the decoder to write to the stream. 
        Dim decStream As New CryptoStream(ms, TripleDes.CreateDecryptor(), System.Security.Cryptography.CryptoStreamMode.Write)

        ' Use the crypto stream to write the byte array to the stream.
        decStream.Write(encryptedBytes, 0, encryptedBytes.Length)
        decStream.FlushFinalBlock()

        ' Convert the plaintext stream to a string. 
        Return System.Text.Encoding.Unicode.GetString(ms.ToArray)
    End Function

    'Private Function TruncateHash(ByVal key As String,ByVal length As Integer) As Byte()

    '    Dim sha1 As New SHA1CryptoServiceProvider

    '    ' Hash the key. 
    '    Dim keyBytes() As Byte =
    '        System.Text.Encoding.Unicode.GetBytes(key)
    '    Dim hash() As Byte = sha1.ComputeHash(keyBytes)

    '    ' Truncate or pad the hash. 
    '    ReDim Preserve hash(length - 1)
    '    Return hash
    'End Function
End Class
