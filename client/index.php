<?php
session_start();
if (!isset($_SESSION['username'])) {
    header("Location: ../auth/login.html");
    exit();
}
$username = $_SESSION['username'];
$email = isset($_SESSION['email']) ? $_SESSION['email'] : 'Not available';

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Job Listings</title>
  <link rel="stylesheet" href="style.css">
  <script src="app.js" defer></script>
  <script>
  const profileData = {
    username: "<?php echo htmlspecialchars($username); ?>",
    email: "<?php echo htmlspecialchars($email); ?>"
  };
</script>

</head>
<body>
  <header>
    <div class="header">
      <img src="logo.png" class="logo" alt="JobSprint Logo">
      <div class="title-block">
        <h1 class="title" style="font-size: 80px;">JOBSPRINT</h1>
        <p class="subtitle">Find your next opportunity</p>
      </div>
    </div>
        
  </header>

  <div class="search-bar">
    <input type="text" id="searchInput" placeholder="Search by title (e.g., Developer)">
    <select id="typeFilter">
      <option value="">All Types</option>
      <option value="Permanent">Permanent</option>
      <option value="Full_time">Full-time</option>
      <option value="Internship">Internship</option>
      <option value="Contract">Contract</option>
      <option value="N/A">N/A</option>
    </select>
    <input type="text" id="companyFilter" placeholder="Filter by company (e.g., Google)">
    <input type="text" id="locationFilter" placeholder="Filter by location (e.g., Hyderabad)">
    <select id="sourceFilter">
      <option value="">All Sources</option>
      <option value="adzuna">Adzuna</option>
      <option value="remotive">Remotive</option>
      <option value="arbeitnow">Arbeitnow</option>
    </select>
    
    <button id="view-bookmarks-btn" style="font-size=12px">View Bookmarked Jobs</button>
    <button id="clear-bookmarks-btn">Clear All Bookmarks</button>
    <button id="back-to-all-btn" style="display: none;">⬅ Back to All Jobs</button>
    
    <button id="admin-jobs-btn">Show Admin Jobs</button>
    
    
    <div class="profile-section" style="display:inline-block; margin-left: 20px;">
      <button id="profileBtn" style="background:none; border:none; cursor:pointer;">
        <img src="images.png" alt="Profile" style="width:40px; height:40px; border-radius:50%;">
      </button>
      <a href="../auth/logout.php" style="margin-left: 10px;">Logout</a>
    </div>


<!-- Sidebar -->
    <div id="profileSidebar" class="sidebar">
      <div class="sidebar-content">
        <h3 id="profileName">Loading...</h3>
        <p id="profileEmail"></p>
        <button id="changePasswordBtn">Change Password</button>
        <div id="changePasswordSection" style="display: none; margin-top: 10px;">
        <!-- Change Password Form -->
        <h2 >Change Password</h2><br>
        <form id="changePasswordForm" action="../profile/change_password.php" method="POST">
          <div class="input-group">
            <i class='bx bxs-lock-alt'></i>
            <input type="password" name="current_password" placeholder="Current Password" required>
          </div>
          <br>
          <div class="input-group">
            <i class='bx bxs-lock-alt'></i>
            <input type="password" name="new_password" placeholder="New Password" required>
          </div><br>
          <div class="input-group">
            <i class='bx bxs-lock-alt'></i>
            <input type="password" name="confirm_password" placeholder="Confirm New Password" required>
          </div><br>
          <button type="submit">Change Password</button>
  
        </form>
      <div id="changePasswordMsg"></div>

      </div>
      <br>
        <button id="closeSidebarBtn">Close</button>
      </div>
    </div>
    
  </div>




  <div id="jobsList" class="job-listings"></div>
  <div id="admin-jobs-container" class="job-listings" style="display:none;"></div>

  <div id="loadingSpinner" style="display:none;"><b>Loading...</b></div>
  <div id="paginationControls" style="text-align:center; margin-top: 20px;">
    <button id="prevPage" disabled>Prev</button>
    <span id="pageIndicator">Page 1</span>
    <button id="nextPage">Next</button>
  </div>
  
  <script>
  document.addEventListener('DOMContentLoaded', () => {
  const profileBtn = document.getElementById('profileBtn');
  const sidebar = document.getElementById('profileSidebar');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const changePasswordSection = document.getElementById('changePasswordSection');

  // Show profile sidebar
  profileBtn.addEventListener('click', () => {
    sidebar.style.display = 'block';
    document.getElementById('profileName').innerText = profileData.username;
    document.getElementById('profileEmail').innerText = profileData.email;
  });

  // Hide profile sidebar
  closeSidebarBtn.addEventListener('click', () => {
    sidebar.style.display = 'none';
    changePasswordSection.style.display = 'none'; // hide form if open
    changePasswordBtn.style.display = 'inline-block'; // show the button again
  });

  // Toggle password form visibility
  changePasswordBtn.addEventListener('click', () => {
    changePasswordBtn.style.display='none';
    changePasswordSection.style.display = 
      changePasswordSection.style.display === 'none' ? 'block' : 'none';
  });
});
</script>

</body>
</html>