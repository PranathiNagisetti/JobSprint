let allJobs = [];
let currentPage = 1; // Variable to track the current page
let hasMoreJobs = true; // Flag to check if there are more jobs to load
const jobsPerPage = 20;
document.addEventListener('DOMContentLoaded', () => {
  fetchJobs(); // Load jobs on page load

  // Filters
  document.getElementById('searchInput').addEventListener('input', filterJobs);
  document.getElementById('typeFilter').addEventListener('change', filterJobs);
  document.getElementById('locationFilter').addEventListener('input', filterJobs);
  document.getElementById('companyFilter').addEventListener('input', filterJobs);
  document.getElementById('sourceFilter').addEventListener('change', filterJobs);
  // View Bookmarked Jobs
  document.getElementById('view-bookmarks-btn').addEventListener('click', () => {
    // Clear any active filters before viewing bookmarks
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('companyFilter').value = '';
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
    if (bookmarks.length === 0) {
      document.getElementById('jobsList').innerHTML = "<p>No bookmarked jobs yet.</p>";
    } else {
      renderJobs(bookmarks, true); // true => viewing bookmarks
    }
  });
});

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderJobs(allJobs);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if ((currentPage * jobsPerPage) < allJobs.length) {
    currentPage++;
    renderJobs(allJobs);
  }
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

    // Append to existing jobs
    allJobs = [...allJobs, ...interleavedNewJobs];

    renderJobs(allJobs);
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
        if (data.pagination && data.pagination.next_page) {
          currentPage = data.pagination.next_page;
          hasMoreJobs = true;
        } else {
          hasMoreJobs = false;
        }

        return data.results.map(job => ({
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          type: job.contract_type || 'N/A',
          description: job.description,
          apply_link: job.redirect_url,
          source: "Adzuna",
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
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.remote ? 'Remote' : 'Onsite',
        description: job.description || '',
        apply_link: job.url,
        source: 'Arbeitnow',
      }));
    });
}

function stripHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function addLoadMoreButton() {
  if (!hasMoreJobs) return; // Don't add button if no more jobs
  const container = document.getElementById('jobsList');
  let loadMoreBtn = document.querySelector('#loadMoreBtn');

  if (!loadMoreBtn) {
    loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'loadMoreBtn';
    loadMoreBtn.innerText = 'Load More Jobs';
    loadMoreBtn.addEventListener('click', () => {
     
      fetchJobs();
    });
    
    container.appendChild(loadMoreBtn);
  }
}

function removeLoadMoreButton() {
  const loadMoreBtn = document.querySelector('#loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.remove();
  }
}

let debounceTimer;
function filterJobs() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    displayedJobsCount = 0;
    const title = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('typeFilter').value.toLowerCase();
    const location = document.getElementById('locationFilter').value.toLowerCase();
    const company = document.getElementById('companyFilter').value.toLowerCase();
    const source = document.getElementById('sourceFilter').value.toLowerCase();

    const filtered = allJobs.filter(job => {
      const matchTitle = job.title?.toLowerCase().includes(title);
      const matchType = !type || job.type?.toLowerCase().includes(type);
      const matchLocation = job.location?.toLowerCase().includes(location);
      const matchCompany = job.company?.toLowerCase().includes(company);
      const matchSource = !source || job.source.toLowerCase().includes(source);
      return matchTitle && matchType && matchLocation && matchCompany && matchSource;
    });

    renderJobs(filtered);
  }, 30);
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

function renderJobs(jobs, isBookmarkView = false) {
  const container = document.getElementById('jobsList');
  container.innerHTML = '';

  if (jobs.length === 0) {
    container.innerHTML = '<p>No jobs found.</p>';
    return;
  }

  const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
  const start = (currentPage - 1) * jobsPerPage;
  const end = start + jobsPerPage;
  const jobsToDisplay = jobs.slice(start, end);
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
      <p><strong>source:</strong> ${job.source}</p>
      <a href="${job.apply_link}" target="_blank" style="display: inline-block; margin-top: 10px;">Apply Now</a><br><br>
      ${
        isBookmarkView
          ? `<button class="remove-bookmark-btn" data-title="${job.title}" data-company="${job.company}" style="background-color:rgb(206, 120, 111); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">❌ Remove Bookmark</button>`
          : `<button class="bookmark-btn" data-title="${job.title}" data-company="${job.company}" style="background-color: ${isBookmarked ? '#888' : '#2980b9'}; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: ${isBookmarked ? 'not-allowed' : 'pointer'};" ${isBookmarked ? 'disabled' : ''}>
              ${isBookmarked ? '✅ Bookmarked' : '🔖 Bookmark'}
            </button>`
      }
    `;
    container.appendChild(el);
  });

  // Pagination controls update
  document.getElementById("pageIndicator").innerText = `Page ${currentPage}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = end >= jobs.length;
  

  // 📌 Bookmark Button Handler
    document.querySelectorAll('.bookmark-btn:not([disabled])').forEach(button => {
    button.addEventListener('click', () => {
            const title = button.getAttribute('data-title');
      const company = button.getAttribute('data-company');
      const jobToBookmark = allJobs.find(job => job.title === title && job.company === company);
      if (!jobToBookmark) return;

      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
      bookmarks.push(jobToBookmark);
      localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarks));

      button.innerText = '✅ Bookmarked';
      button.disabled = true;
      button.style.backgroundColor = '#888';
      button.style.cursor = 'not-allowed';
    });
  });

  // ❌ Remove Bookmark Button Handler
  document.querySelectorAll('.remove-bookmark-btn').forEach(button => {
    button.addEventListener('click', () => {
      const title = button.getAttribute('data-title');
      const company = button.getAttribute('data-company');
      let bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
      bookmarks = bookmarks.filter(job => !(job.title === title && job.company === company));
      localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarks));
      // Refresh the view
      const updatedBookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
      renderJobs(updatedBookmarks, true);
    });
  });

  // Load More Button
  if (!isBookmarkView) {
    removeLoadMoreButton(); // Avoid duplicates
    addLoadMoreButton(); // If needed
  } else {
    removeLoadMoreButton(); // No "Load More" in bookmark view
  }
}




function saveBookmark(job) {
  let bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
  if (!bookmarks.some(j => j.title === job.title && j.company === job.company)) {
    bookmarks.push(job);
    localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarks));
  }
}

function removeBookmark(title, company) {
  let bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
  bookmarks = bookmarks.filter(job => !(job.title === title && job.company === company));
  localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarks));
  alert('Bookmark removed!');
  renderJobs(bookmarks, true); // Re-render bookmarks
}

window.scrollTo({
  top: 0,
  behavior: 'smooth' // use 'auto' for instant scroll
});
