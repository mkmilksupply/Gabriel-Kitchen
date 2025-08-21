import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { DatabaseService, authenticateWithDatabase, authenticateWithUsername } from '../lib/supabaseClient';
import * as dataClient from '../lib/dataClient';
import { clearToken } from '../lib/token';

interface AuthContextType {
  user: User | null;
  users: (User & { username?: string; password?: string })[];
  login: (email: string, password: string, role: string) => Promise<boolean>;
  loginWithUsername: (username: string, password: string, role: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  addUser: (userData: AddUserData) => Promise<boolean>;
  logout: () => void;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'kitchen_staff' | 'inventory_manager' | 'delivery_staff';
  password: string;
}

interface AddUserData {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'kitchen_staff' | 'inventory_manager' | 'delivery_staff';
  username: string;
  password: string;
  salary?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: (User & { username?: string; password?: string })[] = [
  {
    id: 'u1v2w3x4-y5z6-7890-uvwx-123456789012',
    name: 'Gabriel Admin',
    email: 'admin@gabrielkitchen.com',
    role: 'admin',
    phone: '+91 9876543210',
    joinDate: '2023-01-15',
    isActive: true,
    username: 'admin',
    password: 'password123'
  },
  {
    id: 'v2w3x4y5-z6a7-8901-vwxy-234567890123',
    name: 'Ravi Kumar',
    email: 'ravi@gabrielkitchen.com',
    role: 'kitchen_staff',
    phone: '+91 9876543211',
    joinDate: '2023-03-20',
    isActive: true,
    username: 'ravi.kumar',
    password: 'password123'
  },
  {
    id: 'w3x4y5z6-a7b8-9012-wxyz-345678901234',
    name: 'Priya Sharma',
    email: 'priya@gabrielkitchen.com',
    role: 'inventory_manager',
    phone: '+91 9876543212',
    joinDate: '2023-02-10',
    isActive: true,
    username: 'priya.sharma',
    password: 'password123'
  },
  {
    id: 'x4y5z6a7-b8c9-0123-xyza-456789012345',
    name: 'Suresh Babu',
    email: 'suresh@gabrielkitchen.com',
    role: 'delivery_staff',
    phone: '+91 9876543213',
    joinDate: '2023-04-05',
    isActive: true,
    username: 'suresh.babu',
    password: 'password123'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<(User & { username?: string; password?: string })[]>([]);
  const [loading, setLoading] = useState(false);

  // Load users from localStorage on mount
  useEffect(() => {
    initializeUsers();
  }, []);

  const initializeUsers = async () => {
    try {
      // Try to load from database first
      try {
        const staffData = await DatabaseService.getStaffMembers();
        const mappedUsers = staffData.map(staff => ({
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          phone: staff.phone,
          joinDate: staff.join_date,
          isActive: staff.is_active,
          username: staff.username,
          password: 'password123'
        }));
        setUsers(mappedUsers);
        console.log('Loaded users from database:', mappedUsers.length);
      } catch (dbError) {
        console.log('Database not available, using mock users:', dbError);
        loadUsersFromLocalStorage();
      }
    } catch (error) {
      console.error('Error initializing users:', error);
      loadUsersFromLocalStorage();
    }
  };

  const loadUsersFromLocalStorage = () => {
    const savedUsers = localStorage.getItem('gabriel_kitchen_users');
    if (savedUsers) {
      try {
        const loadedUsers = JSON.parse(savedUsers);
        setUsers(loadedUsers);
        console.log('Loaded users from localStorage:', loadedUsers.length);
      } catch (error) {
        console.error('Error loading users:', error);
        setUsers(mockUsers);
        console.log('Using mock users:', mockUsers.length);
      }
    } else {
      // Initialize with mock users if no saved users
      setUsers(mockUsers);
      console.log('Initialized with mock users:', mockUsers.length);
    }
  };

  // Save users to localStorage whenever users change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('gabriel_kitchen_users', JSON.stringify(users));
    }
  }, [users]);

