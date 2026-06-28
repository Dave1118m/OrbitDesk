using System.ComponentModel.DataAnnotations;

namespace OrbitDesk.Api.Dto;

public record WorkspaceResponse(int Id, string Name, string Description, int OrganizationId, decimal? BudgetCeiling);

public class CreateWorkspaceRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int OrganizationId { get; set; }

    public decimal? BudgetCeiling { get; set; }
}

public class UpdateWorkspaceRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int OrganizationId { get; set; }

    public decimal? BudgetCeiling { get; set; }
}