import { type FormEvent, useEffect, useMemo, useState } from 'react'
import {
  createOrganization,
  createOrganizationMember,
  createProject,
  createUser,
  createWorkspace,
  createWorkspaceMember,
  deleteOrganization,
  deleteProject,
  deleteUser,
  deleteWorkspace,
  getOrganizationMembers,
  getOrganizations,
  getProjects,
  getUsers,
  getWorkspaceMembers,
  getWorkspaces,
  loginUser,
  registerUser,
  resetPasswordRequest,
  setAuthToken,
  verifyResetPassword,
  oauthGoogle,
  oauthGitHub,
  removeOrganizationMember,
  removeWorkspaceMember,
  updateOrganization,
  updateProject,
  updateUser,
  updateWorkspace,
  type CreateOrganizationMemberRequest,
  type CreateOrganizationRequest,
  type CreateProjectRequest,
  type CreateUserRequest,
  type CreateWorkspaceMemberRequest,
  type CreateWorkspaceRequest,
  type AuthResponse,
  type Organization,
  type OrganizationMember,
  type Project,
  type User,
  type Workspace,
  type WorkspaceMember,
  type UpdateOrganizationRequest,
  type UpdateProjectRequest,
  type UpdateUserRequest,
  type UpdateWorkspaceRequest,
} from './api'
import './App.css'

type Tab = 'overview' | 'users' | 'organizations' | 'workspaces' | 'projects' | 'organizationMembers' | 'workspaceMembers'

type AuthView = 'login' | 'register' | 'resetRequest' | 'resetVerify'

type LoginForm = {
  email: string
  password: string
  rememberMe: boolean
}

type RegisterForm = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

type ResetRequestForm = {
  email: string
}

type ResetVerifyForm = {
  email: string
  token: string
  password: string
  confirmPassword: string
}

type UserForm = CreateUserRequest & { password: string }

type OrganizationForm = CreateOrganizationRequest

type WorkspaceForm = CreateWorkspaceRequest

type ProjectForm = CreateProjectRequest

type OrganizationMemberForm = CreateOrganizationMemberRequest

type WorkspaceMemberForm = CreateWorkspaceMemberRequest

const defaultUserForm: UserForm = {
  name: '',
  email: '',
  password: '',
  passwordHash: '',
  isActive: true,
  role: 'Member',
}

const defaultOrganizationForm: OrganizationForm = {
  name: '',
  description: '',
  country: '',
  registrationNumber: '',
  ownerId: 0,
}

const defaultWorkspaceForm: WorkspaceForm = {
  name: '',
  description: '',
  organizationId: 0,
  budgetCeiling: 0,
}

const defaultProjectForm: ProjectForm = {
  title: '',
  description: '',
  workspaceId: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  budget: 0,
  status: 'Planned',
}

const defaultOrganizationMemberForm: OrganizationMemberForm = {
  organizationId: 0,
  userId: 0,
  role: 'Member',
}

