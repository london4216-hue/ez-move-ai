/**
 * Standardized user context for routing guards and portal loading.
 * Reads from the existing AuthContext — no extra API calls.
 *
 * Returns:
 *   user          - raw user object (or null)
 *   authStatus    - "authenticated" | "anonymous"
 *   role          - "super_admin" | "broker" | "agent" | "user" | null
 *   isLoading     - true while auth state is resolving
 */
import { useAuth } from './AuthContext';
import { getPortalRole } from './usePortalRole';

export function useUserContext() {
  const { user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  return {
    user,
    authStatus: isAuthenticated ? "authenticated" : "anonymous",
    role: getPortalRole(user),
    isLoading: isLoadingAuth || isLoadingPublicSettings,
  };
}