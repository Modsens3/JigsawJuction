import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getHealthStatus } from './health';

describe('Health Check Tests', () => {
  test('should get overall health status', async () => {
    const result = await getHealthStatus();
    
    assert(typeof result === 'object', 'Should return an object');
    assert('status' in result, 'Should have status property');
    assert('timestamp' in result, 'Should have timestamp property');
    assert('uptime' in result, 'Should have uptime property');
    assert('version' in result, 'Should have version property');
    assert('environment' in result, 'Should have environment property');
    assert('checks' in result, 'Should have checks property');
    assert(['healthy', 'degraded', 'unhealthy'].includes(result.status), 'Status should be valid');
    
    // Check individual health checks
    assert('database' in result.checks, 'Should have database check');
    assert('disk' in result.checks, 'Should have disk check');
    assert('memory' in result.checks, 'Should have memory check');
    assert('uploads' in result.checks, 'Should have uploads check');
    
    // Validate each check has required properties
    Object.values(result.checks).forEach(check => {
      assert('status' in check, 'Each check should have status');
      assert('message' in check, 'Each check should have message');
      assert(['healthy', 'unhealthy'].includes(check.status), 'Check status should be valid');
    });
  });

  test('should handle health check errors gracefully', async () => {
    // Test that health check doesn't throw unhandled errors
    try {
      await getHealthStatus();
      assert(true, 'Health check should complete without throwing');
    } catch (error) {
      assert.fail(`Health check should not throw: ${error.message}`);
    }
  });
});
