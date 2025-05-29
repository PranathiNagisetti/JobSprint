<?php
session_start();

if (!isset($_SESSION['username']) || $_SESSION['type'] !== 'admin') {
    echo "<script>alert('Unauthorized access.'); window.location.href = 'login.html';</script>";
    exit;
}

$host = "localhost";
$dbuser = "root";
$dbpass = "";
$dbname = "jobsprint"; 
$conn = new mysqli($host, $dbuser, $dbpass, $dbname);
if ($conn->connect_error) {
    die("Connection Failed: " . $conn->connect_error);
}

$title = $_POST['title'];
$description = $_POST['description'];
$company = $_POST['company'];
$location = $_POST['location'];
$job_type = $_POST['job_type'];
$apply_link = $_POST['apply_link'];
$salary = $_POST['salary'];

$sql = "INSERT INTO admin_jobs (title, description, company, location, salary, job_type, apply_link) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssss", $title, $description, $company, $location, $salary, $job_type, $apply_link);
if ($stmt->execute()) {
    echo "<script>alert('Job posted successfully!'); window.location.href = 'dashboard.php';</script>";
} else {
    echo "<script>alert('Failed to post job.'); window.history.back();</script>";
}

$conn->close();
?>
