using System.Security.Cryptography;

namespace OrbitDesk.Api.Security;

public static class PasswordHasher
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 100_000;
    private const char Separator = ':';

    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        var key = pbkdf2.GetBytes(KeySize);

        return string.Join(Separator, Convert.ToBase64String(salt), Convert.ToBase64String(key), Iterations);
    }

    public static bool Verify(string password, string hash)
    {
        if (string.IsNullOrWhiteSpace(hash))
            return false;

        var parts = hash.Split(Separator);
        if (parts.Length != 3)
            return false;

        var salt = Convert.FromBase64String(parts[0]);
        var key = Convert.FromBase64String(parts[1]);
        var iterations = int.Parse(parts[2]);

        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
        var attemptedKey = pbkdf2.GetBytes(key.Length);

        return CryptographicOperations.FixedTimeEquals(attemptedKey, key);
    }
}
