let allJobs = [];
let currentPage = 1;
let hasMoreJobs = true;
const jobsPerPage = 20;
let isViewingBookmarks = false;

document.addEventListener('DOMContentLoaded', () => {
  fetchJobs();

  // Filters
  document.getElementById('searchInput').addEventListener('input', filterJobs);
  document.getElementById('typeFilter').addEventListener('change', filterJobs);
  document.getElementById('locationFilter').addEventListener('input', filterJobs);
  document.getElementById('companyFilter').addEventListener('input', filterJobs);
  document.getElementById('sourceFilter').addEventListener('change', filterJobs);

   // Profile sidebar
  profileBtn.addEventListener('click', () => {
  profileName.textContent = profileData.username;
  profileSidebar.style.width = '300px';
  
});
console.log(profileData);

  closeSidebarBtn.addEventListener('click', () => {
  profileSidebar.style.width = '0';
});

document.getElementById('admin-jobs-btn').addEventListener('click', () => {
  fetch('../auth/get_admin_jobs.php') 
    .then(response => response.json())
    .then(data => {
      displayJobs(data);
      document.getElementById('back-to-all-btn').style.display = 'inline-block';
      document.getElementById('jobsList').style.display = 'none';
      document.getElementById('admin-jobs-container').style.display = 'grid'; 
      document.getElementById('back-to-all-btn').style.display = 'inline-block';
    })
    .catch(err => {
      console.error("Error fetching admin jobs:", err);
      alert("❌ Failed to load admin jobs.");
    });
});

document.getElementById('back-to-all-btn').addEventListener('click', () => {
  document.getElementById('admin-jobs-container').style.display = 'none';
  const jobsList = document.getElementById('jobsList');
  jobsList.style.display = 'grid'; 
  jobsList.className = 'job-listings'; 
  document.getElementById('back-to-all-btn').style.display = 'none';
});

function displayJobs(jobs) {
  const container = document.getElementById("admin-jobs-container");
  container.innerHTML = ""; 

  jobs.forEach(job => {
    const jobElement = document.createElement("div");
    jobElement.className = "job";
    jobElement.innerHTML = `
      <h3>${job.title}</h3>
      <p><strong>Description:</strong> ${job.description}</p>
      <p><strong>Company:</strong> ${job.company}</p>
      <p><strong>Location:</strong> ${job.location}</p>
      <p><strong>Posted At:</strong> ${job.posted_at}</p>
      <p><strong>Type:</strong> ${job.type}</p>
      <p><strong>Apply Link:</strong> <a href="${job.apply_link}" target="_blank">Apply Here</a></p>
    `;
    container.appendChild(jobElement);
  });
}

  // View Bookmarked Jobs


  document.getElementById('clear-bookmarks-btn').addEventListener('click', () => {
    localStorage.removeItem("bookmarkedJobs");
    alert('All bookmarks cleared.');
    const isBookmarkView = document.getElementById('back-to-all-btn').style.display === 'inline-block';
    if (isBookmarkView) {
      renderJobs([], true);
    }
    else {
    renderJobs(allJobs); // <-- this resets the bookmark buttons!
  }
  });
document.getElementById('view-bookmarks-btn').addEventListener('click', () => {
  isViewingBookmarks = true;
  const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
  renderJobs(bookmarks, true);
  document.getElementById('back-to-all-btn').style.display = 'inline-block';
  filterJobs(); // Call filterJobs so that bookmarks are filtered too
});

document.getElementById('back-to-all-btn').addEventListener('click', () => {
  isViewingBookmarks = false;
  renderJobs(allJobs);
  document.getElementById('back-to-all-btn').style.display = 'none';
});

 document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderJobs(filteredJobs);
    window.scrollTo({ top: 0, behavior: 'auto' }); // scroll up smoothly
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderJobs(filteredJobs);
    window.scrollTo({ top: 0, behavior: 'auto' }); // scroll up smoothly
  }
});

  
});

