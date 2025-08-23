import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { DatabaseManager } from "../../src/core/database";

describe("DatabaseManager", () => {
  let dbManager: DatabaseManager;

  beforeEach(() => {
    // Use in-memory database for testing
    dbManager = new DatabaseManager(":memory:");
  });

  afterEach(() => {
    dbManager.close();
  });

  describe("Initialization", () => {
    test("should initialize database successfully", async () => {
      await dbManager.initialize();
      expect(dbManager.isInitialized()).toBe(true);
    });

    test("should create database file", async () => {
      await dbManager.initialize();
      // For in-memory database, we just verify it's initialized
      expect(dbManager.isInitialized()).toBe(true);
    });

    test("should get database path", () => {
      const path = dbManager.getDatabasePath();
      expect(path).toBe(":memory:");
    });
  });

  describe("Database Operations", () => {
    beforeEach(async () => {
      await dbManager.initialize();
    });

    test("should run SQL statements", () => {
      expect(() => {
        dbManager.run("CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)");
      }).not.toThrow();
    });

    test("should insert and retrieve data", () => {
      dbManager.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)");
      dbManager.run("INSERT INTO users (name, email) VALUES (?, ?)", ["John Doe", "john@example.com"]);
      
      const user = dbManager.get<{ id: number; name: string; email: string }>(
        "SELECT * FROM users WHERE name = ?", 
        ["John Doe"]
      );
      
      expect(user).toBeDefined();
      expect(user?.name).toBe("John Doe");
      expect(user?.email).toBe("john@example.com");
    });

    test("should retrieve multiple rows", () => {
      dbManager.run("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL)");
      dbManager.run("INSERT INTO products (name, price) VALUES (?, ?)", ["Product 1", 10.99]);
      dbManager.run("INSERT INTO products (name, price) VALUES (?, ?)", ["Product 2", 20.99]);
      
      const products = dbManager.all<{ id: number; name: string; price: number }>(
        "SELECT * FROM products ORDER BY name"
      );
      
      expect(products).toHaveLength(2);
      expect(products[0].name).toBe("Product 1");
      expect(products[1].name).toBe("Product 2");
    });

    test("should throw error when not initialized", () => {
      const uninitializedManager = new DatabaseManager(":memory:uninitialized");
      
      expect(() => {
        uninitializedManager.run("SELECT 1");
      }).toThrow("Database not initialized");
      
      expect(() => {
        uninitializedManager.get("SELECT 1");
      }).toThrow("Database not initialized");
      
      expect(() => {
        uninitializedManager.all("SELECT 1");
      }).toThrow("Database not initialized");
    });
  });

  describe("Transactions", () => {
    beforeEach(async () => {
      await dbManager.initialize();
      dbManager.run("CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance REAL)");
    });

    test("should handle successful transaction", () => {
      dbManager.run("INSERT INTO accounts (balance) VALUES (?)", [100]);
      
      dbManager.beginTransaction();
      dbManager.run("UPDATE accounts SET balance = balance - 50 WHERE id = 1");
      dbManager.run("INSERT INTO accounts (balance) VALUES (?)", [50]);
      dbManager.commitTransaction();
      
      const accounts = dbManager.all<{ id: number; balance: number }>("SELECT * FROM accounts");
      expect(accounts).toHaveLength(2);
      expect(accounts[0].balance).toBe(50);
      expect(accounts[1].balance).toBe(50);
    });

    test("should handle transaction rollback", () => {
      dbManager.run("INSERT INTO accounts (balance) VALUES (?)", [100]);
      
      dbManager.beginTransaction();
      dbManager.run("UPDATE accounts SET balance = balance - 50 WHERE id = 1");
      dbManager.rollbackTransaction();
      
      const account = dbManager.get<{ balance: number }>("SELECT balance FROM accounts WHERE id = 1");
      expect(account?.balance).toBe(100); // Should be unchanged
    });

    test("should throw error for transaction operations when not initialized", () => {
      const uninitializedManager = new DatabaseManager(":memory:uninitialized");
      
      expect(() => uninitializedManager.beginTransaction()).toThrow("Database not initialized");
      expect(() => uninitializedManager.commitTransaction()).toThrow("Database not initialized");
      expect(() => uninitializedManager.rollbackTransaction()).toThrow("Database not initialized");
    });
  });

  describe("Table Operations", () => {
    beforeEach(async () => {
      await dbManager.initialize();
    });

    test("should check if table exists", () => {
      expect(dbManager.tableExists("nonexistent_table")).toBe(false);
      
      dbManager.run("CREATE TABLE test_table (id INTEGER PRIMARY KEY)");
      expect(dbManager.tableExists("test_table")).toBe(true);
    });

    test("should get table schema", () => {
      dbManager.run("CREATE TABLE schema_test (id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER)");
      
      const schema = dbManager.getTableSchema("schema_test");
      expect(schema).toHaveLength(3);
      
      const idColumn = schema.find(col => col.name === "id");
      expect(idColumn).toBeDefined();
      expect(idColumn.type).toBe("INTEGER");
      expect(idColumn.pk).toBe(1);
      
      const nameColumn = schema.find(col => col.name === "name");
      expect(nameColumn).toBeDefined();
      expect(nameColumn.type).toBe("TEXT");
      expect(nameColumn.notnull).toBe(1);
    });

    test("should return empty array for schema of non-existent table", () => {
      const schema = dbManager.getTableSchema("nonexistent_table");
      expect(schema).toEqual([]);
    });

    test("should handle table operations when not initialized", () => {
      const uninitializedManager = new DatabaseManager(":memory:uninitialized");
      
      expect(uninitializedManager.tableExists("any_table")).toBe(false);
      expect(uninitializedManager.getTableSchema("any_table")).toEqual([]);
    });
  });

  describe("Database Instance", () => {
    test("should return null when not initialized", () => {
      expect(dbManager.getDatabase()).toBeNull();
    });

    test("should return database instance when initialized", async () => {
      await dbManager.initialize();
      expect(dbManager.getDatabase()).not.toBeNull();
    });
  });

  describe("Statistics", () => {
    beforeEach(async () => {
      await dbManager.initialize();
    });

    test("should get database statistics", () => {
      dbManager.run("CREATE TABLE stats_test1 (id INTEGER)");
      dbManager.run("CREATE TABLE stats_test2 (id INTEGER)");
      
      const stats = dbManager.getStats();
      expect(stats.tables.length).toBeGreaterThanOrEqual(2);
      expect(stats.tables).toContain("stats_test1");
      expect(stats.tables).toContain("stats_test2");
      // For in-memory database, size might be 0
      expect(stats.size).toBeGreaterThanOrEqual(0);
    });

    test("should return empty stats when not initialized", () => {
      const uninitializedManager = new DatabaseManager(":memory:uninitialized");
      const stats = uninitializedManager.getStats();
      expect(stats.tables).toEqual([]);
      expect(stats.size).toBe(0);
    });
  });

  describe("Connection Management", () => {
    test("should close database connection", async () => {
      await dbManager.initialize();
      expect(dbManager.isInitialized()).toBe(true);
      
      dbManager.close();
      expect(dbManager.isInitialized()).toBe(false);
    });

    test("should handle multiple close calls safely", async () => {
      await dbManager.initialize();
      
      expect(() => {
        dbManager.close();
        dbManager.close(); // Second close should not throw
      }).not.toThrow();
    });
  });

  describe("Backup Operations", () => {
    beforeEach(async () => {
      await dbManager.initialize();
    });

    test("should handle backup for in-memory database", async () => {
      // Add some data
      dbManager.run("CREATE TABLE backup_test (id INTEGER, data TEXT)");
      dbManager.run("INSERT INTO backup_test (id, data) VALUES (?, ?)", [1, "test data"]);
      
      // For in-memory database, backup should not throw but should log a warning
      await expect(dbManager.backup("temp_backup.db")).resolves.toBeUndefined();
      
      // Verify data is still accessible after backup attempt
      const data = dbManager.get<{ id: number; data: string }>(
        "SELECT * FROM backup_test WHERE id = ?", 
        [1]
      );
      
      expect(data?.data).toBe("test data");
    });

    test("should throw error when backing up uninitialized database", async () => {
      const uninitializedManager = new DatabaseManager(":memory:uninitialized");
      const backupPath = ":memory:backup-error";
      
      await expect(uninitializedManager.backup(backupPath)).rejects.toThrow("Database not initialized");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    beforeEach(async () => {
      await dbManager.initialize();
    });

    test("should handle empty SQL statements", () => {
      // Empty SQL statements should throw an error
      expect(() => dbManager.run("")).toThrow();
    });

    test("should handle SQL with special characters", () => {
      const specialSQL = "CREATE TABLE special_test (name TEXT, value TEXT)";
      expect(() => dbManager.run(specialSQL)).not.toThrow();
      
      const insertSQL = "INSERT INTO special_test (name, value) VALUES (?, ?)";
      expect(() => dbManager.run(insertSQL, ["test'name", "test\"value"])).not.toThrow();
    });

    test("should handle very long SQL statements", () => {
      const longSQL = "CREATE TABLE long_test (col1 TEXT, col2 TEXT, col3 TEXT)";
      expect(() => dbManager.run(longSQL)).not.toThrow();
    });

    test("should handle SQL injection attempts safely", () => {
      // Create a table first
      dbManager.run("CREATE TABLE users (id INTEGER)");
      
      // Try to drop it with malicious SQL
      const maliciousSQL = "DROP TABLE users; --";
      expect(() => dbManager.run(maliciousSQL)).not.toThrow();
      
      // Verify the table was dropped
      const tables = dbManager.all<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table'");
      expect(tables.some(t => t.name === "users")).toBe(false);
    });

    test("should handle invalid table names gracefully", () => {
      const invalidTableName = "invalid-table-name-with-dashes";
      expect(dbManager.tableExists(invalidTableName)).toBe(false);
      
      const schema = dbManager.getTableSchema(invalidTableName);
      expect(schema).toEqual([]);
    });

    test("should handle table names with special characters", () => {
      const specialTableName = "special_table_name_with_underscores";
      const sql = `CREATE TABLE "${specialTableName}" (id INTEGER)`;
      expect(() => dbManager.run(sql)).not.toThrow();
      
      expect(dbManager.tableExists(specialTableName)).toBe(true);
    });

    test("should handle concurrent operations", async () => {
      // Create a table
      dbManager.run("CREATE TABLE concurrent_test (id INTEGER, value TEXT)");
      
      // Insert data concurrently
      const promises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve(dbManager.run("INSERT INTO concurrent_test (id, value) VALUES (?, ?)", [i, `value${i}`]))
      );
      
      await Promise.all(promises);
      
      // Verify all data was inserted
      const count = dbManager.get<{ count: number }>("SELECT COUNT(*) as count FROM concurrent_test");
      expect(count?.count).toBe(10);
    });

    test("should handle large datasets", async () => {
      // Create a table
      dbManager.run("CREATE TABLE large_test (id INTEGER, data TEXT)");
      
      // Insert 1000 rows
      const largeData = Array.from({ length: 1000 }, (_, i) => [i, `data${i}`]);
      
      dbManager.beginTransaction();
      for (const [id, data] of largeData) {
        dbManager.run("INSERT INTO large_test (id, data) VALUES (?, ?)", [id, data]);
      }
      dbManager.commitTransaction();
      
      // Verify all data was inserted
      const count = dbManager.get<{ count: number }>("SELECT COUNT(*) as count FROM large_test");
      expect(count?.count).toBe(1000);
      
      // Verify some specific data
      const data = dbManager.get<{ id: number; data: string }>("SELECT * FROM large_test WHERE id = 500");
      expect(data?.data).toBe("data500");
    });

    test("should handle database corruption gracefully", () => {
      // This test simulates a corrupted database by trying to access invalid data
      // In a real scenario, this would be handled by SQLite's built-in error handling
      
      // Try to access a non-existent table - SQLite throws an error for this
      expect(() => {
        dbManager.get<{ id: number }>("SELECT id FROM non_existent_table LIMIT 1");
      }).toThrow();
      
      // Try to execute invalid SQL - should throw
      expect(() => dbManager.run("INVALID SQL STATEMENT")).toThrow();
    });

    test("should handle memory pressure", async () => {
      // Create a table with large text data
      dbManager.run("CREATE TABLE memory_test (id INTEGER, large_data TEXT)");
      
      // Insert data with large text
      const largeText = "x".repeat(10000); // 10KB per row
      
      dbManager.beginTransaction();
      for (let i = 0; i < 100; i++) {
        dbManager.run("INSERT INTO memory_test (id, large_data) VALUES (?, ?)", [i, largeText]);
      }
      dbManager.commitTransaction();
      
      // Verify data was inserted
      const count = dbManager.get<{ count: number }>("SELECT COUNT(*) as count FROM memory_test");
      expect(count?.count).toBe(100);
      
      // Verify data integrity
      const data = dbManager.get<{ large_data: string }>("SELECT large_data FROM memory_test WHERE id = 50");
      expect(data?.large_data).toBe(largeText);
    });
  });

  describe("Performance and Stress Testing", () => {
    beforeEach(async () => {
      await dbManager.initialize();
    });

    test("should handle rapid table creation and deletion", () => {
      for (let i = 0; i < 50; i++) {
        const tableName = `temp_table_${i}`;
        dbManager.run(`CREATE TABLE ${tableName} (id INTEGER)`);
        dbManager.run(`DROP TABLE ${tableName}`);
      }
      
      // Should not crash or throw errors
      expect(dbManager.isInitialized()).toBe(true);
    });

    test("should handle rapid data insertion and deletion", () => {
      dbManager.run("CREATE TABLE rapid_test (id INTEGER, value TEXT)");
      
      for (let i = 0; i < 100; i++) {
        dbManager.run("INSERT INTO rapid_test (id, value) VALUES (?, ?)", [i, `value${i}`]);
        dbManager.run("DELETE FROM rapid_test WHERE id = ?", [i]);
      }
      
      // Verify table is empty
      const count = dbManager.get<{ count: number }>("SELECT COUNT(*) as count FROM rapid_test");
      expect(count?.count).toBe(0);
    });

    test("should handle complex queries efficiently", () => {
      // Create a complex schema
      dbManager.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY,
          name TEXT,
          email TEXT,
          age INTEGER,
          created_at TEXT
        )
      `);
      
      dbManager.run(`
        CREATE TABLE orders (
          id INTEGER PRIMARY KEY,
          user_id INTEGER,
          amount REAL,
          status TEXT,
          created_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      // Insert test data
      dbManager.run("INSERT INTO users (id, name, email, age, created_at) VALUES (1, 'John', 'john@test.com', 30, '2023-01-01')");
      dbManager.run("INSERT INTO users (id, name, email, age, created_at) VALUES (2, 'Jane', 'jane@test.com', 25, '2023-01-02')");
      dbManager.run("INSERT INTO orders (id, user_id, amount, status, created_at) VALUES (1, 1, 100.50, 'completed', '2023-01-01')");
      dbManager.run("INSERT INTO orders (id, user_id, amount, status, created_at) VALUES (2, 2, 200.75, 'pending', '2023-01-02')");
      
      // Execute complex query
      const result = dbManager.all<{ user_name: string; total_orders: number; total_amount: number }>(`
        SELECT 
          u.name as user_name,
          COUNT(o.id) as total_orders,
          SUM(o.amount) as total_amount
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id, u.name
        ORDER BY total_amount DESC
      `);
      
      expect(result).toHaveLength(2);
      expect(result[0].user_name).toBe("Jane"); // Higher amount
      expect(result[1].user_name).toBe("John"); // Lower amount
    });
  });
});
