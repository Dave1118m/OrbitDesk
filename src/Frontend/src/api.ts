const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'
let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

function buildHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  return headers
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: buildHeaders(init),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function fetchNoContent(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: buildHeaders(init),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `API request failed: ${response.status}`)
  }
}

type User = {
  id: number
  name: string
  email: string
  isActive: boolean
  role: string
}

type Organization = {
  id: number
  name: string
  description: string
  country: string
  registrationNumber: string
  ownerId: number
}

type Workspace = {
  id: number
  name: string
  description: string
  organizationId: number
  budgetCeiling: number
}

type Project = {
  id: number
  title: string
  description: string
  workspaceId: number
  startDate: string
  endDate: string
  budget: number
  status: string
}

type OrganizationMember = {
  organizationId: number
  userId: number
  role: string
}

type WorkspaceMember = {
  workspaceId: number
  userId: number
  role: string
}

type CreateUserRequest = {
  name: string
  email: string
  passwordHash: string
  isActive: boolean
  role: string
}

type UpdateUserRequest = {
  name: string
  email: string
  isActive: boolean
  role: string
}

type CreateOrganizationRequest = {
  name: string
  description: string
  country: string
  registrationNumber: string
  ownerId: number
}

type UpdateOrganizationRequest = CreateOrganizationRequest

type CreateWorkspaceRequest = {
  name: string
  description: string
  organizationId: number
  budgetCeiling: number
}

type UpdateWorkspaceRequest = CreateWorkspaceRequest

type CreateProjectRequest = {
  title: string
  description: string
  workspaceId: number
  startDate: string
  endDate: string
  budget: number
  status: string
}

type UpdateProjectRequest = CreateProjectRequest

type CreateOrganizationMemberRequest = {
  organizationId: number
  userId: number
  role: string
}

type CreateWorkspaceMemberRequest = {
  workspaceId: number
  userId: number
  role: string
}

type LoginRequest = {
  email: string
  password: string
}

type RegisterRequest = {
  name: string
  email: string
  password: string
}

type ResetRequest = {
  email: string
}

type VerifyResetRequest = {
  email: string
  token: string
  password: string
}

type AuthResponse = {
  token: string
  name: string
  email: string
  role: string
}

type MessageResponse = {
  message: string
  token?: string
}

type RemoveOrganizationMemberRequest = {
  organizationId: number
  userId: number
}

type RemoveWorkspaceMemberRequest = {
  workspaceId: number
  userId: number
}

export type {
  User,
  Organization,
  Workspace,
  Project,
  OrganizationMember,
  WorkspaceMember,
  CreateUserRequest,
  UpdateUserRequest,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateOrganizationMemberRequest,
  CreateWorkspaceMemberRequest,
  RemoveOrganizationMemberRequest,
  RemoveWorkspaceMemberRequest,
  LoginRequest,
  RegisterRequest,
  ResetRequest,
  VerifyResetRequest,
  AuthResponse,
  MessageResponse,
}

export function getUsers() {
  return fetchJson<User[]>('/User')
}

export function createUser(request: CreateUserRequest) {
  return fetchJson<User>('/User', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateUser(id: number, request: UpdateUserRequest) {
  return fetchJson<User>(`/User/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteUser(id: number) {
  return fetchNoContent(`/User/${id}`, {
    method: 'DELETE',
  })
}

export function getOrganizations() {
  return fetchJson<Organization[]>('/Organization')
}

export function createOrganization(request: CreateOrganizationRequest) {
  return fetchJson<Organization>('/Organization', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateOrganization(id: number, request: UpdateOrganizationRequest) {
  return fetchJson<Organization>(`/Organization/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteOrganization(id: number) {
  return fetchNoContent(`/Organization/${id}`, {
    method: 'DELETE',
  })
}

export function getWorkspaces() {
  return fetchJson<Workspace[]>('/Workspace')
}

export function createWorkspace(request: CreateWorkspaceRequest) {
  return fetchJson<Workspace>('/Workspace', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateWorkspace(id: number, request: UpdateWorkspaceRequest) {
  return fetchJson<Workspace>(`/Workspace/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteWorkspace(id: number) {
  return fetchNoContent(`/Workspace/${id}`, {
    method: 'DELETE',
  })
}

export function getProjects() {
  return fetchJson<Project[]>('/Project')
}

export function createProject(request: CreateProjectRequest) {
  return fetchJson<Project>('/Project', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateProject(id: number, request: UpdateProjectRequest) {
  return fetchJson<Project>(`/Project/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function loginUser(request: LoginRequest) {
  return fetchJson<AuthResponse>('/Auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function registerUser(request: RegisterRequest) {
  return fetchJson<AuthResponse>('/Auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function resetPasswordRequest(request: ResetRequest) {
  return fetchJson<MessageResponse>('/Auth/reset-request', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function verifyResetPassword(request: VerifyResetRequest) {
  return fetchJson<MessageResponse>('/Auth/reset-verify', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function deleteProject(id: number) {
  return fetchNoContent(`/Project/${id}`, {
    method: 'DELETE',
  })
}

export function getOrganizationMembers() {
  return fetchJson<OrganizationMember[]>('/OrganizationMember')
}

export function createOrganizationMember(request: CreateOrganizationMemberRequest) {
  return fetchJson<OrganizationMember>('/OrganizationMember', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function removeOrganizationMember(request: RemoveOrganizationMemberRequest) {
  return fetchNoContent('/OrganizationMember', {
    method: 'DELETE',
    body: JSON.stringify(request),
  })
}

export function getWorkspaceMembers() {
  return fetchJson<WorkspaceMember[]>('/WorkspaceMember')
}

export function createWorkspaceMember(request: CreateWorkspaceMemberRequest) {
  return fetchJson<WorkspaceMember>('/WorkspaceMember', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function removeWorkspaceMember(request: RemoveWorkspaceMemberRequest) {
  return fetchNoContent('/WorkspaceMember', {
    method: 'DELETE',
    body: JSON.stringify(request),
  })
}
