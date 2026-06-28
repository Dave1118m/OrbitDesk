namespace OrbitDesk.Api.Models;

public class Organization
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public int OwnerId { get; set; }
    public User? Owner { get; set; }

    public ICollection<Workspace> Workspaces { get; set; } = new List<Workspace>();
    public ICollection<OrganizationMember> Members { get; set; } = new List<OrganizationMember>();
}
