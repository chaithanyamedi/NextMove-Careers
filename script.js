const jobs = [
    { title: "Front-End Developer", company: "Tech Solutions", location: "Hyderabad", salary: "₹3–5 LPA", type: "Full-time" },
    { title: "Java Developer", company: "CodeWorks", location: "Bengaluru", salary: "₹4–6 LPA", type: "Full-time" },
    { title: "Web Development Intern", company: "Digital World", location: "Hyderabad", salary: "₹10,000/month", type: "Internship" },
    { title: "UI Developer", company: "Creative Tech", location: "Chennai", salary: "₹3–4 LPA", type: "Full-time" },
    { title: "Part-Time Web Designer", company: "Design Hub", location: "Mumbai", salary: "₹15,000/month", type: "Part-time" },
    { title: "React Developer Intern", company: "WebCraft", location: "Pune", salary: "₹12,000/month", type: "Internship" }
];

const jobList = document.getElementById("jobList");
const noResults = document.getElementById("noResults");
const resultCount = document.getElementById("resultCount");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const locationInput = document.getElementById("locationInput");
const jobTypeFilter = document.getElementById("jobTypeFilter");
const applicationDialog = document.getElementById("applicationDialog");
const applicationForm = document.getElementById("applicationForm");
const applicationRole = document.getElementById("applicationRole");
const applicationNotice = document.getElementById("applicationNotice");
const resumeFile = document.getElementById("resumeFile");
const resumeDropzone = document.getElementById("resumeDropzone");
const resumePrompt = document.getElementById("resumePrompt");
const resumeError = document.getElementById("resumeError");
const logoColors = [
    ["#e5efe8", "#285942"],
    ["#e8edf4", "#405c82"],
    ["#f5e9df", "#9a5b35"],
    ["#eee9f3", "#66527d"],
    ["#f5edda", "#806a32"],
    ["#e2eff0", "#326b70"]
];
const savedJobsKey = "jobfinder-saved-jobs";
const applicantProfileKey = "jobfinder-applicant-profile";
const applicationsKey = "jobfinder-applications";
let activeJob = null;

function readSavedJobs() {
    try {
        return new Set(JSON.parse(localStorage.getItem(savedJobsKey) || "[]"));
    } catch {
        return new Set();
    }
}

const savedJobs = readSavedJobs();

function saveJobs() {
    try {
        localStorage.setItem(savedJobsKey, JSON.stringify(Array.from(savedJobs)));
    } catch {
        return;
    }
}

function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    if (text) element.textContent = text;
    return element;
}

function displayJobs(jobArray) {
    jobList.replaceChildren();
    noResults.hidden = jobArray.length > 0;
    resultCount.textContent = jobArray.length + (jobArray.length === 1 ? " opportunity" : " opportunities");

    jobArray.forEach(function(job) {
        const jobIndex = jobs.indexOf(job);
        const card = makeElement("article", "job-card");
        card.style.animationDelay = Math.min(jobIndex * 55, 275) + "ms";

        const top = makeElement("div", "job-card-top");
        const [markBackground, markColor] = logoColors[jobIndex % logoColors.length];
        const initials = job.company.includes(" ")
            ? job.company.split(/\s+/).map(function(word) { return word[0]; }).join("").slice(0, 2)
            : job.company.slice(0, 2).toUpperCase();
        const companyMark = makeElement("span", "company-mark", initials);
        companyMark.setAttribute("aria-hidden", "true");
        companyMark.style.setProperty("--mark-bg", markBackground);
        companyMark.style.setProperty("--mark-ink", markColor);
        top.append(companyMark, makeElement("p", "company-name", job.company));

        const title = makeElement("h3", "", job.title);
        const details = makeElement("div", "job-details");
        const location = makeElement("span", "", job.location);
        location.prepend(makeElement("i", "detail-dot"));
        const salary = makeElement("span", "", job.salary);
        salary.prepend(makeElement("i", "detail-dot"));
        details.append(location, salary);

        const bottom = makeElement("div", "job-card-bottom");
        bottom.appendChild(makeElement("span", "job-type", job.type));
        const actions = makeElement("div", "job-actions");
        const saveButton = makeElement("button", "save-button", savedJobs.has(job.title) ? "★" : "☆");
        saveButton.type = "button";
        saveButton.classList.toggle("saved", savedJobs.has(job.title));
        saveButton.setAttribute("aria-label", (savedJobs.has(job.title) ? "Remove saved job: " : "Save job: ") + job.title);
        saveButton.setAttribute("aria-pressed", String(savedJobs.has(job.title)));
        saveButton.addEventListener("click", function() {
            if (savedJobs.has(job.title)) savedJobs.delete(job.title);
            else savedJobs.add(job.title);
            saveJobs();
            displayJobs(jobArray);
        });

        const applyButton = makeElement("button", "apply-button", "Apply now");
        applyButton.type = "button";
        applyButton.addEventListener("click", function() {
            openApplication(job);
        });

        actions.append(saveButton, applyButton);
        bottom.appendChild(actions);
        card.append(top, title, details, bottom);
        jobList.appendChild(card);
    });
}

function readStoredObject(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) || "null") || fallback;
    } catch {
        return fallback;
    }
}

