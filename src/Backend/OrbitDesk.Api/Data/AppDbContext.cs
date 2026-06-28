using Microsoft.EntityFrameworkCore;
using OrbitDesk.Api.Models;

namespace OrbitDesk.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<OrganizationMember> OrganizationMembers => Set<OrganizationMember>();
    public DbSet<WorkspaceMember> WorkspaceMembers => Set<WorkspaceMember>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<OrganizationMember>()
            .HasKey(x => new { x.OrganizationId, x.UserId });

            modelBuilder.Entity<OrganizationMember>()
                .HasOne(x => x.Organization)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrganizationMember>()
                .HasOne(x => x.User)
                .WithMany(x => x.OrganizationMemberships)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<WorkspaceMember>()
                .HasKey(x => new { x.WorkspaceId, x.UserId });

            modelBuilder.Entity<WorkspaceMember>()
                .HasOne(x => x.Workspace)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WorkspaceMember>()
                .HasOne(x => x.User)
                .WithMany(x => x.WorkspaceMemberships)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Project>()
            .Property(x => x.Budget)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Workspace>()
            .Property(x => x.BudgetCeiling)
            .HasPrecision(18, 2);

        base.OnModelCreating(modelBuilder);
    }
}
