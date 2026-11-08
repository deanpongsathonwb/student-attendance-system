import { supabase } from './supabaseClient';
import { handleDbError, stripUndefined } from './dbHelper';
import { authStore } from '../stores/auth.store';
import { refreshCsrfToken } from '../security/csrf/csrfHandler';
import { sanitizeString } from '../security/xss/sanitizer';
import { sanitizeRedirectPath } from '../security/openRedirect/redirectValidator';
import { ROUTES } from '../constants/routes';
import ui from '../constants/ui.json';
import type { User, Role, Account } from '../types/common.types';

export const authService = {
  async getPrimaryAccount(): Promise<Account | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', 'u-primary')
        .single();

      if (error) {
        handleDbError(error, 'getPrimaryAccount');
      }

      if (data) {
        return {
          id: data.id,
          authUserId: data.auth_user_id,
          username: data.username,
          name: data.name,
          email: data.email,
          isPrimaryAccount: Boolean(data.is_primary_account),
          mustSetPassword: Boolean(data.must_set_password),
          roleId: data.role_id,
          roleName: data.role_name,
          permissions: data.permissions || [],
          advisoryClassroomId: data.advisory_classroom_id,
          position: data.position,
          department: data.department,
          avatarUrl: data.avatar_url,
        };
      }
    } catch (err) {
      handleDbError(err, 'getPrimaryAccount');
    }
    return null;
  },

  async setupPrimaryAccount(params: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const cleanName = sanitizeString(params.name);
    const cleanEmail = sanitizeString(params.email).toLowerCase();

    // 1. Sign up or create auth user in Supabase Auth
    let authUserId: string = '';
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          username: 'admin',
          full_name: cleanName,
          role: 'admin',
        },
      },
    });

    if (signUpError) {
      // If user already registered in Auth, try sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: params.password,
      });

      if (signInError) {
        handleDbError(signInError, 'setupPrimaryAccountAuth');
      }
      authUserId = signInData.user?.id || '';
    } else {
      authUserId = signUpData.user?.id || '';
    }

    // 2. Update u-primary record in Supabase Database
    const accountPayload = stripUndefined({
      auth_user_id: authUserId || undefined,
      name: cleanName,
      email: cleanEmail,
      must_set_password: false,
      is_primary_account: true,
      role_id: 'role_executive',
      role_name: ui.roles.executive,
      permissions: [
        'attendance.subject.record',
        'attendance.subject.view',
        'attendance.homeroom.record',
        'attendance.homeroom.view',
        'reports.view',
        'students.manage',
        'courses.manage',
        'settings.manage',
        'accounts.manage',
      ],
      position: ui.roles.primaryAdminPosition,
      department: ui.roles.academicDepartment,
    });

    const { error: accErr } = await supabase
      .from('accounts')
      .update(accountPayload)
      .eq('id', 'u-primary');

    if (accErr) {
      handleDbError(accErr, 'updatePrimaryAccount');
    }

    // 3. Mark system as initialized in system_settings
    const { error: setErr } = await supabase
      .from('system_settings')
      .update({ is_system_initialized: true })
      .eq('id', 'default');

    if (setErr) {
      handleDbError(setErr, 'markSystemInitialized');
    }

    // 4. Construct user and establish session
    const user: User = {
      id: 'u-primary',
      username: 'admin',
      role: 'admin',
      fullName: cleanName,
      position: ui.roles.primaryAdminPosition,
      department: ui.roles.academicDepartment,
      email: cleanEmail,
      permissions: [
        'attendance.subject.record',
        'attendance.subject.view',
        'attendance.homeroom.record',
        'attendance.homeroom.view',
        'reports.view',
        'students.manage',
        'courses.manage',
        'settings.manage',
        'accounts.manage',
      ],
      isPrimaryAccount: true,
    };

    authStore.setUser(user);
    refreshCsrfToken();
    return user;
  },

  async login(username: string, password: string): Promise<User | null> {
    const cleanUsername = sanitizeString(username).toLowerCase();

    // 1. Fetch account record from Supabase
    const { data: account, error: accError } = await supabase
      .from('accounts')
      .select('*')
      .ilike('username', cleanUsername)
      .single();

    if (accError || !account) {
      return null;
    }

    if (account.must_set_password) {
      return null;
    }

    // 2. Authenticate against Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: password,
    });

    if (authErr || !authData.user) {
      return null;
    }

    // 3. Map role from permissions
    let role: Role = 'admin';
    const permissions: string[] = account.permissions || [];
    if (permissions.includes('settings.manage') || permissions.includes('accounts.manage')) {
      role = 'admin';
    } else if (permissions.includes('attendance.homeroom.record')) {
      role = 'advisor';
    } else {
      role = 'teacher';
    }

    const user: User = {
      id: account.id,
      username: account.username,
      role: role,
      fullName: account.name,
      position: account.position || '',
      department: account.department || '',
      email: account.email,
      advisoryClassroomId: account.advisory_classroom_id || undefined,
      permissions: permissions,
      isPrimaryAccount: Boolean(account.is_primary_account),
    };

    authStore.setUser(user);
    refreshCsrfToken();
    return user;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    authStore.logout();
    refreshCsrfToken();
  },

  getCurrentUser(): User | null {
    return authStore.getState().user;
  },

  getToken(): string | null {
    return authStore.getState().token;
  },

  isAuthenticated(): boolean {
    return authStore.getState().isAuthenticated;
  },

  getRedirectPathForRole(role: Role): string {
    let target: string = ROUTES.PUBLIC.LOGIN;
    if (role === 'teacher') {
      target = ROUTES.TEACHER.ATTENDANCE;
    } else if (role === 'advisor') {
      target = ROUTES.ADVISOR.HOMEROOM_CHECK;
    } else if (role === 'admin') {
      target = ROUTES.ADMIN.OVERVIEW;
    }
    return sanitizeRedirectPath(target, ROUTES.PUBLIC.LOGIN);
  },
};