function openApplication(job) {
    activeJob = job;
    applicationForm.reset();
    resumeError.hidden = true;
    resumeDropzone.classList.remove("has-file", "has-error");
    resumePrompt.innerHTML = "<strong>Choose a file</strong> or drag it here";
    applicationNotice.textContent = "Demo mode: submissions are saved only in this browser and are not sent to HR.";
    applicationNotice.classList.remove("notice-success", "notice-error");
    applicationRole.textContent = job.title + " at " + job.company + " · " + job.location;

    const profile = readStoredObject(applicantProfileKey, {});
    ["name", "email", "phone"].forEach(function(fieldName) {
        applicationForm.elements[fieldName].value = profile[fieldName] || "";
    });

    applicationDialog.showModal();
    applicationForm.elements.name.focus();
}

function updateResume(file) {
    const allowedExtension = /\.(pdf|doc|docx)$/i.test(file.name);
    const withinSizeLimit = file.size <= 5 * 1024 * 1024;
    if (!allowedExtension || !withinSizeLimit) {
        resumeFile.value = "";
        resumeError.textContent = !allowedExtension
            ? "Choose a PDF, DOC, or DOCX file."
            : "The resume must be 5 MB or smaller.";
        resumeError.hidden = false;
        resumeDropzone.classList.add("has-error");
        resumeDropzone.classList.remove("has-file");
        resumePrompt.innerHTML = "<strong>Choose a file</strong> or drag it here";
        return false;
    }

    resumeError.hidden = true;
    resumeDropzone.classList.remove("has-error");
    resumeDropzone.classList.add("has-file");
    resumePrompt.textContent = file.name;
    return true;
}

applicationForm.addEventListener("input", function(event) {
    if (!["name", "email", "phone"].includes(event.target.name)) return;
    const profile = {
        name: applicationForm.elements.name.value.trim(),
        email: applicationForm.elements.email.value.trim(),
        phone: applicationForm.elements.phone.value.trim()
    };
    try {
        localStorage.setItem(applicantProfileKey, JSON.stringify(profile));
    } catch {
        return;
    }
});

document.getElementById("closeApplication").addEventListener("click", function() {
    applicationDialog.close();
});

resumeFile.addEventListener("change", function() {
    if (resumeFile.files[0]) updateResume(resumeFile.files[0]);
});

resumeDropzone.addEventListener("keydown", function(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        resumeFile.click();
    }
});

["dragenter", "dragover"].forEach(function(eventName) {
    resumeDropzone.addEventListener(eventName, function(event) {
        event.preventDefault();
        resumeDropzone.classList.add("is-dragging");
    });
});

["dragleave", "drop"].forEach(function(eventName) {
    resumeDropzone.addEventListener(eventName, function(event) {
        event.preventDefault();
        resumeDropzone.classList.remove("is-dragging");
    });
});

resumeDropzone.addEventListener("drop", function(event) {
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    resumeFile.files = transfer.files;
    updateResume(file);
});

applicationForm.addEventListener("submit", function(event) {
    event.preventDefault();
    if (!applicationForm.reportValidity()) return;
    const file = resumeFile.files[0];
    if (!file || !updateResume(file)) return;

    const formData = new FormData(applicationForm);
    const application = {
        jobTitle: activeJob.title,
        company: activeJob.company,
        name: formData.get("name").trim(),
        email: formData.get("email").trim(),
        phone: formData.get("phone").trim(),
        resumeFileName: file.name,
        coverLetter: formData.get("coverLetter").trim(),
        submittedAt: new Date().toISOString()
    };

    try {
        const applications = readStoredObject(applicationsKey, []);
        applications.push(application);
        localStorage.setItem(applicationsKey, JSON.stringify(applications));
        applicationNotice.textContent = "Saved on this device for demo purposes. Your application and resume were not sent to HR.";
        applicationNotice.classList.add("notice-success");
        applicationNotice.classList.remove("notice-error");
    } catch {
        applicationNotice.textContent = "Could not save this application in the browser. Nothing was sent to HR.";
        applicationNotice.classList.add("notice-error");
        applicationNotice.classList.remove("notice-success");
    }
});

applicationDialog.addEventListener("click", function(event) {
    if (event.target === applicationDialog) applicationDialog.close();
});

function searchJobs() {
    const keyword = searchInput.value.trim().toLowerCase();
    const location = locationInput.value.trim().toLowerCase();
    const type = jobTypeFilter.value;
    const filteredJobs = jobs.filter(function(job) {
        const matchesKeyword = job.title.toLowerCase().includes(keyword) || job.company.toLowerCase().includes(keyword);
        const matchesLocation = job.location.toLowerCase().includes(location);
        const matchesType = type === "" || job.type === type;
        return matchesKeyword && matchesLocation && matchesType;
    });

    displayJobs(filteredJobs);
}

searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    searchJobs();
    document.getElementById("jobs").scrollIntoView({ behavior: "smooth", block: "start" });
});

searchInput.addEventListener("input", searchJobs);
locationInput.addEventListener("input", searchJobs);
jobTypeFilter.addEventListener("change", searchJobs);

document.querySelectorAll(".quick-search").forEach(function(button) {
    button.addEventListener("click", function() {
        if (button.dataset.search) searchInput.value = button.dataset.search;
        if (button.dataset.location) locationInput.value = button.dataset.location;
        searchJobs();
        document.getElementById("jobs").scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

document.getElementById("clearSearch").addEventListener("click", function() {
    searchInput.value = "";
    locationInput.value = "";
    jobTypeFilter.value = "";
    searchJobs();
    searchInput.focus();
});

displayJobs(jobs);