<?php
header('Content-Type: application/json');
require_once('../config/db.php'); // Updated path to db.php

try {
    $stmt = $db->prepare("SELECT * FROM jobs ORDER BY posted_at DESC");
    $stmt->execute();
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $jobs
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch jobs: ' . $e->getMessage()
    ]);
}
?>
