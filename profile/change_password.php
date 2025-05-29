<?php
session_start();
include '../config/db.php'; 

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    echo "❌ You must be logged in to change your password.";
    exit();
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_SESSION['username'];
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];

    // Check if new passwords match
    if ($new_password !== $confirm_password) {
        echo "<script>alert('❌ New passwords do not match.'); window.history.back();</script>";
        exit();
    }

    // Fetch current password from DB (not hashed)
    $sql = "SELECT password FROM users WHERE username = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 's', $username);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user = mysqli_fetch_assoc($result);

    // Compare current password directly
    if (!$user || $current_password !== $user['password']) {
        echo "<script>alert('❌ Current password is incorrect.'); window.history.back();</script>";
        exit();
    }

    // Update password in DB (plain text)
    $update_sql = "UPDATE users SET password = ? WHERE username = ?";
    $update_stmt = mysqli_prepare($conn, $update_sql);
    mysqli_stmt_bind_param($update_stmt, 'ss', $new_password, $username);

    if (mysqli_stmt_execute($update_stmt)) {
        echo "<script>alert('✅ Password changed successfully.'); window.location.href = '../client/index.php';</script>";
    } else {
        echo "<script>alert('❌ Failed to update password.'); window.history.back();</script>";
    }

    // Cleanup
    mysqli_stmt_close($stmt);
    mysqli_stmt_close($update_stmt);
    mysqli_close($conn);
} else {
    header("Location: ../index.php");
    exit();
}
