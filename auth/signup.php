<?php
$host = "localhost";
$dbuser = "root";
$dbpass = "";
$dbname = "jobsprint"; 

$conn = new mysqli($host, $dbuser, $dbpass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$username = $_POST['username'];
$email = $_POST['email'];
$password = $_POST['password'];
$confirm_password = $_POST['confirm_password'];
$type = $_POST['signup_type']; 

if ($password !== $confirm_password) {
    echo "<script>alert('Passwords do not match'); window.history.back();</script>";
    exit;
}

$table = $type === 'admin' ? 'admins' : 'users';

// Check if user already exists
$checkSql = "SELECT * FROM $table WHERE username = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("s", $username);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo "<script>alert('Username already exists'); window.history.back();</script>";
    exit;
}

$sql = "INSERT INTO $table (username, email, password) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $username, $email, $password);

if ($stmt->execute()) {
    echo "<script>alert('Signup successful as $type'); window.location.href = 'login.html';</script>";
} else {
    echo "<script>alert('Signup failed'); window.history.back();</script>";
}

$conn->close();
?>
