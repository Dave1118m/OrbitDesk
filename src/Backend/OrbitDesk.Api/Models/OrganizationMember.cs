namespace OrbitDesk.Api.Models;

public class OrganizationMember
{
    public int OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public string Role { get; set; } = "Member";
}