async function fetchJobs() {
  document.getElementById('loadingSpinner').style.display = 'block';
  try {
    const [adzunaJobs, remotiveJobs, arbeitnowJobs] = await Promise.all([
      fetchAdzunaJobsPromise(currentPage),
      fetchRemotiveJobsPromise(),
      fetchArbeitnowJobsPromise()
    ]);
    const interleavedNewJobs = interleaveJobs(adzunaJobs, remotiveJobs, arbeitnowJobs);
    allJobs = [...allJobs, ...interleavedNewJobs];
    renderJobs(allJobs);
    filteredJobs = allJobs;
  } catch (err) {
    console.error("Error fetching jobs:", err);
    document.getElementById("jobsList").innerHTML = "<p>Error loading job data.</p>";
  } finally {
    document.getElementById('loadingSpinner').style.display = 'none';
  }
}

function fetchAdzunaJobsPromise(page = currentPage) {
  const APP_ID = '448dd83c';
  const APP_KEY = 'beb5e9355713db4493d311ef52a1a9bf';
  const baseUrl = 'https://api.adzuna.com/v1/api/jobs/in/search/';
  const url = `${baseUrl}${page}?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=200`;

  return fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.results && Array.isArray(data.results)) {
        hasMoreJobs = !!data.pagination?.next_page;
        return data.results.map(job => ({
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          type: job.contract_type || 'N/A',
          description: job.description,
          apply_link: job.redirect_url,
          source: "Adzuna",
          category: job.category || ''
        }));
      } else {
        return [];
      }
    });
}

function fetchRemotiveJobsPromise() {
  const remotiveUrl = "https://remotive.com/api/remote-jobs";

  return fetch(remotiveUrl)
    .then(res => res.json())
    .then(data => {
      if (!data.jobs) return [];
      return data.jobs.map(job => ({
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location,
        type: job.job_type || 'N/A',
        description: job.description,
        apply_link: job.url,
        source: "Remotive",
        category: job.category || ''
      }));
    });
}

function fetchArbeitnowJobsPromise() {
  const url = 'https://www.arbeitnow.com/api/job-board-api';
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.data) return [];
      return data.data.map(job => ({
      title: job.title || 'N/A',
      company: job.company || 'N/A',
      location: job.location || 'N/A',
      type: job.remote ? 'Remote' : 'Onsite',
      description: job.description || '',
      apply_link: job.url,
      source: 'Arbeitnow',
      category: job.category || ''
}));

    });
}

function stripHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function interleaveJobs(...lists) {
  const maxLength = Math.max(...lists.map(list => list.length));
  const mixed = [];
  for (let i = 0; i < maxLength; i++) {
    for (let list of lists) {
      if (i < list.length) mixed.push(list[i]);
    }
  }
  return mixed;
}

let debounceTimer;
function filterJobs() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage = 1;
    const title = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('typeFilter').value.toLowerCase();
    const location = document.getElementById('locationFilter').value.toLowerCase();
    const company = document.getElementById('companyFilter').value.toLowerCase();
    const source = document.getElementById('sourceFilter').value.toLowerCase();

    const baseList = isViewingBookmarks
      ? (JSON.parse(localStorage.getItem('bookmarkedJobs')) || [])
      : allJobs;

    const filtered = baseList.filter(job => {
      const matchTitle = job.title?.toLowerCase().includes(title);
      const matchType = !type || job.type?.toLowerCase().includes(type);
      const matchLocation = job.location?.toLowerCase().includes(location);
      const matchCompany = job.company?.toLowerCase().includes(company);
      const matchSource = !source || job.source?.toLowerCase().includes(source);

      return matchTitle && matchType && matchLocation && matchCompany && matchSource;
    });
      filteredJobs = filtered;
    renderJobs(filtered, isViewingBookmarks);
  }, 30);
}


function stripHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent?.trim() || '';
}



