<?php
session_start();
header('Content-Type: application/json');
include '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT name, email FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'Prepare failed: '.$conn->error]);
    exit;
}
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(['name' => $row['name'], 'email' => $row['email']]);
} else {
    echo json_encode(['error' => 'User not found']);
}

$stmt->close();
$conn->close();
?>
