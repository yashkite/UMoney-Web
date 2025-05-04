const { spawn } = require('child_process');
const path = require('path');

describe('Environment Variable Checks', () => {
  test('Application should exit when JWT_SECRET is not set', (done) => {
    // Save the original environment variables
    const originalEnv = process.env;
    
    // Create a modified environment without JWT_SECRET
    const testEnv = { ...originalEnv };
    delete testEnv.JWT_SECRET;
    
    // Spawn a new Node.js process with the modified environment
    const serverProcess = spawn('node', [path.join(__dirname, '../server.js')], {
      env: testEnv,
      stdio: 'pipe'
    });
    
    let output = '';
    
    // Collect output from the process
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    serverProcess.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    // Check if the process exits with an error code
    serverProcess.on('exit', (code) => {
      expect(code).not.toBe(0); // Should exit with non-zero code
      expect(output).toContain('JWT_SECRET'); // Should mention the missing variable
      done();
    });
    
    // Set a timeout to kill the process if it doesn't exit on its own
    setTimeout(() => {
      serverProcess.kill();
      done(new Error('Process did not exit within the expected time'));
    }, 5000);
  });
});
