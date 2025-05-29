<?php
include '../config/db.php'; 

header('Content-Type: application/json');

// Fetch admin jobs
$sql = "SELECT * FROM admin_jobs ORDER BY posted_at DESC"; // adjust column names based on your table
$result = mysqli_query($conn, $sql);

$jobs = [];
while ($row = mysqli_fetch_assoc($result)) {
    $jobs[] = $row;
}

echo json_encode($jobs);
?>
