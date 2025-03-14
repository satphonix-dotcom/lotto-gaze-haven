
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';

export function useUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching users from Supabase');
      
      // Use RPC function to fetch all profiles to bypass RLS
      const { data, error } = await supabase
        .rpc('get_all_profiles');

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Fetched users:', data?.length || 0);
      console.log('User data:', data); // Log the actual user data for debugging
      
      // If data exists, sort it before setting
      const sortedData = data ? [...data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) : [];
      
      // Ensure we're setting all users we get back
      setUsers(sortedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Failed to load users',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: 'User deleted',
        description: 'User has been successfully deleted.',
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Failed to delete user',
        description: 'There was an error deleting the user.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateUser = async (updatedUser: Profile) => {
    try {
      console.log('Updating user in database:', updatedUser.id);
      console.log('New admin status:', updatedUser.is_admin);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          email: updatedUser.email,
          is_admin: updatedUser.is_admin,
        })
        .eq('id', updatedUser.id)
        .select();

      if (error) throw error;
      
      console.log('Update response from database:', data);

      // Refresh user list to ensure we have the latest data
      await fetchUsers();
      
      toast({
        title: 'User updated',
        description: 'User has been successfully updated.',
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Failed to update user',
        description: 'There was an error updating the user.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    users,
    isLoading,
    fetchUsers,
    deleteUser,
    updateUser
  };
}
