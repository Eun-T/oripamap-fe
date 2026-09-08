const normalizeRole = (role) =>
  String(role || '')
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, '')

const unwrapRoles = (value) => {
  if (Array.isArray(value)) return value.flatMap(unwrapRoles)
  if (value && typeof value === 'object') {
    return unwrapRoles(value.authority ?? value.name ?? value.role ?? value.code ?? value.value)
  }

  const role = normalizeRole(value)
  return role ? [role] : []
}

export const getUserRoles = (user) => {
  if (!user) return []

  return [user.role, user.roles, user.authority, user.authorities, user.userRole]
    .flatMap(unwrapRoles)
    .filter((role, index, roles) => roles.indexOf(role) === index)
}

export const userHasRole = (user, role) => getUserRoles(user).includes(normalizeRole(role))
