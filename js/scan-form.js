// Scan Form Handler
// Handles form validation and submission to payment gateway

(function() {
  const form = document.getElementById('scanForm');
  if (!form) return;

  // Configuration
  const config = {
    // Payment gateway URL (replace with actual endpoint)
    paymentGatewayUrl: 'https://payment.vulneraai.ru/checkout',
    // Backend API URL for scan request creation
    apiUrl: 'https://api.vulneraai.ru/v1/scan/create',
    // Price in rubles
    price: 299,
    currency: 'RUB'
  };

  // Form elements
  const urlInput = form.querySelector('#website-url');
  const emailInput = form.querySelector('#email');
  const agreeTerms = form.querySelector('#agree-terms');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Toast notification helper
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Validate URL format
  function validateUrl(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  // Validate email format
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Real-time validation
  urlInput.addEventListener('blur', () => {
    if (urlInput.value && !validateUrl(urlInput.value)) {
      urlInput.setCustomValidity('Укажите корректный URL (например: https://example.com)');
    } else {
      urlInput.setCustomValidity('');
    }
  });

  emailInput.addEventListener('blur', () => {
    if (emailInput.value && !validateEmail(emailInput.value)) {
      emailInput.setCustomValidity('Укажите корректный email адрес');
    } else {
      emailInput.setCustomValidity('');
    }
  });

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Get form data
    const formData = {
      website_url: urlInput.value.trim(),
      email: emailInput.value.trim(),
      price: config.price,
      currency: config.currency
    };

    // Additional validation
    if (!validateUrl(formData.website_url)) {
      showToast('Укажите корректный URL сайта', 'error');
      return;
    }

    if (!validateEmail(formData.email)) {
      showToast('Укажите корректный email адрес', 'error');
      return;
    }

    if (!agreeTerms.checked) {
      showToast('Необходимо принять условия использования', 'error');
      return;
    }

    // Set loading state
    submitBtn.classList.add('btn--loading');
    submitBtn.disabled = true;

    try {
      // Create scan request via API
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании запроса на сканирование');
      }

      const result = await response.json();

      // Redirect to payment gateway
      if (result.payment_url) {
        showToast('Перенаправление на страницу оплаты...', 'success');
        
        // Small delay for user to see the success message
        setTimeout(() => {
          window.location.href = result.payment_url;
        }, 1000);
      } else {
        throw new Error('Не получен URL для оплаты');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      
      // For demo purposes: create payment URL with params
      // In production, this should come from the API
      const paymentUrl = new URL(config.paymentGatewayUrl);
      paymentUrl.searchParams.set('url', formData.website_url);
      paymentUrl.searchParams.set('email', formData.email);
      paymentUrl.searchParams.set('amount', formData.price);
      paymentUrl.searchParams.set('currency', formData.currency);
      
      showToast('Перенаправление на страницу оплаты...', 'success');
      
      setTimeout(() => {
        window.location.href = paymentUrl.toString();
      }, 1000);

    } finally {
      // Remove loading state
      setTimeout(() => {
        submitBtn.classList.remove('btn--loading');
        submitBtn.disabled = false;
      }, 1500);
    }
  });

  // Auto-format URL (add https:// if missing)
  urlInput.addEventListener('blur', () => {
    let value = urlInput.value.trim();
    if (value && !value.match(/^https?:\/\//i)) {
      urlInput.value = 'https://' + value;
    }
  });

  // Prevent form submission on Enter in input fields
  [urlInput, emailInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const nextInput = input === urlInput ? emailInput : agreeTerms;
        if (nextInput) nextInput.focus();
      }
    });
  });

  // Store data in sessionStorage for recovery
  function saveFormData() {
    const data = {
      url: urlInput.value,
      email: emailInput.value
    };
    sessionStorage.setItem('scanFormData', JSON.stringify(data));
  }

  function restoreFormData() {
    const saved = sessionStorage.getItem('scanFormData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.url) urlInput.value = data.url;
        if (data.email) emailInput.value = data.email;
      } catch (e) {
        console.error('Error restoring form data:', e);
      }
    }
  }

  // Auto-save on input
  [urlInput, emailInput].forEach(input => {
    input.addEventListener('input', saveFormData);
  });

  // Restore on page load
  restoreFormData();

  // Clear on successful submission
  form.addEventListener('submit', () => {
    sessionStorage.removeItem('scanFormData');
  });
})();

// Add slideOutRight animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);