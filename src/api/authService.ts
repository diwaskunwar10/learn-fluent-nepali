
import { UserData, LoginResponse } from "../types/User";
import { BaseService } from "./baseService";
import { ApiCallbacks } from "./httpBase";

/**
 * Authentication service
 */
class AuthService extends BaseService {
  /**
   * Validate tenant by slug
   * @param slug The tenant slug to validate
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with boolean indicating if tenant is valid
   */
  async validateTenant(
    slug: string,
    callbacks?: ApiCallbacks<{ tenant_id: string }>
  ): Promise<boolean> {
    try {
      const data = await this.get<{ tenant_id: string }>(
        `/get_tenant_id?slug=${slug}`,
        undefined,
        callbacks
      );
      return !!data.tenant_id;
    } catch (error) {
      console.error("Error validating tenant:", error);
      return false;
    }
  }

  /**
   * Login user
   * @param username The username
   * @param password The password
   * @param tenantSlug The tenant slug
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with login response
   */
  async loginUser(
    username: string,
    password: string,
    tenantSlug: string,
    callbacks?: ApiCallbacks
  ): Promise<LoginResponse> {
    try {
      // Create URL-encoded form data as specified in the API requirements
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', username);
      formData.append('password', password);
      formData.append('scope', '');
      formData.append('client_id', tenantSlug);

      // Use post method with custom config for form data
      const data = await this.post(
        '/login',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          }
        },
        callbacks
      );

      // Transform backend response to match our UserData type
      const userData: UserData = {
        id: data.id,
        username: data.username,
        email: data.username, // Using username as email since the backend doesn't return email
        role: data.role,
        token: data.access_token,
        tenantSlug: data.tenant_slug,
        tenantId: data.tenant_id,
        tenantLabel: data.tenant_label,
        tokenType: data.token_type,
        virtueProjectNameId: data.tenant_id // Using tenant_id as virtueProjectNameId for now
      };

      return {
        success: true,
        message: 'Login successful',
        user: userData
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || 'An error occurred during login',
        user: null
      };
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();

// Export convenience functions
export const validateTenant = (slug: string, callbacks?: ApiCallbacks<{ tenant_id: string }>) =>
  authService.validateTenant(slug, callbacks);

export const loginUser = (username: string, password: string, tenantSlug: string, callbacks?: ApiCallbacks) =>
  authService.loginUser(username, password, tenantSlug, callbacks);
