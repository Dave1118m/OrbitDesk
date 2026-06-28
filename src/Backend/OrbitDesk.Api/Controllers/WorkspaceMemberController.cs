using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrbitDesk.Api.Data;
using OrbitDesk.Api.Dto;
using OrbitDesk.Api.Models;

namespace OrbitDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkspaceMemberController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkspaceMemberController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkspaceMemberResponse>>> GetAll()
    {
        var members = await _db.WorkspaceMembers
            .AsNoTracking()
            .Select(m => new WorkspaceMemberResponse(m.WorkspaceId, m.UserId, m.Role))
            .ToListAsync();

        return Ok(members);
    }

    [HttpPost]
    public async Task<ActionResult<WorkspaceMemberResponse>> Create(CreateWorkspaceMemberRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var workspace = await _db.Workspaces.FindAsync(request.WorkspaceId);
        if (workspace is null)
            return BadRequest(new { message = "Workspace does not exist." });

        var user = await _db.Users.FindAsync(request.UserId);
        if (user is null)
            return BadRequest(new { message = "User does not exist." });

        var exists = await _db.WorkspaceMembers.AnyAsync(m => m.WorkspaceId == request.WorkspaceId && m.UserId == request.UserId);
        if (exists)
            return Conflict(new { message = "User is already a member of the workspace." });

        var member = new WorkspaceMember
        {
            WorkspaceId = request.WorkspaceId,
            UserId = request.UserId,
            Role = request.Role
        };

        _db.WorkspaceMembers.Add(member);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { workspaceId = member.WorkspaceId, userId = member.UserId }, new WorkspaceMemberResponse(member.WorkspaceId, member.UserId, member.Role));
    }

    [HttpDelete]
    public async Task<IActionResult> Remove([FromBody] RemoveWorkspaceMemberRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var member = await _db.WorkspaceMembers.FindAsync(request.WorkspaceId, request.UserId);
        if (member is null)
            return NotFound();

        _db.WorkspaceMembers.Remove(member);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}