  const login = async (identifier: string, password: string) => {
    try {
      setLoading(true);
      
      // Try new data client first
      try {
        const result = identifier.includes('@') 
          ? await dataClient.login(identifier, password)
          : await dataClient.loginWithUsername(identifier, password);
        
        if (result.success && result.user) {
          setUser(result.user);
          localStorage.setItem('user', JSON.stringify(result.user));
          return true;
        }
      } catch (dataClientError) {
        console.log('Data client login failed, trying fallback:', dataClientError);
      }
      
      // Try mock users first for reliable testing
      const mockUser = mockUsers.find(u => 
        (u.email === identifier || u.username === identifier) && u.password === password
      );
      
      let result;
      if (mockUser) {
        result = {
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            phone: mockUser.phone || '',
            joinDate: new Date().toISOString(),
            isActive: true
          }
        };
      } else {
        // Try database authentication as fallback
        try {
          if (identifier.includes('@')) {
            result = await authenticateWithDatabase(identifier, password);
          } else {
            result = await authenticateWithUsername(identifier, password);
          }
        } catch (dbError) {
          console.log('Database authentication failed:', dbError);
          throw new Error('Invalid credentials');
        }
      }
      
      if (result?.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithUsername = async (username: string, password: string, role: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Try database authentication first
      try {
        const authResult = await authenticateWithUsername(username, password);
        if (authResult.user && authResult.user.role === role) {
          setUser(authResult.user);
          localStorage.setItem('user', JSON.stringify(authResult.user));
          return true;
        }
      } catch (dbError) {
      }
      
      // Fallback to local users
      const foundUser = users.find(u => 
        (u as any).username === username && 
        u.role === role && 
        u.isActive
      );
      
      if (foundUser && (foundUser as any).password === password) {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = users.find(u => 
        u.email.toLowerCase() === userData.email.toLowerCase() || 
        u.phone === userData.phone
      );
      
      if (existingUser) {
        return false; // User already exists
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email.toLowerCase(),
        role: userData.role,
        phone: userData.phone,
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true
      };

      // Add to users list
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);

      // Auto-login the new user
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const addUser = async (userData: AddUserData): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Try to add to database first
      try {
        const dbStaff = {
          name: userData.name,
          email: userData.email.toLowerCase(),
          phone: userData.phone,
          role: userData.role,
          department: getDepartmentFromRole(userData.role),
          salary: userData.salary || 25000,
          username: userData.username,
          password_hash: userData.password, // In real app, this would be hashed
          is_active: true
        };

        const newStaffMember = await DatabaseService.addStaffMember(dbStaff);
        
        // Add to local users list
        const newUser: User & { username: string; password: string; salary: number; department: string } = {
          id: newStaffMember.id,
          name: newStaffMember.name,
          email: newStaffMember.email,
          role: newStaffMember.role,
          phone: newStaffMember.phone,
          joinDate: newStaffMember.join_date,
          isActive: newStaffMember.is_active,
          username: newStaffMember.username,
          password: userData.password,
          salary: newStaffMember.salary,
          department: newStaffMember.department
        };

        setUsers(prev => [newUser, ...prev]);
        return true;
        
      } catch (dbError) {
        // Fallback to local storage
        const existingUser = users.find(u => 
          u.email.toLowerCase() === userData.email.toLowerCase() || 
          u.phone === userData.phone ||
          (u as any).username?.toLowerCase() === userData.username.toLowerCase()
        );
        
        if (existingUser) {
          return false;
        }

        const newUser: User & { username: string; password: string; salary: number; department: string } = {
          id: Date.now().toString(),
          name: userData.name,
          email: userData.email.toLowerCase(),
          role: userData.role,
          phone: userData.phone,
          joinDate: new Date().toISOString().split('T')[0],
          isActive: true,
          username: userData.username,
          password: userData.password,
          salary: userData.salary || 25000,
          department: getDepartmentFromRole(userData.role)
        };

        setUsers(prev => [newUser, ...prev]);
        return true;
      }
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentFromRole = (role: string) => {
    switch (role) {
      case 'admin': return 'Management';
      case 'kitchen_staff': return 'Kitchen';
      case 'inventory_manager': return 'Operations';
      case 'delivery_staff': return 'Delivery';
      default: return 'General';
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
    localStorage.removeItem('user');
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, login, loginWithUsername, signup, addUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}