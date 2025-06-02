<?php
session_start();
$host = "localhost";
$dbuser = "root";
$dbpass = "";
$dbname = "jobsprint";

$conn = new mysqli($host, $dbuser, $dbpass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$username = $_POST['username'];
$password = $_POST['password'];
$type = $_POST['login_type']; 

$table = $type === 'admin' ? 'admins' : 'users';

$sql = "SELECT * FROM $table WHERE username = ? AND password = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $_SESSION['username'] = $username;
    $_SESSION['type'] = $type;
    if ($type === 'admin') {
        echo "<script>alert('Login successful as Admin'); window.location.href = 'admin_dashboard.php';</script>";
    } elseif ($type === 'user') {
        echo "<script>alert('Login successful as User'); window.location.href = '../client/index.php';</script>";
    }
} else {
    echo "<script>alert('Invalid credentials for $type'); window.history.back();</script>";
}

$conn->close();
?>
