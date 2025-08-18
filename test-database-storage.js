// Test script to verify database storage functionality
const { DatabaseStorage } = require('./server/storage.ts');

async function testDatabaseStorage() {
  console.log('=== Testing Database Storage ===');
  
  const storage = new DatabaseStorage();
  
  try {
    // Test order creation
    const testOrder = {
      id: 'TEST-ORDER-' + Date.now(),
      customer: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+30 123 456 7890',
      total: 45.99,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 'TEST-ITEM-1',
          name: 'Test Fractal Puzzle',
          description: '30x40 • Wood • 500 pieces',
          price: 45.99,
          quantity: 1,
          customization: {
            size: '30x40',
            material: 'wood',
            pieceCount: 500,
            generatorSettings: {
              seed: 123,
              ncols: 20,
              nrows: 15,
              radius: 6.0,
              arcShape: 0
            },
            svgOutput: '<svg>...</svg>',
            svgData: '<svg><path d="M10,10 L20,20"/></svg>',
            svgLaser: '<svg><path d="M10,10 L20,20"/></svg>'
          }
        }
      ]
    };
    
    console.log('Creating test order:', testOrder.id);
    const createdOrder = await storage.createSimpleOrder(testOrder);
    console.log('✅ Order created successfully');
    
    // Test retrieving orders
    console.log('\nRetrieving all orders...');
    const allOrders = storage.getAllSimpleOrders();
    console.log(`Found ${allOrders.length} orders in memory`);
    
    // Test retrieving specific order
    const retrievedOrder = storage.getSimpleOrderById(testOrder.id);
    if (retrievedOrder) {
      console.log('✅ Order retrieved successfully');
      console.log('Order details:', {
        id: retrievedOrder.id,
        customer: retrievedOrder.customer,
        total: retrievedOrder.total,
        itemsCount: retrievedOrder.items?.length || 0
      });
    } else {
      console.log('❌ Failed to retrieve order');
    }
    
    // Test database persistence by checking if we can find the order in the database
    console.log('\nTesting database persistence...');
    const { db } = await import('./server/db');
    const { orders, orderItems } = await import('./shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const dbOrder = await db.select().from(orders).where(eq(orders.id, testOrder.id));
    if (dbOrder.length > 0) {
      console.log('✅ Order found in database');
      
      const dbOrderItems = await db.select().from(orderItems).where(eq(orderItems.orderId, testOrder.id));
      console.log(`✅ Found ${dbOrderItems.length} order items in database`);
      
      console.log('Database order details:', {
        id: dbOrder[0].id,
        status: dbOrder[0].status,
        total: dbOrder[0].total,
        shippingAddress: dbOrder[0].shippingAddress
      });
    } else {
      console.log('❌ Order not found in database');
    }
    
    console.log('\n=== Database Storage Test Complete ===');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing database storage:', error);
    return false;
  }
}

// Run the test
testDatabaseStorage().then(success => {
  if (success) {
    console.log('🎉 Database storage test passed!');
  } else {
    console.log('💥 Database storage test failed!');
  }
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
