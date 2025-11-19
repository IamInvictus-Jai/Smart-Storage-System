import { useState, useMemo } from 'react';
import { Users, Database, HardDrive, RefreshCw, Shield } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUsers } from '../../hooks/useUsers';
import { useSystemStats } from '../../hooks/useSystemStats';
import { adminService } from '../../services/api/admin.service';
import { SearchBar } from '../../components/common/SearchBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [roleChangeData, setRoleChangeData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useSystemStats();

  const users = usersData?.users || [];
  const stats = statsData || {};

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchUsers(), refetchStats()]);
    setIsRefreshing(false);
  };

  const handleRoleChange = (user, newRole) => {
    setRoleChangeData({ user, newRole });
  };

  const confirmRoleChange = async () => {
    if (!roleChangeData) return;

    setIsUpdating(true);
    try {
      await adminService.updateUserRole(roleChangeData.user.user_id, roleChangeData.newRole);
      queryClient.invalidateQueries(['admin-users']);
      setRoleChangeData(null);
    } catch (error) {
      console.error('Role update failed:', error);
      alert('Failed to update user role. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text">Admin Panel</h1>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`w-5 h-5 text-text ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-secondary" />
            <span className="text-2xl font-bold text-text">
              {usersData?.total || 0}
            </span>
          </div>
          <h3 className="text-text-secondary text-sm">Total Users</h3>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-8 h-8 text-secondary" />
            <span className="text-2xl font-bold text-text">
              {stats.total_files || 0}
            </span>
          </div>
          <h3 className="text-text-secondary text-sm">Total Files</h3>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="w-8 h-8 text-secondary" />
            <span className="text-2xl font-bold text-text">
              {formatBytes(stats.total_size_bytes || 0)}
            </span>
          </div>
          <h3 className="text-text-secondary text-sm">Storage Used</h3>
        </div>
      </div>

      {/* Files by Category */}
      {stats.files_by_category && Object.keys(stats.files_by_category).length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-text mb-4">Files by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.files_by_category).map(([category, count]) => (
              <div key={category} className="text-center">
                <div className="text-2xl font-bold text-secondary">{count}</div>
                <div className="text-sm text-text-secondary capitalize">{category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Management */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text">User Management</h2>
          </div>
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search users by email or role..."
            className="max-w-md"
          />
        </div>

        {usersLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            <p className="text-text-secondary mt-4">Loading users...</p>
          </div>
        ) : usersError ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">Failed to load users</p>
            <button
              onClick={() => refetchUsers()}
              className="px-4 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-secondary">
              {searchQuery ? 'No users match your search' : 'No users found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-hover border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4 text-sm text-text">
                      <div className="flex items-center gap-2">
                        {user.email}
                        {user.email === usersData?.admin_user && (
                          <Shield className="w-4 h-4 text-secondary" title="Current admin" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-secondary/10 text-secondary'
                            : 'bg-surface-hover text-text'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.email !== usersData?.admin_user && (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          className="px-3 py-1 bg-surface-hover border border-border rounded-lg text-text text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Confirmation */}
      {roleChangeData && (
        <ConfirmDialog
          title="Change User Role"
          message={`Are you sure you want to change ${roleChangeData.user.email}'s role from "${roleChangeData.user.role}" to "${roleChangeData.newRole}"?`}
          confirmText={isUpdating ? 'Updating...' : 'Confirm'}
          cancelText="Cancel"
          onConfirm={confirmRoleChange}
          onCancel={() => setRoleChangeData(null)}
          variant="warning"
        />
      )}
    </div>
  );
};