function renderJobs(jobs, isBookmarkView = false) {
  const container = document.getElementById('jobsList');
  container.innerHTML = '';

  const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];

  if (isBookmarkView) {
    currentPage = 1;
    if (bookmarks.length === 0) {
      container.innerHTML = "<p>No bookmarked jobs yet.</p>";
    } else {
      jobs.forEach(job => {
        const el = document.createElement('div');
        el.className = 'job-item';
        el.style.border = '1px solid #ccc';
        el.style.padding = '15px';
        el.style.marginBottom = '15px';
        el.style.borderRadius = '8px';
        el.style.backgroundColor = '#f9f9f9';

        el.innerHTML = `
          <h3>${job.title}</h3>
          <p><strong>Company:</strong> ${job.company}</p>
          <p><strong>Location:</strong> ${job.location}</p>
          <p><strong>Type:</strong> ${job.type}</p>
          <p><strong>Description:</strong> ${stripHTML(job.description).slice(0, 150)}...</p>
          <p><strong>Source:</strong> ${job.source}</p>
          <a href="${job.apply_link}" target="_blank" style="display: inline-block; margin-top: 10px;">Apply Now</a><br><br>
          <button class="remove-bookmark-btn" data-title="${job.title}" data-company="${job.company}" style="background-color:rgb(206, 120, 111); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">❌ Remove Bookmark</button>
        `;
        container.appendChild(el);
      });
    }

    document.getElementById("prevPage").style.display = 'none';
    document.getElementById("nextPage").style.display = 'none';
    document.getElementById("pageIndicator").style.display = 'none';
    document.getElementById('back-to-all-btn').style.display = 'inline-block';

    // Remove bookmark button handler
    document.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.target.dataset.title;
        const company = e.target.dataset.company;
        const updatedBookmarks = bookmarks.filter(j => !(j.title === title && j.company === company));
        localStorage.setItem('bookmarkedJobs', JSON.stringify(updatedBookmarks));
        renderJobs(updatedBookmarks, true);
      });
    });

  } else {
    // Pagination view
    const start = (currentPage - 1) * jobsPerPage;
    const end = start + jobsPerPage;
    const jobsToDisplay = jobs.slice(start, end);

    if (jobsToDisplay.length === 0) {
      container.innerHTML = '<p>No jobs found.</p>';
      return;
    }

    jobsToDisplay.forEach(job => {
      const isBookmarked = bookmarks.some(j => j.title === job.title && j.company === job.company);
      const el = document.createElement('div');
      el.className = 'job-item';
      el.style.border = '1px solid #ccc';
      el.style.padding = '15px';
      el.style.marginBottom = '15px';
      el.style.borderRadius = '8px';
      el.style.backgroundColor = '#f9f9f9';

      el.innerHTML = `
        <h3>${job.title}</h3>
        <p><strong>Company:</strong> ${job.company}</p>
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Type:</strong> ${job.type}</p>
        <p><strong>Description:</strong> ${stripHTML(job.description).slice(0, 150)}...</p>
        <p><strong>Source:</strong> ${job.source}</p>
        <a href="${job.apply_link}" target="_blank" style="display: inline-block; margin-top: 10px;">Apply Now</a><br><br>
        <button class="bookmark-btn" data-title="${job.title}" data-company="${job.company}" style="background-color: ${isBookmarked ? '#888' : '#2980b9'}; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">
          ${isBookmarked ? '✅ Bookmarked' : '🔖 Bookmark'}
        </button>
      `;
      container.appendChild(el);
    });

    // Pagination controls
    document.getElementById("prevPage").style.display = 'inline-block';
    document.getElementById("nextPage").style.display = 'inline-block';
    document.getElementById("pageIndicator").style.display = 'inline-block';
    document.getElementById("pageIndicator").textContent = `Page ${currentPage}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = end >= jobs.length;
    // Bookmark button handler
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.target.dataset.title;
        const company = e.target.dataset.company;
        const jobToToggle = jobs.find(j => j.title === title && j.company === company);
        const isAlreadyBookmarked = bookmarks.some(j => j.title === title && j.company === company);

        let updatedBookmarks;
        if (isAlreadyBookmarked) {
          updatedBookmarks = bookmarks.filter(j => !(j.title === title && j.company === company));
        } else {
          updatedBookmarks = [...bookmarks, jobToToggle];
        }

        localStorage.setItem('bookmarkedJobs', JSON.stringify(updatedBookmarks));
        renderJobs(jobs); // re-render to reflect bookmark state
      });
    });
  }
}
