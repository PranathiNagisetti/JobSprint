
<?php
// db.php file to establish a database connection

$host = '127.0.0.1';    // Hostname
$dbname = 'jobsprint';  // Database name
$username = 'root';      // MySQL username
$password = '';          // MySQL password (for XAMPP, it's usually empty by default)

try {
    // Set up the PDO connection
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // If the connection fails, show the error
    echo "Connection failed: " . $e->getMessage();
    exit;
}
?>
