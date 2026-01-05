// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const submitBtn = document.getElementById("submit-btn");
  const copyBtn = document.getElementById("copy-btn");
  const contentTextarea = document.getElementById("content");

  // Initialize event listeners
  if (submitBtn) {
    submitBtn.addEventListener("click", createPaste);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyUrl);
  }

  if (contentTextarea) {
    // Allow Ctrl+Enter to submit
    contentTextarea.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        createPaste();
      }
    });
  }
});

async function createPaste() {
  // Clear previous errors
  clearErrors();

  const content = document.getElementById("content").value.trim();
  const ttl = document.getElementById("ttl").value;
  const maxViews = document.getElementById("max-views").value;

  // Validation
  let valid = true;

  if (!content) {
    showError("content-error", "Content is required");
    valid = false;
  }

  if (ttl && (isNaN(ttl) || parseInt(ttl) < 1)) {
    showError("ttl-error", "TTL must be a number ≥ 1");
    valid = false;
  }

  if (maxViews && (isNaN(maxViews) || parseInt(maxViews) < 1)) {
    showError("max-views-error", "Max views must be a number ≥ 1");
    valid = false;
  }

  if (!valid) return;

  // Prepare data
  const data = {
    content: content,
  };

  if (ttl) data.ttl_seconds = parseInt(ttl);
  if (maxViews) data.max_views = parseInt(maxViews);

  try {
    const response = await fetch("/api/pastes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create paste");
    }

    const result = await response.json();

    // Display result
    const urlDisplay = document.getElementById("url-display");
    const apiUrlDisplay = document.getElementById("api-url");
    const resultDiv = document.getElementById("result");

    urlDisplay.textContent = result.url;
    apiUrlDisplay.textContent = `${window.location.origin}/api/pastes/${result.id}`;
    resultDiv.classList.add("show");

    // Scroll to result
    resultDiv.scrollIntoView({ behavior: "smooth" });

    // Reset form
    document.getElementById("content").value = "";
    document.getElementById("ttl").value = "";
    document.getElementById("max-views").value = "";
  } catch (error) {
    showError("content-error", error.message);
  }
}

function copyUrl() {
  const url = document.getElementById("url-display").textContent;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById("copy-btn");
    const originalText = btn.textContent;
    btn.textContent = "✅ Copied!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.classList.add("show");
  }
}

function clearErrors() {
  const errors = document.querySelectorAll(".error");
  errors.forEach((error) => {
    error.textContent = "";
    error.classList.remove("show");
  });
}
