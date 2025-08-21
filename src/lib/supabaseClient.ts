import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Use regular client since RLS is now disabled
export const supabaseAdmin = supabase;

// Database service functions
export class DatabaseService {
  static supabase = supabase; // Expose supabase client for RPC calls
  
  // Suppliers
  static async getSuppliers() {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase suppliers query error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  static async addSupplier(supplier: any) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select();
      
      if (error) {
        console.error('Supabase supplier insert error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from insert');
      }
      
      return data[0];
    } catch (error) {
      console.error('Database supplier insert error:', error);
      throw error;
    }
  }

  static async updateSupplier(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Supabase supplier update error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from update');
      }
      
      return data[0];
    } catch (error) {
      console.error('Database supplier update error:', error);
      throw error;
    }
  }

  // Inventory Items
  static async getInventoryItems() {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Supabase inventory items query error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Database inventory items load failed:', error);
      throw error;
    }
  }

  static async addInventoryItem(item: any) {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([item])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateInventoryItem(id: string, updates: any) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteInventoryItem(id: string) {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Stock Movements
  static async getStockMovements() {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase stock movements query error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Database stock movements load failed:', error);
      throw error;
    }
  }

  static async addStockMovement(movement: any) {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert([movement])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Recipes
  static async getRecipes() {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Supabase recipes query error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Database recipes load failed:', error);
      throw error;
    }
  }

  static async addRecipe(recipe: any) {
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipe])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateRecipe(id: string, updates: any) {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteRecipe(id: string) {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Orders
  static async getOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_number')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase orders query error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Database orders load failed:', error);
      throw error;
    }
  }

  static async addOrder(order: any) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select('*, order_number')
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateOrder(id: string, updates: any) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, order_number')
      .single();
    
    if (error) throw error;
    return data;
  }

  // Staff Members
  static async getStaffMembers() {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase staff members query error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Database staff members load failed:', error);
      throw error;
    }
  }

  static async addStaffMember(staff: any) {
    const { data, error } = await supabase
      .from('staff_members')
      .insert([staff])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateStaffMember(id: string, updates: any) {
    const { data, error } = await supabase
      .from('staff_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Customers
  static async getCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase customers query error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Database customers load failed:', error);
      throw error;
    }
  }

  static async addCustomer(customer: any) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Purchase Orders
  static async getPurchaseOrders() {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase purchase orders query error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Database purchase orders load failed:', error);
      throw error;
    }
  }

  static async addPurchaseOrder(purchaseOrder: any) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([purchaseOrder])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Real-time subscription helpers
export const subscribeToTable = (table: string, callback: (payload: any) => void) => {
  try {
    return supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();
  } catch (error) {
    console.log(`Failed to subscribe to ${table}:`, error);
    return { unsubscribe: () => {} };
  }
};

// Authentication helpers
export const authenticateWithDatabase = async (email: string, password: string) => {
  try {
    // Try to find user in staff_members table
    const { data: staffData, error: staffError } = await supabase
      .from('staff_members')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .limit(1);

    if (staffError || !staffData || staffData.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = staffData[0];
    
    // In a real app, you'd verify the password hash here
    // For now, we'll assume the password is correct if the user exists
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        joinDate: user.join_date,
        isActive: user.is_active
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export const authenticateWithUsername = async (username: string, password: string) => {
  try {
    const { data: staffData, error: staffError } = await supabase
      .from('staff_members')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .limit(1);

    if (staffError || !staffData || staffData.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = staffData[0];
    
    // In a real app, you'd verify the password hash here
    // For now, we'll assume the password is correct if the user exists
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        joinDate: user.join_date,
        isActive: user.is_active
      }
    };
  } catch (error) {
    console.error('Username authentication error:', error);
    throw error;
  }
};