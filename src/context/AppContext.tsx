import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem, Recipe, Order, User, Supplier, PurchaseOrder, PayrollRecord, StockMovement } from '../types';
import { DatabaseService, subscribeToTable } from '../lib/supabaseClient';
import * as dataClient from '../lib/dataClient';
import { mockInventoryItems } from '../data/mockData';

interface AppContextType {
  // Data
  inventoryItems: InventoryItem[];
  recipes: Recipe[];
  orders: Order[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  payrollRecords: PayrollRecord[];
  stockMovements: StockMovement[];
  
  // Inventory Actions
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  deleteInventoryItem: (id: string) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  
  // Recipe Actions
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  
  // Order Actions
  updateOrderStatus: (orderId: string, status: Order['status'], assignedStaff?: string) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  
  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  
  // Real-time updates
  lastUpdated: string;
  loading: boolean;
  error: string | null;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Supabase on mount
  useEffect(() => {
    initializeData();
    
    // Set up real-time subscriptions
    setupRealtimeSubscriptions();
  }, []);

  const setupRealtimeSubscriptions = () => {
    try {
      const suppliersSubscription = subscribeToTable('suppliers', (payload) => {
        console.log('Suppliers table changed:', payload);
        loadSuppliersData();
      });

      const inventorySubscription = subscribeToTable('inventory_items', (payload) => {
        console.log('Inventory table changed:', payload);
        loadInventoryData();
      });

      const stockMovementsSubscription = subscribeToTable('stock_movements', (payload) => {
        console.log('Stock movements table changed:', payload);
        loadStockMovementsData();
      });

      const ordersSubscription = subscribeToTable('orders', (payload) => {
        console.log('Orders table changed:', payload);
        loadOrdersData();
      });

      return () => {
        suppliersSubscription?.unsubscribe();
        inventorySubscription?.unsubscribe();
        stockMovementsSubscription?.unsubscribe();
        ordersSubscription?.unsubscribe();
      };
    } catch (error) {
      console.log('Real-time subscriptions not available:', error);
    }
  };

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Initializing data...');
      
      await loadAllDataFromDatabase();
      console.log('Successfully loaded data from database');
    } catch (err) {
      console.error('Error initializing data:', err);
      console.log('Database not available, using mock data');
      // Don't set error state, just use fallback data
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    console.log('Loading mock data...');
    
    // Load mock inventory
    setInventoryItems(mockInventoryItems);
    
    // Load mock recipes
    const mockRecipes = [
      {
        id: '1',
        name: 'Chicken Biryani',
        category: 'main course',
        prepTime: 30,
        cookTime: 45,
        servings: 4,
        ingredients: [
          { itemId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2, unit: 'cups' },
          { itemId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', quantity: 1, unit: 'kg' }
        ],
        instructions: ['Soak rice', 'Marinate chicken', 'Cook rice', 'Layer and cook']
      },
      {
        id: '2',
        name: 'Vegetable Curry',
        category: 'main course',
        prepTime: 15,
        cookTime: 25,
        servings: 4,
        ingredients: [
          { itemId: 'c3d4e5f6-g7h8-9012-cdef-345678901234', quantity: 0.5, unit: 'kg' },
          { itemId: 'd4e5f6g7-h8i9-0123-defg-456789012345', quantity: 0.3, unit: 'kg' }
        ],
        instructions: ['Chop vegetables', 'Heat oil', 'Add spices', 'Cook vegetables']
      }
    ];
    setRecipes(mockRecipes);
    
    // Load mock suppliers
    const mockSuppliers = [
      {
        id: 'sup1',
        name: 'Tamil Nadu Rice Mills',
        contact: '+91 9876543220',
        email: 'info@tnricemills.com',
        address: 'Industrial Area, Hosur',
        categories: ['grains'],
        rating: 4.5,
        isActive: true
      },
      {
        id: 'sup2',
        name: 'Fresh Meat Co.',
        contact: '+91 9876543221',
        email: 'orders@freshmeat.com',
        address: 'Meat Market Complex, Hosur',
        categories: ['meat'],
        rating: 4.2,
        isActive: true
      }
    ];
    setSuppliers(mockSuppliers);
    
    // Initialize empty arrays for other data
    setOrders([]);
    setPurchaseOrders([]);
    setStockMovements([]);
    
    updateLastUpdated();
    console.log('Mock data loaded successfully');
  };
  const loadSuppliersData = async () => {
    try {
      console.log('Loading suppliers from Supabase...');
      const data = await dataClient.getSuppliers();

      console.log('Suppliers loaded from Supabase:', data);
      const mappedSuppliers = data.map(s => ({
        id: s.id,
        name: s.name,
        contact: s.contact,
        email: s.email,
        address: s.address,
        categories: s.categories || [],
        rating: s.rating,
        isActive: s.is_active,
        is_active: s.is_active
      }));
      
      console.log('Mapped suppliers:', mappedSuppliers);
      setSuppliers(mappedSuppliers);
    } catch (err) {
      console.error('Error in loadSuppliersData:', err);
      // Fallback to mock suppliers when database is not available
      const mockSuppliers = [
        {
          id: 'sup1',
          name: 'Tamil Nadu Rice Mills',
          contact: '+91 9876543220',
          email: 'info@tnricemills.com',
          address: 'Industrial Area, Hosur',
          categories: ['grains'],
          rating: 4.5,
          isActive: true,
          is_active: true
        },
        {
          id: 'sup2',
          name: 'Fresh Meat Co.',
          contact: '+91 9876543221',
          email: 'orders@freshmeat.com',
          address: 'Meat Market Complex, Hosur',
          categories: ['meat'],
          rating: 4.2,
          isActive: true,
          is_active: true
        },
        {
          id: 'sup3',
          name: 'Hosur Vegetable Market',
          contact: '+91 9876543222',
          email: 'sales@hosurveg.com',
          address: 'Main Vegetable Market, Hosur',
          categories: ['vegetables'],
          rating: 4.0,
          isActive: true,
          is_active: true
        },
        {
          id: 'sup4',
          name: 'Spice World',
          contact: '+91 9876543223',
          email: 'info@spiceworld.com',
          address: 'Spice Market, Hosur',
          categories: ['spices'],
          rating: 4.7,
          isActive: true,
          is_active: true
        }
      ];
      console.log('Using mock suppliers due to database connection error');
      setSuppliers(mockSuppliers);
    }
  };

  const loadInventoryData = async () => {
    try {
      console.log('Loading inventory from database...');
      const data = await dataClient.getInventory();
      
      const mappedInventory = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        currentStock: item.current_stock,
        unit: item.unit,
        minStock: item.min_stock,
        maxStock: item.max_stock,
        costPerUnit: item.cost_per_unit,
        supplier: item.supplier,
        lastRestocked: item.last_restocked,
        expiryDate: item.expiry_date
      }));
      
