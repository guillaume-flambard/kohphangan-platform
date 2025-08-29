<?php
// Simple script to fix production database constraint
$dbPath = '/var/www/html/database/database.sqlite';

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to database\n";

    // Start transaction
    $pdo->beginTransaction();

    // Get current table structure
    $currentData = $pdo->query("SELECT * FROM tickets")->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($currentData) . " existing tickets\n";

    // Create new table with correct constraint
    $pdo->exec("
        CREATE TABLE tickets_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_number VARCHAR(255) UNIQUE NOT NULL,
            event_name VARCHAR(255) DEFAULT 'Waterfall Party Echo' NOT NULL,
            attendee_name VARCHAR(255) NOT NULL,
            attendee_email VARCHAR(255) NOT NULL,
            attendee_phone VARCHAR(255),
            price DECIMAL(8,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'THB' NOT NULL,
            payment_method VARCHAR(255) CHECK (payment_method IN ('cash', 'omise')) DEFAULT 'omise' NOT NULL,
            payment_status VARCHAR(255) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending' NOT NULL,
            tab_payment_id VARCHAR(255),
            qr_code TEXT NOT NULL,
            status VARCHAR(255) CHECK (status IN ('active', 'used', 'cancelled')) DEFAULT 'active' NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
        )
    ");
    echo "Created new table\n";

    // Copy existing data (only cash payments if any)
    foreach ($currentData as $row) {
        if ($row['payment_method'] === 'cash') {
            $stmt = $pdo->prepare("
                INSERT INTO tickets_new 
                (id, ticket_number, event_name, attendee_name, attendee_email, attendee_phone, 
                 price, currency, payment_method, payment_status, tab_payment_id, qr_code, 
                 status, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute(array_values($row));
        }
    }
    echo "Copied existing data\n";

    // Drop old table and rename new one
    $pdo->exec("DROP TABLE tickets");
    $pdo->exec("ALTER TABLE tickets_new RENAME TO tickets");
    echo "Renamed tables\n";

    // Recreate indexes
    $pdo->exec("CREATE INDEX idx_tickets_attendee_email ON tickets(attendee_email)");
    $pdo->exec("CREATE INDEX idx_tickets_payment_status ON tickets(payment_status)");
    $pdo->exec("CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number)");
    echo "Created indexes\n";

    // Commit transaction
    $pdo->commit();
    echo "Database schema updated successfully!\n";

} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>