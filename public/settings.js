// Get elements
const profileImage = document.getElementById('profile-image');
const profileImg = document.getElementById('profile-img');
const profileInitial = document.getElementById('profile-initial');
const changePhotoBtn = document.getElementById('change-photo-btn');
const photoInput = document.getElementById('photo-input');
const userNameDisplay = document.getElementById('user-name-display');
const userEmailDisplay = document.getElementById('user-email-display');
const nameInput = document.getElementById('s-name');
const emailInput = document.getElementById('s-email');
const joinedInput = document.getElementById('s-joined');
const saveProfileBtn = document.getElementById('save-profile');
const logoutBtn = document.getElementById('logout-btn');
const changePasswordBtn = document.getElementById('change-password-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');

// Get token
function getToken() {
  return localStorage.getItem('token');
}

// Load user data
async function loadUserData() {
  try {
    const res = await fetch('/api/me', {
      headers: { Authorization: 'Bearer ' + getToken() }
    });

    if (!res.ok) {
      location.href = '/login.html';
      return;
    }

    const data = await res.json();
    const user = data.user;

    // Update displays
    userNameDisplay.textContent = user.name;
    userEmailDisplay.textContent = user.email;
    nameInput.value = user.name;
    emailInput.value = user.email;

    // Set initial
    profileInitial.textContent = user.name.charAt(0).toUpperCase();

    // Set joined date (if available)
    if (user.createdAt) {
      const date = new Date(user.createdAt);
      joinedInput.value = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      joinedInput.value = 'Recently';
    }

    // Load profile image from localStorage
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      profileImg.src = savedImage;
      profileImg.style.display = 'block';
      profileInitial.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    alert('Failed to load user data');
  }
}

// Change photo
changePhotoBtn.addEventListener('click', () => {
  photoInput.click();
});

photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return;
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  // Read and display image
  const reader = new FileReader();
  reader.onload = (event) => {
    const imageData = event.target.result;
    profileImg.src = imageData;
    profileImg.style.display = 'block';
    profileInitial.style.display = 'none';

    // Save to localStorage
    localStorage.setItem('profileImage', imageData);

    // Show success message
    showNotification('Profile photo updated!', 'success');
  };
  reader.readAsDataURL(file);
});

// Save profile
saveProfileBtn.addEventListener('click', async () => {
  const newName = nameInput.value.trim();

  if (!newName || newName.length < 2) {
    showNotification('Name must be at least 2 characters', 'error');
    return;
  }

  try {
    saveProfileBtn.disabled = true;
    saveProfileBtn.innerHTML = '<span>⏳</span><span>Saving...</span>';

    // In a real app, you would send this to the server
    // For now, we'll just update localStorage and display
    const token = getToken();
    const payload = JSON.parse(atob(token.split('.')[1]));
    payload.name = newName;

    // Update displays
    userNameDisplay.textContent = newName;
    profileInitial.textContent = newName.charAt(0).toUpperCase();

    showNotification('Profile updated successfully!', 'success');
  } catch (error) {
    console.error('Error saving profile:', error);
    showNotification('Failed to save profile', 'error');
  } finally {
    saveProfileBtn.disabled = false;
    saveProfileBtn.innerHTML = '<span>💾</span><span>Save Changes</span>';
  }
});

// Change password
changePasswordBtn.addEventListener('click', () => {
  const currentPassword = prompt('Enter your current password:');
  if (!currentPassword) return;

  const newPassword = prompt('Enter your new password (min 6 characters):');
  if (!newPassword || newPassword.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }

  const confirmPassword = prompt('Confirm your new password:');
  if (newPassword !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }

  // In a real app, you would send this to the server
  showNotification('Password change feature coming soon!', 'info');
});

// Delete account
deleteAccountBtn.addEventListener('click', () => {
  const confirmation = prompt(
    'This action cannot be undone. Type "DELETE" to confirm:'
  );

  if (confirmation === 'DELETE') {
    if (confirm('Are you absolutely sure? All your data will be permanently deleted.')) {
      // In a real app, you would send this to the server
      showNotification('Account deletion feature coming soon!', 'info');
    }
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('profileImage');
    location.href = '/';
  }
});

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-icon">${getNotificationIcon(type)}</span>
    <span class="notification-message">${message}</span>
  `;

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'info':
      return 'ℹ️';
    default:
      return '📢';
  }
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
  .notification {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    background: rgba(26, 26, 36, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s ease-out;
  }

  .notification.show {
    transform: translateX(0);
    opacity: 1;
  }

  .notification-success {
    border-color: rgba(16, 185, 129, 0.5);
    background: rgba(16, 185, 129, 0.1);
  }

  .notification-error {
    border-color: rgba(239, 68, 68, 0.5);
    background: rgba(239, 68, 68, 0.1);
  }

  .notification-info {
    border-color: rgba(99, 102, 241, 0.5);
    background: rgba(99, 102, 241, 0.1);
  }

  .notification-icon {
    font-size: 1.25rem;
  }

  .notification-message {
    color: var(--text-primary);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .notification {
      left: 16px;
      right: 16px;
      top: 16px;
    }
  }
`;
document.head.appendChild(style);

// Theme handling
const themeSelect = document.getElementById('theme-select');

// Load current theme
if (window.themeManager) {
  themeSelect.value = window.themeManager.getCurrentTheme();
}

// Handle theme change
themeSelect.addEventListener('change', (e) => {
  const newTheme = e.target.value;
  if (window.themeManager) {
    window.themeManager.setTheme(newTheme);
    showNotification(`Theme changed to ${newTheme}`, 'success');
  }
});

// Listen for theme changes
window.addEventListener('themechange', (e) => {
  console.log('Theme changed to:', e.detail.theme);
});

// Initialize
loadUserData();