const defaultWorkspaceMemberForm: WorkspaceMemberForm = {
  workspaceId: 0,
  userId: 0,
  role: 'Member',
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [authView, setAuthView] = useState<AuthView>('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthResponse | null>(null)

  const toggleSidebar = () => setSidebarCollapsed((s) => !s)

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [users, setUsers] = useState<User[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([])
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '', rememberMe: false })
  const [registerForm, setRegisterForm] = useState<RegisterForm>({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [resetRequestForm, setResetRequestForm] = useState<ResetRequestForm>({ email: '' })
  const [resetVerifyForm, setResetVerifyForm] = useState<ResetVerifyForm>({ email: '', token: '', password: '', confirmPassword: '' })
  const [passwordStrength, setPasswordStrength] = useState('')

  const [userForm, setUserForm] = useState<UserForm>(defaultUserForm)
  const [organizationForm, setOrganizationForm] = useState<OrganizationForm>(defaultOrganizationForm)
  const [workspaceForm, setWorkspaceForm] = useState<WorkspaceForm>(defaultWorkspaceForm)
  const [projectForm, setProjectForm] = useState<ProjectForm>(defaultProjectForm)
  const [organizationMemberForm, setOrganizationMemberForm] = useState<OrganizationMemberForm>(defaultOrganizationMemberForm)
  const [workspaceMemberForm, setWorkspaceMemberForm] = useState<WorkspaceMemberForm>(defaultWorkspaceMemberForm)

  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editingOrganizationId, setEditingOrganizationId] = useState<number | null>(null)
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<number | null>(null)
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null)

  const refreshAll = async () => {
    try {
      setLoading(true)
      const [usersData, organizationsData, workspacesData, projectsData, orgMembersData, workspaceMembersData] = await Promise.all([
        getUsers(),
        getOrganizations(),
        getWorkspaces(),
        getProjects(),
        getOrganizationMembers(),
        getWorkspaceMembers(),
      ])
      setUsers(usersData)
      setOrganizations(organizationsData)
      setWorkspaces(workspacesData)
      setProjects(projectsData)
      setOrganizationMembers(orgMembersData)
      setWorkspaceMembers(workspaceMembersData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('orbitdesk_token')
    const storedUser = localStorage.getItem('orbitdesk_user')

    if (storedToken) {
      setAuthToken(storedToken)
      setIsAuthenticated(true)
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser) as AuthResponse)
      }

      refreshAll().catch((err) => setError((err as Error).message))
    }
  }, [])

  const dashboardSummary = useMemo(
    () => [
      { label: 'Users', value: users.length },
      { label: 'Organizations', value: organizations.length },
      { label: 'Workspaces', value: workspaces.length },
      { label: 'Projects', value: projects.length },
      { label: 'Org members', value: organizationMembers.length },
      { label: 'Workspace members', value: workspaceMembers.length },
    ],
    [users, organizations, workspaces, projects, organizationMembers, workspaceMembers],
  )

  const resetMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const resetAuthMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const switchAuthView = (view: AuthView) => {
    resetAuthMessages()
    setPasswordStrength('')
    setAuthView(view)

    if (view === 'login') {
      setLoginForm({ email: '', password: '', rememberMe: false })
    }

    if (view === 'register') {
      setRegisterForm({ fullName: '', email: '', password: '', confirmPassword: '' })
    }

    if (view === 'resetRequest') {
      setResetRequestForm({ email: '' })
    }

    if (view === 'resetVerify') {
      setResetVerifyForm({ email: resetRequestForm.email, token: '', password: '', confirmPassword: '' })
    }
  }

  const saveSession = (auth: AuthResponse) => {
    localStorage.setItem('orbitdesk_token', auth.token)
    localStorage.setItem('orbitdesk_user', JSON.stringify({ name: auth.name, email: auth.email, role: auth.role }))
    setAuthToken(auth.token)
    setIsAuthenticated(true)
    setCurrentUser(auth)
  }

  const clearSession = () => {
    localStorage.removeItem('orbitdesk_token')
    localStorage.removeItem('orbitdesk_user')
    setAuthToken(null)
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  const handleLogout = () => {
    resetMessages()
    clearSession()
    setActiveTab('overview')
  }

  const getPasswordStrength = (value: string) => {
    const tests = [/[A-Z]/, /[0-9]/, /[!@#$%^&*(),.?":{}|<>]/, /.{10,}/]
    const passed = tests.filter((test) => test.test(value)).length
    if (!value) return ''
    if (passed <= 1) return 'Weak'
    if (passed === 2) return 'Fair'
    if (passed === 3) return 'Good'
    return 'Strong'
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetAuthMessages()

    if (!registerForm.fullName || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const strength = getPasswordStrength(registerForm.password)
    if (strength === 'Weak' || strength === 'Fair') {
      setError('Choose a stronger password with uppercase letters, numbers, and symbols.')
      return
    }

    try {
      const auth = await registerUser({
        name: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
      })

      saveSession(auth)
      setSuccess('Registration successful. Welcome aboard.')
      await refreshAll()
      setActiveTab('overview')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetAuthMessages()

    if (!loginForm.email || !loginForm.password) {
      setError('Email and password are required.')
      return
    }

    try {
      const auth = await loginUser({
        email: loginForm.email,
        password: loginForm.password,
      })

      saveSession(auth)
      setSuccess('Login successful.')
      await refreshAll()
      setActiveTab('overview')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleResetRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetAuthMessages()

    if (!resetRequestForm.email) {
      setError('Enter your email address.')
      return
    }

    try {
      const response = await resetPasswordRequest({ email: resetRequestForm.email })
      setSuccess(response.token ? `Password reset token: ${response.token}` : 'Password reset email sent. Check your inbox.')
      switchAuthView('resetVerify')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleResetVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetAuthMessages()

    if (!resetVerifyForm.email || !resetVerifyForm.token || !resetVerifyForm.password || !resetVerifyForm.confirmPassword) {
      setError('Complete all reset fields.')
      return
    }

    if (resetVerifyForm.password !== resetVerifyForm.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (getPasswordStrength(resetVerifyForm.password) === 'Weak' || getPasswordStrength(resetVerifyForm.password) === 'Fair') {
      setError('Use a stronger password for security.')
      return
    }

    try {
      await verifyResetPassword({
        email: resetVerifyForm.email,
        token: resetVerifyForm.token,
        password: resetVerifyForm.password,
      })

      setSuccess('Password reset successful. Please log in.')
      setAuthView('login')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleGoogleOAuth = async () => {
    try {
      resetAuthMessages()
      // In production, use Google SDK to get the actual token
      // For now, use a placeholder token - in real implementation you'd use @react-oauth/google
      const googleUser = {
        email: 'user@gmail.com',
        name: 'Google User',
        idToken: 'placeholder-google-token'
      }
      
      const auth = await oauthGoogle(googleUser)
      saveSession(auth)
      setSuccess('Google login successful.')
      await refreshAll()
      setActiveTab('overview')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleGitHubOAuth = async () => {
    try {
      resetAuthMessages()
      // In production, use GitHub SDK to get the actual token
      // For now, use a placeholder token
      const githubUser = {
        email: 'user@github.com',
        name: 'GitHub User',
        idToken: 'placeholder-github-token'
      }
      
      const auth = await oauthGitHub(githubUser)
      saveSession(auth)
      setSuccess('GitHub login successful.')
      await refreshAll()
      setActiveTab('overview')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const resetUserForm = () => {
    setEditingUserId(null)
    setUserForm(defaultUserForm)
  }

  const resetOrganizationForm = () => {
    setEditingOrganizationId(null)
    setOrganizationForm(defaultOrganizationForm)
  }

  const resetWorkspaceForm = () => {
    setEditingWorkspaceId(null)
    setWorkspaceForm(defaultWorkspaceForm)
  }

  const resetProjectForm = () => {
    setEditingProjectId(null)
    setProjectForm(defaultProjectForm)
  }

  const handleSubmitUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    try {
      if (!userForm.name || !userForm.email || !userForm.role) {
        throw new Error('Name, email, and role are required.')
      }

      if (editingUserId) {
        const payload: UpdateUserRequest = {
          name: userForm.name,
          email: userForm.email,
          isActive: userForm.isActive,
          role: userForm.role,
        }
        await updateUser(editingUserId, payload)
        setSuccess('User updated successfully.')
      } else {
        if (!userForm.password) {
          throw new Error('Password is required for new users.')
        }
        const payload: CreateUserRequest = {
          name: userForm.name,
          email: userForm.email,
          passwordHash: userForm.password,
          isActive: userForm.isActive,
          role: userForm.role,
        }
        await createUser(payload)
        setSuccess('User created successfully.')
      }

      await refreshAll()
      resetUserForm()
      setActiveTab('users')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleEditUser = (user: User) => {
    resetMessages()
    setEditingUserId(user.id)
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      passwordHash: '',
      isActive: user.isActive,
      role: user.role,
    })
    setActiveTab('users')
  }

  const handleDeleteUser = async (id: number) => {
    resetMessages()
    try {
      await deleteUser(id)
      setSuccess('User deleted successfully.')
      setUsers((current) => current.filter((user) => user.id !== id))
      if (editingUserId === id) resetUserForm()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSubmitOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    try {
      if (!organizationForm.ownerId) {
        throw new Error('Select an owner for the organization.')
      }
      if (editingOrganizationId) {
        const payload: UpdateOrganizationRequest = { ...organizationForm }
        await updateOrganization(editingOrganizationId, payload)
        setSuccess('Organization updated successfully.')
      } else {
        await createOrganization(organizationForm)
        setSuccess('Organization created successfully.')
      }

      await refreshAll()
      resetOrganizationForm()
      setActiveTab('organizations')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleEditOrganization = (organization: Organization) => {
    resetMessages()
    setEditingOrganizationId(organization.id)
    setOrganizationForm({
      name: organization.name,
      description: organization.description,
      country: organization.country,
      registrationNumber: organization.registrationNumber,
      ownerId: organization.ownerId,
    })
    setActiveTab('organizations')
  }

  const handleDeleteOrganization = async (id: number) => {
    resetMessages()
    try {
      await deleteOrganization(id)
      setSuccess('Organization deleted successfully.')
      setOrganizations((current) => current.filter((item) => item.id !== id))
      if (editingOrganizationId === id) resetOrganizationForm()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSubmitWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    try {
      if (!workspaceForm.organizationId) {
        throw new Error('Select an organization for the workspace.')
      }
      if (editingWorkspaceId) {
        const payload: UpdateWorkspaceRequest = { ...workspaceForm }
        await updateWorkspace(editingWorkspaceId, payload)
        setSuccess('Workspace updated successfully.')
      } else {
        await createWorkspace(workspaceForm)
        setSuccess('Workspace created successfully.')
      }

      await refreshAll()
      resetWorkspaceForm()
      setActiveTab('workspaces')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleEditWorkspace = (workspace: Workspace) => {
    resetMessages()
    setEditingWorkspaceId(workspace.id)
    setWorkspaceForm({
      name: workspace.name,
      description: workspace.description,
      organizationId: workspace.organizationId,
      budgetCeiling: workspace.budgetCeiling,
    })
    setActiveTab('workspaces')
  }

  const handleDeleteWorkspace = async (id: number) => {
    resetMessages()
    try {
      await deleteWorkspace(id)
      setSuccess('Workspace deleted successfully.')
      setWorkspaces((current) => current.filter((item) => item.id !== id))
      if (editingWorkspaceId === id) resetWorkspaceForm()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSubmitProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    try {
      if (!projectForm.workspaceId) {
        throw new Error('Select a workspace for the project.')
      }
      if (projectForm.endDate < projectForm.startDate) {
        throw new Error('Project end date must be after the start date.')
      }
      if (editingProjectId) {
        const payload: UpdateProjectRequest = { ...projectForm }
        await updateProject(editingProjectId, payload)
        setSuccess('Project updated successfully.')
      } else {
        await createProject(projectForm)
        setSuccess('Project created successfully.')
      }

      await refreshAll()
      resetProjectForm()
      setActiveTab('projects')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleEditProject = (project: Project) => {
    resetMessages()
    setEditingProjectId(project.id)
    setProjectForm({
      title: project.title,
      description: project.description,
      workspaceId: project.workspaceId,
      startDate: project.startDate.slice(0, 10),
      endDate: project.endDate.slice(0, 10),
      budget: project.budget,
      status: project.status,
    })
    setActiveTab('projects')
  }

  const handleDeleteProject = async (id: number) => {
    resetMessages()
    try {
      await deleteProject(id)
      setSuccess('Project deleted successfully.')
      setProjects((current) => current.filter((item) => item.id !== id))
      if (editingProjectId === id) resetProjectForm()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSubmitOrganizationMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    try {
      await createOrganizationMember(organizationMemberForm)
      setSuccess('Organization member added successfully.')
      setOrganizationMemberForm(defaultOrganizationMemberForm)
      const members = await getOrganizationMembers()
      setOrganizationMembers(members)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleRemoveOrganizationMember = async (organizationId: number, userId: number) => {
    resetMessages()

    try {
      await removeOrganizationMember({ organizationId, userId })
      setSuccess('Organization member removed successfully.')
      setOrganizationMembers((current) => current.filter((member) => !(member.organizationId === organizationId && member.userId === userId)))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSubmitWorkspaceMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    try {
      await createWorkspaceMember(workspaceMemberForm)
      setSuccess('Workspace member added successfully.')
      setWorkspaceMemberForm(defaultWorkspaceMemberForm)
      const members = await getWorkspaceMembers()
      setWorkspaceMembers(members)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleRemoveWorkspaceMember = async (workspaceId: number, userId: number) => {
    resetMessages()

    try {
      await removeWorkspaceMember({ workspaceId, userId })
      setSuccess('Workspace member removed successfully.')
      setWorkspaceMembers((current) => current.filter((member) => !(member.workspaceId === workspaceId && member.userId === userId)))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const getUserName = (userId: number) => users.find((user) => user.id === userId)?.name ?? `User ${userId}`
  const getOrganizationName = (id: number) => organizations.find((item) => item.id === id)?.name ?? `Org ${id}`
  const getWorkspaceName = (id: number) => workspaces.find((item) => item.id === id)?.name ?? `Workspace ${id}`

  if (!isAuthenticated) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="auth-header">
            <p className="eyebrow">OrbitDesk</p>
            <h1>
              {authView === 'login'
                ? 'Welcome back'
                : authView === 'register'
                ? 'Create your account'
                : authView === 'resetRequest'
                ? 'Reset your password'
                : 'Verify your reset'}
            </h1>
            <p className="intro">A modern workspace system for NGOs, teams, and enterprise projects.</p>
          </div>

          {error ? <div className="banner error">{error}</div> : null}
          {success ? <div className="banner success">{success}</div> : null}

          {authView === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                Email address
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                  required
                  aria-label="Email address"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  required
                  aria-label="Password"
                />
              </label>
              <div className="auth-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={loginForm.rememberMe}
                    onChange={(event) => setLoginForm({ ...loginForm, rememberMe: event.target.checked })}
                  />
                  Remember me
                </label>
                <button type="button" className="auth-link" onClick={() => switchAuthView('resetRequest')}>
                  Forgot password?
                </button>
              </div>
              <button type="submit" className="primary-button auth-primary">
                Login
              </button>
              <div className="auth-divider"><span>or continue with</span></div>
              <div className="social-buttons">
                <button type="button" className="social-button google" onClick={handleGoogleOAuth}>Continue with Google</button>
                <button type="button" className="social-button github" onClick={handleGitHubOAuth}>Continue with GitHub</button>
              </div>
              <div className="auth-footer">
                New here? <button type="button" className="auth-link" onClick={() => switchAuthView('register')}>Register</button>
              </div>
            </form>
          ) : authView === 'register' ? (
            <form className="auth-form" onSubmit={handleRegister}>
              <label>
                Full name
                <input
                  type="text"
                  value={registerForm.fullName}
                  onChange={(event) => setRegisterForm({ ...registerForm, fullName: event.target.value })}
                  required
                  aria-label="Full name"
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                  required
                  aria-label="Email address"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => {
                    setRegisterForm({ ...registerForm, password: event.target.value })
                    setPasswordStrength(getPasswordStrength(event.target.value))
                  }}
                  required
                  aria-label="Password"
                />
              </label>
              <div className="password-strength">Strength: {passwordStrength || 'Enter a password'}</div>
              <label>
                Confirm password
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(event) => setRegisterForm({ ...registerForm, confirmPassword: event.target.value })}
                  required
                  aria-label="Confirm password"
                />
              </label>
              <button type="submit" className="primary-button auth-primary">
                Register
              </button>
              <div className="auth-divider"><span>or continue with</span></div>
              <div className="social-buttons">
                <button type="button" className="social-button google" onClick={handleGoogleOAuth}>Continue with Google</button>
                <button type="button" className="social-button github" onClick={handleGitHubOAuth}>Continue with GitHub</button>
              </div>
              <div className="auth-footer">
                Already have an account? <button type="button" className="auth-link" onClick={() => switchAuthView('login')}>Login</button>
              </div>
            </form>
          ) : authView === 'resetRequest' ? (
            <form className="auth-form" onSubmit={handleResetRequest}>
              <label>
                Email address
                <input
                  type="email"
                  value={resetRequestForm.email}
                  onChange={(event) => setResetRequestForm({ ...resetRequestForm, email: event.target.value })}
                  required
                  aria-label="Email address"
                />
              </label>
              <button type="submit" className="primary-button auth-primary">
                Send reset link
              </button>
              <div className="auth-divider"><span>or</span></div>
              <div className="auth-footer">
                Remembered your password? <button type="button" className="auth-link" onClick={() => switchAuthView('login')}>Login</button>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetVerify}>
              <label>
                Email address
                <input
                  type="email"
                  value={resetVerifyForm.email}
                  onChange={(event) => setResetVerifyForm({ ...resetVerifyForm, email: event.target.value })}
                  required
                  aria-label="Email address"
                />
              </label>
              <label>
                Verification code
                <input
                  type="text"
                  value={resetVerifyForm.token}
                  onChange={(event) => setResetVerifyForm({ ...resetVerifyForm, token: event.target.value })}
                  required
                  aria-label="Verification code"
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  value={resetVerifyForm.password}
                  onChange={(event) => {
                    setResetVerifyForm({ ...resetVerifyForm, password: event.target.value })
                    setPasswordStrength(getPasswordStrength(event.target.value))
                  }}
                  required
                  aria-label="New password"
                />
              </label>
              <div className="password-strength">Strength: {passwordStrength || 'Enter a password'}</div>
              <label>
                Confirm new password
                <input
                  type="password"
                  value={resetVerifyForm.confirmPassword}
                  onChange={(event) => setResetVerifyForm({ ...resetVerifyForm, confirmPassword: event.target.value })}
                  required
                  aria-label="Confirm new password"
                />
              </label>
              <button type="submit" className="primary-button auth-primary">
                Reset password
              </button>
              <div className="auth-divider"><span>or</span></div>
              <div className="auth-footer">
                Back to <button type="button" className="auth-link" onClick={() => switchAuthView('login')}>Login</button>
              </div>
            </form>
          )}
        </section>
      </main>
    )
  }

  return (
    <div className="layout">
      <aside className={sidebarCollapsed ? 'sidebar collapsed' : 'sidebar'}>
        <div className="brand">OrbitDesk</div>
        <button type="button" className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          {sidebarCollapsed ? '»' : '«'}
        </button>
        <nav role="navigation" aria-label="Main features">
          {(['overview', 'users', 'organizations', 'workspaces', 'projects', 'organizationMembers', 'workspaceMembers'] as Tab[]).map((tab) => (
            <button key={tab} type="button" className={`nav-item ${tab === activeTab ? 'active' : ''}`} onClick={() => { resetMessages(); setActiveTab(tab) }}>
              {tab === 'overview'
                ? 'Overview'
                : tab === 'organizationMembers'
                ? 'Org members'
                : tab === 'workspaceMembers'
                ? 'Workspace members'
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">OrbitDesk</p>
          <h1>Workspace operations manager</h1>
          <p className="intro">
            Manage users, organizations, hierarchy, members, and projects from a single product interface.
          </p>
        </div>
        <div className="header-actions">
          {currentUser ? (
            <>
              <span className="user-pill">{currentUser.name}</span>
              <button type="button" className="secondary-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : null}
        </div>
        <nav className="tabs" aria-label="Primary navigation">
          {(['overview', 'users', 'organizations', 'workspaces', 'projects', 'organizationMembers', 'workspaceMembers'] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={tab === activeTab ? 'tab active' : 'tab'}
              onClick={() => {
                resetMessages()
                setActiveTab(tab)
              }}
            >
              {tab === 'overview'
                ? 'Overview'
                : tab === 'organizationMembers'
                ? 'Org members'
                : tab === 'workspaceMembers'
                ? 'Workspace members'
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      {error ? <section className="banner error">{error}</section> : null}
      {success ? <section className="banner success">{success}</section> : null}
      {loading ? <section className="banner">Loading data...</section> : null}

      {activeTab === 'overview' ? (
        <section className="grid-row">
          <section className="panel">
            <h2>Summary</h2>
            <div className="dashboard-grid">
              {dashboardSummary.map((item) => (
                <div key={item.label} className="metric">
                  <span>{item.value}</span>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Organizations</h2>
            <ul>
              {organizations.slice(0, 4).map((organization) => (
                <li key={organization.id}>
                  <strong>{organization.name}</strong>
                  <span>{organization.country}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Workspaces</h2>
            <ul>
              {workspaces.slice(0, 4).map((workspace) => (
                <li key={workspace.id}>
                  <strong>{workspace.name}</strong>
                  <span>{getOrganizationName(workspace.organizationId)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Projects</h2>
            <ul>
              {projects.slice(0, 4).map((project) => (
                <li key={project.id}>
                  <strong>{project.title}</strong>
                  <span>{project.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </section>
      ) : activeTab === 'users' ? (
        <section className="entity-page">
          <div className="entity-panel">
            <h2>{editingUserId ? 'Edit user' : 'Create user'}</h2>
            <form onSubmit={handleSubmitUser}>
              <label>
                Name
                <input type="text" value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} required />
              </label>
              <label>
                Email
                <input type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required />
              </label>
              {!editingUserId ? (
                <label>
                  Password
                  <input type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} required />
                </label>
              ) : null}
              <label>
                Role
                <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })} required>
                  <option>Member</option>
                  <option>Admin</option>
                  <option>Owner</option>
                </select>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={userForm.isActive} onChange={(event) => setUserForm({ ...userForm, isActive: event.target.checked })} />
                Active user
              </label>
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  {editingUserId ? 'Save user' : 'Create user'}
                </button>
                {editingUserId ? (
                  <button type="button" className="secondary-button" onClick={resetUserForm}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <section className="entity-list">
            <h2>Users</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="entity-actions">
                      <button type="button" onClick={() => handleEditUser(user)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteUser(user.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>
      ) : activeTab === 'organizations' ? (
        <section className="entity-page">
          <div className="entity-panel">
            <h2>{editingOrganizationId ? 'Edit organization' : 'Create organization'}</h2>
            <form onSubmit={handleSubmitOrganization}>
              <label>
                Name
                <input type="text" value={organizationForm.name} onChange={(event) => setOrganizationForm({ ...organizationForm, name: event.target.value })} required />
              </label>
              <label>
                Description
                <textarea value={organizationForm.description} onChange={(event) => setOrganizationForm({ ...organizationForm, description: event.target.value })} required />
              </label>
              <label>
                Country
                <input type="text" value={organizationForm.country} onChange={(event) => setOrganizationForm({ ...organizationForm, country: event.target.value })} required />
              </label>
              <label>
                Registration number
                <input type="text" value={organizationForm.registrationNumber} onChange={(event) => setOrganizationForm({ ...organizationForm, registrationNumber: event.target.value })} required />
              </label>
              <label>
                Owner
                <select value={organizationForm.ownerId} onChange={(event) => setOrganizationForm({ ...organizationForm, ownerId: Number(event.target.value) })} required>
                  <option value={0}>Select owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  {editingOrganizationId ? 'Save organization' : 'Create organization'}
                </button>
                {editingOrganizationId ? (
                  <button type="button" className="secondary-button" onClick={resetOrganizationForm}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <section className="entity-list">
            <h2>Organizations</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Country</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((organization) => (
                  <tr key={organization.id}>
                    <td>{organization.name}</td>
                    <td>{organization.country}</td>
                    <td>{getUserName(organization.ownerId)}</td>
                    <td className="entity-actions">
                      <button type="button" onClick={() => handleEditOrganization(organization)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteOrganization(organization.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>
      ) : activeTab === 'workspaces' ? (
        <section className="entity-page">
          <div className="entity-panel">
            <h2>{editingWorkspaceId ? 'Edit workspace' : 'Create workspace'}</h2>
            <form onSubmit={handleSubmitWorkspace}>
              <label>
                Name
                <input type="text" value={workspaceForm.name} onChange={(event) => setWorkspaceForm({ ...workspaceForm, name: event.target.value })} required />
              </label>
              <label>
                Description
                <textarea value={workspaceForm.description} onChange={(event) => setWorkspaceForm({ ...workspaceForm, description: event.target.value })} required />
              </label>
              <label>
                Organization
                <select value={workspaceForm.organizationId} onChange={(event) => setWorkspaceForm({ ...workspaceForm, organizationId: Number(event.target.value) })} required>
                  <option value={0}>Select organization</option>
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Budget ceiling
                <input type="number" value={workspaceForm.budgetCeiling} onChange={(event) => setWorkspaceForm({ ...workspaceForm, budgetCeiling: Number(event.target.value) })} required />
              </label>
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  {editingWorkspaceId ? 'Save workspace' : 'Create workspace'}
                </button>
                {editingWorkspaceId ? (
                  <button type="button" className="secondary-button" onClick={resetWorkspaceForm}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <section className="entity-list">
            <h2>Workspaces</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Organization</th>
                  <th>Budget</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((workspace) => (
                  <tr key={workspace.id}>
                    <td>{workspace.name}</td>
                    <td>{getOrganizationName(workspace.organizationId)}</td>
                    <td>${workspace.budgetCeiling}</td>
                    <td className="entity-actions">
                      <button type="button" onClick={() => handleEditWorkspace(workspace)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteWorkspace(workspace.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>
      ) : activeTab === 'projects' ? (
        <section className="entity-page">
          <div className="entity-panel">
            <h2>{editingProjectId ? 'Edit project' : 'Create project'}</h2>
            <form onSubmit={handleSubmitProject}>
              <label>
                Title
                <input type="text" value={projectForm.title} onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })} required />
              </label>
              <label>
                Description
                <textarea value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} required />
              </label>
              <label>
                Workspace
                <select value={projectForm.workspaceId} onChange={(event) => setProjectForm({ ...projectForm, workspaceId: Number(event.target.value) })} required>
                  <option value={0}>Select workspace</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid-2">
                <label>
                  Start date
                  <input type="date" value={projectForm.startDate} onChange={(event) => setProjectForm({ ...projectForm, startDate: event.target.value })} required />
                </label>
                <label>
                  End date
                  <input type="date" value={projectForm.endDate} onChange={(event) => setProjectForm({ ...projectForm, endDate: event.target.value })} required />
                </label>
              </div>
              <label>
                Budget
                <input type="number" value={projectForm.budget} onChange={(event) => setProjectForm({ ...projectForm, budget: Number(event.target.value) })} required />
              </label>
              <label>
                Status
                <select value={projectForm.status} onChange={(event) => setProjectForm({ ...projectForm, status: event.target.value })} required>
                  <option>Planned</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>On hold</option>
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  {editingProjectId ? 'Save project' : 'Create project'}
                </button>
                {editingProjectId ? (
                  <button type="button" className="secondary-button" onClick={resetProjectForm}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <section className="entity-list">
            <h2>Projects</h2>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Workspace</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.title}</td>
                    <td>{getWorkspaceName(project.workspaceId)}</td>
                    <td>{project.status}</td>
                    <td className="entity-actions">
                      <button type="button" onClick={() => handleEditProject(project)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteProject(project.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>
      ) : activeTab === 'organizationMembers' ? (
        <section className="entity-page">
          <div className="entity-panel">
            <h2>Add organization member</h2>
            <form onSubmit={handleSubmitOrganizationMember}>
              <label>
                Organization
                <select value={organizationMemberForm.organizationId} onChange={(event) => setOrganizationMemberForm({ ...organizationMemberForm, organizationId: Number(event.target.value) })} required>
                  <option value={0}>Select organization</option>
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                User
                <select value={organizationMemberForm.userId} onChange={(event) => setOrganizationMemberForm({ ...organizationMemberForm, userId: Number(event.target.value) })} required>
                  <option value={0}>Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Role
                <select value={organizationMemberForm.role} onChange={(event) => setOrganizationMemberForm({ ...organizationMemberForm, role: event.target.value })} required>
                  <option>Member</option>
                  <option>Admin</option>
                  <option>Owner</option>
                </select>
              </label>
              <button type="submit" className="primary-button">
                Add member
              </button>
            </form>
          </div>

          <section className="entity-list">
            <h2>Organization members</h2>
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizationMembers.map((member) => (
                  <tr key={`${member.organizationId}-${member.userId}`}>
                    <td>{getOrganizationName(member.organizationId)}</td>
                    <td>{getUserName(member.userId)}</td>
                    <td>{member.role}</td>
                    <td className="entity-actions">
                      <button type="button" onClick={() => handleRemoveOrganizationMember(member.organizationId, member.userId)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>
      ) : (
        <section className="entity-page">
          <div className="entity-panel">
            <h2>Add workspace member</h2>
            <form onSubmit={handleSubmitWorkspaceMember}>
              <label>
                Workspace
                <select value={workspaceMemberForm.workspaceId} onChange={(event) => setWorkspaceMemberForm({ ...workspaceMemberForm, workspaceId: Number(event.target.value) })} required>
                  <option value={0}>Select workspace</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                User
                <select value={workspaceMemberForm.userId} onChange={(event) => setWorkspaceMemberForm({ ...workspaceMemberForm, userId: Number(event.target.value) })} required>
                  <option value={0}>Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Role
                <select value={workspaceMemberForm.role} onChange={(event) => setWorkspaceMemberForm({ ...workspaceMemberForm, role: event.target.value })} required>
                  <option>Member</option>
                  <option>Admin</option>
                  <option>Owner</option>
                </select>
              </label>
              <button type="submit" className="primary-button">
                Add member
              </button>
            </form>
          </div>

          <section className="entity-list">
            <h2>Workspace members</h2>
            <table>
              <thead>
                <tr>
                  <th>Workspace</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workspaceMembers.map((member) => (
                  <tr key={`${member.workspaceId}-${member.userId}`}>
                    <td>{getWorkspaceName(member.workspaceId)}</td>
                    <td>{getUserName(member.userId)}</td>
                    <td>{member.role}</td>
                    <td className="entity-actions">
                      <button type="button" onClick={() => handleRemoveWorkspaceMember(member.workspaceId, member.userId)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>
      )}
      </main>
    </div>
  )
}

export default App
