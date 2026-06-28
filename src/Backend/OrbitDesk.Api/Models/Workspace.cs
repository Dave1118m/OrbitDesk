namespace OrbitDesk.Api.Models;

public class Workspace
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int OrganizationId { get; set; }
    public Organization? Organization { get; set; }
    public decimal? BudgetCeiling { get; set; }

    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<WorkspaceMember> Members { get; set; } = new List<WorkspaceMember>();
}
