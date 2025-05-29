<?php
session_start();

// Only allow admins
if (!isset($_SESSION['username']) || $_SESSION['type'] !== 'admin') {
    echo "<script>alert('Access denied. Admins only.'); window.location.href = 'login.html';</script>";
    exit;
}

// DB Connection
$host = "localhost";
$dbuser = "root";
$dbpass = "";
$dbname = "jobsprint"; // Replace with your DB name

$conn = new mysqli($host, $dbuser, $dbpass, $dbname);
if ($conn->connect_error) {
    die("Connection Failed: " . $conn->connect_error);
}

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $title = $_POST['title'];
    $description = $_POST['description'];
    $company = $_POST['company'];
    $location = $_POST['location'];
    $salary = $_POST['salary'];
    $job_type = $_POST['job_type'];
    $apply_link = $_POST['apply_link'];
    $stmt = $conn->prepare("INSERT INTO admin_jobs (title, description, company, location, salary, job_type, apply_link) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $title, $description, $company, $location, $salary, $job_type, $apply_link);

    $stmt->execute();
    $stmt->close();
}

// Fetch all jobs
$result = $conn->query("SELECT * FROM admin_jobs ORDER BY id DESC");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard - Post Jobs</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #f4f7f9;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 90%;
            max-width: 1000px;
            margin: 30px auto;
            background: #fff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
        }

        h2 {
            text-align: center;
            margin-bottom: 25px;
            color: #333;
        }

        form input, form textarea {
            width: 100%;
            margin-bottom: 15px;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #ccc;
            font-size: 15px;
        }

        form button {
            width: 100%;
            padding: 12px;
            background-color: #007bff;
            color: white;
            font-size: 16px;
            font-weight: bold;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        form button:hover {
            background-color: #0056b3;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
        }

        table th, table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }

        table th {
            background-color: #f0f0f0;
        }

        .logout {
            float: right;
            text-decoration: none;
            padding: 8px 12px;
            background: #dc3545;
            color: #fff;
            border-radius: 6px;
        }

        .logout:hover {
            background: #c82333;
        }
    </style>
</head>
<body>

<div class="container">
    <a class="logout" href="logout.php">Logout</a>
    <h2>Admin Dashboard - Post a Job</h2>

    <form method="POST" action="">
        <input type="text" name="title" placeholder="Job Title" required>
        <textarea name="description" placeholder="Job Description" rows="4" required></textarea>
        <input type="text" name="company" placeholder="Company Name" required>
        <input type="text" name="location" placeholder="Location" required>
        
        <input type="text" name="job_type" placeholder="Job Type (e.g., Full-time, Intern)" required>
        <input type="url" name="apply_link" placeholder="Application Link (https://...)" required>

        <input type="text" name="salary" placeholder="Salary (Optional)">
        <button type="submit">Add Job</button>
    </form>

    <h2>Posted Jobs</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Company</th>
            <th>Location</th>
            <th>job_type</th>
            <th>apply_link</th>
            <th>Salary</th>
            <th>Posted At</th>
        </tr>
        <?php while($row = $result->fetch_assoc()) { ?>
        <tr>
            <td><?= $row['id'] ?></td>
            <td><?= htmlspecialchars($row['title']) ?></td>
            <td><?= htmlspecialchars($row['company']) ?></td>
            <td><?= htmlspecialchars($row['location']) ?></td>
            <td><?= htmlspecialchars($row['job_type']) ?></td>
            <td><a href="<?= htmlspecialchars($row['apply_link']) ?>" target="_blank">Apply</a></td>

            <td><?= htmlspecialchars($row['salary']) ?></td>
            <td><?= $row['posted_at'] ?></td>
        </tr>
        <?php } ?>
    </table>
</div>

</body>
</html>
