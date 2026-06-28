using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrbitDesk.Api.Data;
using OrbitDesk.Api.Dto;
using OrbitDesk.Api.Models;

namespace OrbitDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkspaceController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkspaceController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkspaceResponse>>> GetAll()
    {
        var workspaces = await _db.Workspaces
            .AsNoTracking()
            .Select(w => new WorkspaceResponse(w.Id, w.Name, w.Description, w.OrganizationId, w.BudgetCeiling))
            .ToListAsync();

        return Ok(workspaces);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkspaceResponse>> Get(int id)
    {
        var workspace = await _db.Workspaces
            .AsNoTracking()
            .Where(w => w.Id == id)
            .Select(w => new WorkspaceResponse(w.Id, w.Name, w.Description, w.OrganizationId, w.BudgetCeiling))
            .FirstOrDefaultAsync();

        return workspace is null ? NotFound() : Ok(workspace);
    }

    [HttpPost]
    public async Task<ActionResult<WorkspaceResponse>> Create(CreateWorkspaceRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var organization = await _db.Organizations.FindAsync(request.OrganizationId);
        if (organization is null)
            return BadRequest(new { message = "Organization does not exist." });

        var workspace = new Workspace
        {
            Name = request.Name,
            Description = request.Description,
            OrganizationId = request.OrganizationId,
            BudgetCeiling = request.BudgetCeiling
        };

        _db.Workspaces.Add(workspace);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = workspace.Id }, new WorkspaceResponse(workspace.Id, workspace.Name, workspace.Description, workspace.OrganizationId, workspace.BudgetCeiling));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WorkspaceResponse>> Update(int id, UpdateWorkspaceRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var workspace = await _db.Workspaces.FindAsync(id);
        if (workspace is null)
            return NotFound();

        var organization = await _db.Organizations.FindAsync(request.OrganizationId);
        if (organization is null)
            return BadRequest(new { message = "Organization does not exist." });

        workspace.Name = request.Name;
        workspace.Description = request.Description;
        workspace.OrganizationId = request.OrganizationId;
        workspace.BudgetCeiling = request.BudgetCeiling;

        await _db.SaveChangesAsync();

        return Ok(new WorkspaceResponse(workspace.Id, workspace.Name, workspace.Description, workspace.OrganizationId, workspace.BudgetCeiling));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var workspace = await _db.Workspaces.FindAsync(id);
        if (workspace is null)
            return NotFound();

        _db.Workspaces.Remove(workspace);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}