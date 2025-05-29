<?php
header('Content-Type: application/json');
$host = 'localhost';
$db = 'jobsprint';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

$sql = "SELECT * FROM admin_jobs";
$result = $conn->query($sql);
$jobs = [];

while ($row = $result->fetch_assoc()) {
    $jobs[] = [
        'title' => $row['title'],
        'company' => $row['company'],
        'location' => $row['location'],
        'type' => $row['job_type'],
        'description' => $row['description'],
        'apply_link' => $row['apply_link'],
        'source' => 'Admin'
    ];
}

echo json_encode($jobs);
$conn->close();
?>