      console.log('Mapped inventory items from database:', mappedInventory);
      setInventoryItems(mappedInventory);
      updateLastUpdated();
    } catch (err) {
      console.error('Database inventory load failed:', err);
      // Fallback to mock inventory when database is not available
      console.log('Using mock inventory due to database connection error');
      setInventoryItems(mockInventoryItems);
    }
  };

  const loadStockMovementsData = async () => {
    try {
      console.log('Loading stock movements from database...');
      const data = await DatabaseService.getStockMovements();
      
      const mappedStockMovements = data.map(sm => ({
        id: sm.id,
        inventoryItemId: sm.inventory_item_id,
        movementType: sm.movement_type,
        quantity: sm.quantity,
        reason: sm.reason,
        referenceNumber: sm.reference_number,
        unitCost: sm.unit_cost,
        totalCost: sm.total_cost,
        performedBy: sm.performed_by,
        notes: sm.notes,
        movementDate: sm.movement_date,
        createdAt: sm.created_at
      }));
      console.log('Mapped stock movements from database:', mappedStockMovements);
      setStockMovements(mappedStockMovements);
      updateLastUpdated();
    } catch (err) {
      console.error('Database stock movements load failed:', err);
      // Initialize empty stock movements when database is not available
      console.log('Using empty stock movements due to database connection error');
      setStockMovements([]);
    }
  };

  const loadOrdersData = async () => {
    try {
      console.log('Loading orders from database...');
      const data = await DatabaseService.getOrders();
      
      const mappedOrders = data.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        deliveryAddress: order.delivery_address,
        items: order.items || [],
        status: order.status,
        orderTime: order.order_time,
        estimatedDelivery: order.estimated_delivery,
        totalAmount: order.total_amount,
        assignedStaff: order.assigned_staff,
        priority: order.priority
      }));
      console.log('Mapped orders from database:', mappedOrders);
      setOrders(mappedOrders);
      updateLastUpdated();
    } catch (err) {
      console.error('Error loading orders data:', err);
      // Initialize empty orders when database is not available
      console.log('Using empty orders due to database connection error');
      setOrders([]);
    }
  };

  const loadAllDataFromDatabase = async () => {
    console.log('Loading data from database...');
    
    // Load data sequentially to better handle errors
    try {
      await loadSuppliersData();
      console.log('✅ Suppliers loaded');
    } catch (err) {
      console.error('❌ Failed to load suppliers:', err);
    }
    
    try {
      await loadInventoryData();
      console.log('✅ Inventory loaded');
    } catch (err) {
      console.error('❌ Failed to load inventory:', err);
    }
    
    try {
      await loadRecipesData();
      console.log('✅ Recipes loaded');
    } catch (err) {
      console.error('❌ Failed to load recipes:', err);
    }
    
    try {
      await loadOrdersData();
      console.log('✅ Orders loaded');
    } catch (err) {
      console.error('❌ Failed to load orders:', err);
    }
    
    try {
      await loadPurchaseOrdersData();
      console.log('✅ Purchase orders loaded');
    } catch (err) {
      console.error('❌ Failed to load purchase orders:', err);
    }
    
    try {
      await loadStockMovementsData();
      console.log('✅ Stock movements loaded');
    } catch (err) {
      console.error('❌ Failed to load stock movements:', err);
    }
    
    updateLastUpdated();
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await loadAllDataFromDatabase();
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data from database');
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadRecipesData = async () => {
    try {
      const data = await DatabaseService.getRecipes();
      const mappedRecipes = data.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        prepTime: recipe.prep_time,
        cookTime: recipe.cook_time,
        servings: recipe.servings,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        image: recipe.image
      }));
      setRecipes(mappedRecipes);
    } catch (err) {
      console.error('Error loading recipes:', err);
      // Fallback to mock recipes when database is not available
      const mockRecipes = [
        {
          id: '1',
          name: 'Chicken Biryani',
          category: 'main course',
          prepTime: 30,
          cookTime: 45,
          servings: 4,
          ingredients: [
            { itemId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2, unit: 'cups' },
            { itemId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', quantity: 1, unit: 'kg' }
          ],
          instructions: ['Soak rice', 'Marinate chicken', 'Cook rice', 'Layer and cook']
        },
        {
          id: '2',
          name: 'Vegetable Curry',
          category: 'main course',
          prepTime: 15,
          cookTime: 25,
          servings: 4,
          ingredients: [
            { itemId: 'c3d4e5f6-g7h8-9012-cdef-345678901234', quantity: 0.5, unit: 'kg' },
            { itemId: 'd4e5f6g7-h8i9-0123-defg-456789012345', quantity: 0.3, unit: 'kg' }
          ],
          instructions: ['Chop vegetables', 'Heat oil', 'Add spices', 'Cook vegetables']
        }
      ];
      console.log('Using mock recipes due to database connection error');
      setRecipes(mockRecipes);
    }
  };

  const loadPurchaseOrdersData = async () => {
    try {
      const data = await DatabaseService.getPurchaseOrders();
      const mappedPurchaseOrders = data.map(po => ({
        id: po.id,
        supplierId: po.supplier_id,
        status: po.status,
        orderDate: po.order_date,
        expectedDelivery: po.expected_delivery,
        totalAmount: po.total_amount,
        items: []
      }));
      setPurchaseOrders(mappedPurchaseOrders);
    } catch (err) {
      console.error('Error loading purchase orders:', err);
      // Initialize empty purchase orders when database is not available
      console.log('Using empty purchase orders due to database connection error');
      setPurchaseOrders([]);
    }
  };

  // Enhanced inventory update with database sync
  const updateInventoryItemInDatabase = async (id: string, updates: any) => {
    try {
      await DatabaseService.updateInventoryItem(id, updates);
      console.log('Inventory item updated in database:', id, updates);
    } catch (error) {
      console.error('Error updating inventory in database:', error);
      throw error;
    }
  };

  // Enhanced stock movement with proper database sync
  const addStockMovement = async (movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    try {
      console.log('Adding stock movement:', movement);
      
      const dbMovement = {
        inventory_item_id: movement.inventoryItemId,
        movement_type: movement.movementType,
        quantity: movement.quantity,
        reason: movement.reason,
        reference_number: movement.referenceNumber || null,
        unit_cost: movement.unitCost,
        total_cost: movement.totalCost,
        performed_by: movement.performedBy,
        notes: movement.notes || '',
        movement_date: movement.movementDate
      };

      const data = await DatabaseService.addStockMovement(dbMovement);

      const newMovement: StockMovement = {
        id: data.id,
        inventoryItemId: data.inventory_item_id,
        movementType: data.movement_type,
        quantity: data.quantity,
        reason: data.reason,
        referenceNumber: data.reference_number,
        unitCost: data.unit_cost,
        totalCost: data.total_cost,
        performedBy: data.performed_by,
        notes: data.notes,
        movementDate: data.movement_date,
        createdAt: data.created_at
      };
      
      setStockMovements(prev => [newMovement, ...prev]);
      console.log('Stock movement added to database:', newMovement);
      
      // Update inventory levels in database
      const inventoryItem = inventoryItems.find(item => item.id === movement.inventoryItemId);
      if (inventoryItem) {
        const newStock = movement.movementType === 'in' 
          ? inventoryItem.currentStock + movement.quantity
          : Math.max(0, inventoryItem.currentStock - movement.quantity);
        
        console.log(`Updating ${inventoryItem.name}: ${inventoryItem.currentStock} -> ${newStock}`);
        
        const dbUpdates = {
          current_stock: newStock,
          last_restocked: movement.movementType === 'in' ? new Date().toISOString().split('T')[0] : inventoryItem.lastRestocked,
          updated_at: new Date().toISOString()
        };
        
        await DatabaseService.updateInventoryItem(movement.inventoryItemId, dbUpdates);
        console.log('Inventory updated in database');
        
        // Update local state
        setInventoryItems(prev => 
          prev.map(item => {
            if (item.id === movement.inventoryItemId) {
              return { 
                ...item, 
                currentStock: newStock,
                lastRestocked: movement.movementType === 'in' ? new Date().toISOString().split('T')[0] : item.lastRestocked
              };
            }
            return item;
          })
        );
      }
      
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Stock Movement Recorded',
        message: `${movement.movementType === 'in' ? 'Added' : 'Removed'} ${movement.quantity} units successfully`
      });
      
    } catch (err) {
      console.error('Error adding stock movement:', err);
      addNotification({
        type: 'error',
        title: 'Stock Movement Failed',
        message: 'Failed to record stock movement: ' + (err as Error).message
      });
      throw err;
    }
  };

  const updateLastUpdated = () => {
    setLastUpdated(new Date().toISOString());
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Inventory Actions
  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const dbUpdates = {
        name: updates.name,
        category: updates.category,
        current_stock: updates.currentStock,
        unit: updates.unit,
        min_stock: updates.minStock,
        max_stock: updates.maxStock,
        cost_per_unit: updates.costPerUnit,
        supplier: updates.supplier,
        last_restocked: updates.lastRestocked,
        expiry_date: updates.expiryDate,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      await DatabaseService.updateInventoryItem(id, dbUpdates);

      setInventoryItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Inventory Updated',
        message: 'Inventory item has been updated successfully'
      });
    } catch (err) {
      console.error('Error updating inventory item:', err);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update inventory item'
      });
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      console.log('Adding inventory item:', item);
      
      const dbItem = {
        name: item.name,
        category: item.category,
        current_stock: item.currentStock,
        unit: item.unit,
        min_stock: item.minStock,
        max_stock: item.maxStock,
        cost_per_unit: item.costPerUnit,
        supplier: item.supplier,
        last_restocked: item.lastRestocked,
        expiry_date: item.expiryDate || null
      };

      const data = await DatabaseService.addInventoryItem(dbItem);

      const newItem: InventoryItem = {
        id: data.id,
        name: data.name,
        category: data.category,
        currentStock: data.current_stock,
        unit: data.unit,
        minStock: data.min_stock,
        maxStock: data.max_stock,
        costPerUnit: data.cost_per_unit,
        supplier: data.supplier,
        lastRestocked: data.last_restocked,
        expiryDate: data.expiry_date
      };
      
      console.log('Inventory item added to database:', newItem);
      setInventoryItems(prev => [newItem, ...prev]);
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'New Item Added',
        message: `${item.name} has been added to inventory`
      });
      
    } catch (err) {
      console.error('Error adding inventory item:', err);
      addNotification({
        type: 'error',
        title: 'Add Failed',
        message: 'Failed to add inventory item: ' + (err as Error).message
      });
      throw err;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const item = inventoryItems.find(i => i.id === id);
      
      await DatabaseService.deleteInventoryItem(id);

      setInventoryItems(prev => prev.filter(i => i.id !== id));
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Item Deleted',
        message: `${item?.name} has been removed from inventory`
      });
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete inventory item'
      });
    }
  };

  // Recipe Actions
  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    try {
      const dbRecipe = {
        name: recipe.name,
        category: recipe.category,
        prep_time: recipe.prepTime,
        cook_time: recipe.cookTime,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        image: recipe.image || null,
        difficulty: (recipe as any).difficulty || 'medium',
        cuisine: (recipe as any).cuisine || null,
        tags: (recipe as any).tags || [],
        nutrition_info: (recipe as any).nutritionInfo || { calories: 0, protein: 0, carbs: 0, fat: 0 },
        cost: (recipe as any).cost || 0,
        allergens: (recipe as any).allergens || []
      };

      const data = await DatabaseService.addRecipe(dbRecipe);

      const newRecipe: Recipe = {
        id: data.id,
        name: data.name,
        category: data.category,
        prepTime: data.prep_time,
        cookTime: data.cook_time,
        servings: data.servings,
        ingredients: data.ingredients,
        instructions: data.instructions,
        image: data.image
      };
      
      setRecipes(prev => [newRecipe, ...prev]);
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'New Recipe Added',
        message: `${recipe.name} has been added to the menu`
      });
    } catch (err) {
      console.error('Error adding recipe:', err);
      addNotification({
        type: 'error',
        title: 'Add Failed',
        message: 'Failed to add recipe'
      });
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      const dbUpdates = {
        name: updates.name,
        category: updates.category,
        prep_time: updates.prepTime,
        cook_time: updates.cookTime,
        servings: updates.servings,
        ingredients: updates.ingredients,
        instructions: updates.instructions,
        image: updates.image,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      await DatabaseService.updateRecipe(id, dbUpdates);

      setRecipes(prev => 
        prev.map(recipe => recipe.id === id ? { ...recipe, ...updates } : recipe)
      );
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Recipe Updated',
        message: 'Recipe has been updated successfully'
      });
    } catch (err) {
      console.error('Error updating recipe:', err);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update recipe'
      });
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      const recipe = recipes.find(r => r.id === id);
      
      await DatabaseService.deleteRecipe(id);

      setRecipes(prev => prev.filter(r => r.id !== id));
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Recipe Deleted',
        message: `${recipe?.name} has been removed from the menu`
      });
    } catch (err) {
      console.error('Error deleting recipe:', err);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete recipe'
      });
    }
  };

  // Order Actions
  const updateOrderStatus = async (orderId: string, status: Order['status'], assignedStaff?: string) => {
    try {
      const dbUpdates = {
        status,
        assigned_staff: assignedStaff,
        updated_at: new Date().toISOString()
      };

      await DatabaseService.updateOrder(orderId, dbUpdates);

      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status, assignedStaff: assignedStaff || order.assignedStaff }
            : order
        )
      );
      updateLastUpdated();

      const statusMessages = {
        cooking: 'Order is now being prepared',
        out_for_delivery: 'Order is out for delivery',
        delivered: 'Order has been delivered',
        cancelled: 'Order has been cancelled'
      };
      
      addNotification({
        type: status === 'delivered' ? 'success' : 'info',
        title: 'Order Status Updated',
        message: `Order #${orderId}: ${statusMessages[status]}`
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update order status'
      });
    }
  };

  const generateOrderId = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
    // Get today's orders to determine sequence number
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.orderTime).toISOString().slice(0, 10).replace(/-/g, '');
      return orderDate === dateStr;
    });
    
    const sequenceNumber = (todayOrders.length + 1).toString().padStart(3, '0');
    return `ORD-${dateStr}-${sequenceNumber}`;
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      // Generate order number using database function
      const { data: orderNumberData, error: orderNumberError } = await DatabaseService.supabase
        .rpc('generate_order_number');
      
      if (orderNumberError) {
        console.error('Error generating order number:', orderNumberError);
        throw orderNumberError;
      }
      
      const orderNumber = orderNumberData;
      
      const dbOrder = {
        order_number: orderNumber,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_email: (order as any).customerEmail || null,
        delivery_address: order.deliveryAddress,
        items: order.items,
        status: order.status,
        order_time: order.orderTime,
        estimated_delivery: order.estimatedDelivery,
        total_amount: order.totalAmount,
        assigned_staff: order.assignedStaff || null,
        priority: (order as any).priority || 'normal',
        special_instructions: (order as any).specialInstructions || null,
        payment_method: (order as any).paymentMethod || 'cash',
        order_source: (order as any).orderSource || 'admin'
      };

      const data = await DatabaseService.addOrder(dbOrder);

      const newOrder: Order = {
        id: data.id,
        orderNumber: data.order_number,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        deliveryAddress: data.delivery_address,
        items: data.items,
        status: data.status,
        orderTime: data.order_time,
        estimatedDelivery: data.estimated_delivery,
        totalAmount: data.total_amount,
        assignedStaff: data.assigned_staff
      };
      
      setOrders(prev => [newOrder, ...prev]);
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'New Order Created',
        message: `Order ${data.order_number} from ${order.customerName} has been created`
      });
    } catch (err) {
      console.error('Error adding order:', err);
      addNotification({
        type: 'error',
        title: 'Order Failed',
        message: 'Failed to create order'
      });
    }
  };

  // Supplier Actions
  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      console.log('Adding supplier to Supabase:', supplier);
      
      const dbSupplier = {
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        address: supplier.address,
        categories: supplier.categories || [],
        rating: supplier.rating,
        is_active: supplier.isActive !== false
      };

      const data = await DatabaseService.addSupplier(dbSupplier);

      console.log('Supplier added to Supabase successfully:', data);
      
      const newSupplier: Supplier = {
        id: data.id,
        name: data.name,
        contact: data.contact,
        email: data.email,
        address: data.address,
        categories: data.categories,
        rating: data.rating,
        isActive: data.is_active,
        is_active: data.is_active
      };
      
      setSuppliers(prev => [newSupplier, ...prev]);
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Supplier Added',
        message: `${supplier.name} has been added as a supplier`
      });
      
    } catch (err) {
      console.error('Error adding supplier:', err);
      addNotification({
        type: 'error',
        title: 'Add Failed',
        message: 'Failed to add supplier: ' + (err as Error).message
      });
      throw err;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const dbUpdates = {
        name: updates.name,
        contact: updates.contact,
        email: updates.email,
        address: updates.address,
        categories: updates.categories,
        rating: updates.rating,
        is_active: updates.isActive,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      await DatabaseService.updateSupplier(id, dbUpdates);

      setSuppliers(prev => 
        prev.map(supplier => supplier.id === id ? { ...supplier, ...updates } : supplier)
      );
      
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Supplier Updated',
        message: 'Supplier has been updated successfully'
      });
      
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update supplier: ' + (err as Error).message
      });
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      inventoryItems,
      recipes,
      orders,
      suppliers,
      purchaseOrders,
      payrollRecords,
      stockMovements,
      updateInventoryItem,
      addInventoryItem,
      deleteInventoryItem,
      addStockMovement,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      updateOrderStatus,
      addOrder,
      addSupplier,
      updateSupplier,
      notifications,
      addNotification,
      markNotificationRead,
      lastUpdated,
      loading,
      error
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}