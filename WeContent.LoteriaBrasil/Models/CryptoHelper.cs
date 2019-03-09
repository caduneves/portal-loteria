using System;
using System.IO;
using System.Security.Cryptography;

class CryptoHelper
{

    public static string Decrypt(string input)
    {
        string password = "6cd5a6e4-d41c-469f-2195-74ffabf4d601";
        byte[] inputAsByteArray;
        string plaintext = null;
        try
        {
            inputAsByteArray = Convert.FromBase64String(input);

            byte[] Salt = new byte[32];
            byte[] IV = new byte[16];
            byte[] Encoded = new byte[inputAsByteArray.Length - Salt.Length - IV.Length];

            Array.Copy(inputAsByteArray, 0, Salt, 0, Salt.Length);
            Array.Copy(inputAsByteArray, Salt.Length, IV, 0, IV.Length);
            Array.Copy(inputAsByteArray, Salt.Length + IV.Length, Encoded, 0, Encoded.Length);

            byte[] Key = CreateKey(password, Salt);

            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Key;
                aesAlg.IV = IV;
                aesAlg.Mode = CipherMode.CBC;
                aesAlg.Padding = PaddingMode.PKCS7;

                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                using (var msDecrypt = new MemoryStream(Encoded))
                {
                    using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (var srDecrypt = new StreamReader(csDecrypt))
                        {
                            plaintext = srDecrypt.ReadToEnd();
                        }
                    }
                }
            }

            return plaintext;
        }
        catch (Exception)
        {
            return null;
        }
    }

    private static byte[] CreateKey(string password, byte[] salt)
    {
        int iterations = 1000;
        using (var rfc2898DeriveBytes = new Rfc2898DeriveBytes(password, salt, iterations))
            return rfc2898DeriveBytes.GetBytes(32);
    }

    private static byte[] GetSalt()
    {
        var salt = new byte[32];
        using (var random = new RNGCryptoServiceProvider())
        {
            random.GetNonZeroBytes(salt);
        }

        return salt;
    }
}