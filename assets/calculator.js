// Investment Growth Calculator
(function() {
  'use strict';

  // Get DOM elements
  const monthlyDepositInput = document.getElementById('monthly-deposit');
  const yearsInput = document.getElementById('years');
  const returnRateInput = document.getElementById('return-rate');
  const startingAmountInput = document.getElementById('starting-amount');
  
  const futureValueEl = document.getElementById('future-value');
  const totalContributedEl = document.getElementById('total-contributed');
  const totalGrowthEl = document.getElementById('total-growth');
  
  const chartCanvas = document.getElementById('growth-chart');
  const copyButton = document.getElementById('copy-results');
  
  // Helper text elements
  const depositHelper = document.getElementById('deposit-helper');
  const yearsHelper = document.getElementById('years-helper');
  const returnHelper = document.getElementById('return-helper');
  const startingHelper = document.getElementById('starting-helper');

  // Format currency
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Validate and get input values
  function getInputValues() {
    const monthlyDeposit = parseFloat(monthlyDepositInput.value) || 0;
    const years = parseInt(yearsInput.value) || 0;
    const returnRate = parseFloat(returnRateInput.value) || 0;
    const startingAmount = parseFloat(startingAmountInput.value) || 0;

    // Validation
    let isValid = true;

    // Monthly deposit validation
    if (monthlyDeposit < 0) {
      depositHelper.textContent = 'Must be 0 or more';
      depositHelper.style.color = 'var(--accent)';
      isValid = false;
    } else {
      depositHelper.textContent = '';
    }

    // Years validation
    if (years < 1) {
      yearsHelper.textContent = 'Must be at least 1 year';
      yearsHelper.style.color = 'var(--accent)';
      isValid = false;
    } else if (years > 60) {
      yearsHelper.textContent = 'Maximum is 60 years';
      yearsHelper.style.color = 'var(--accent)';
      isValid = false;
    } else {
      yearsHelper.textContent = '';
    }

    // Return rate validation
    if (returnRate < 0) {
      returnHelper.textContent = 'Must be 0 or more';
      returnHelper.style.color = 'var(--accent)';
      isValid = false;
    } else if (returnRate > 20) {
      returnHelper.textContent = 'Maximum is 20%';
      returnHelper.style.color = 'var(--accent)';
      isValid = false;
    } else {
      returnHelper.textContent = '';
    }

    // Starting amount validation
    if (startingAmount < 0) {
      startingHelper.textContent = 'Must be 0 or more';
      startingHelper.style.color = 'var(--accent)';
      isValid = false;
    } else {
      startingHelper.textContent = '';
    }

    return { monthlyDeposit, years, returnRate, startingAmount, isValid };
  }

  // Calculate future value
  function calculateFutureValue(monthlyDeposit, years, returnRate, startingAmount) {
    const n = years * 12; // Total number of months
    const monthlyRate = returnRate / 100 / 12; // Monthly interest rate

    if (returnRate === 0) {
      // Handle division by zero: simple addition
      return startingAmount + (monthlyDeposit * n);
    }

    // Future value formula with monthly compounding and contributions
    // FV = start*(1+r)^n + deposit * [((1+r)^n - 1)/r]
    const compoundFactor = Math.pow(1 + monthlyRate, n);
    const futureValueFromStart = startingAmount * compoundFactor;
    const futureValueFromDeposits = monthlyDeposit * ((compoundFactor - 1) / monthlyRate);
    
    return futureValueFromStart + futureValueFromDeposits;
  }

  // Calculate and update results
  function updateResults() {
    const { monthlyDeposit, years, returnRate, startingAmount, isValid } = getInputValues();

    if (!isValid || years === 0) {
      futureValueEl.textContent = '$0';
      totalContributedEl.textContent = '$0';
      totalGrowthEl.textContent = '$0';
      drawChart([]);
      return;
    }

    const futureValue = calculateFutureValue(monthlyDeposit, years, returnRate, startingAmount);
    const totalContributed = startingAmount + (monthlyDeposit * years * 12);
    const totalGrowth = futureValue - totalContributed;

    // Update display
    futureValueEl.textContent = formatCurrency(futureValue);
    totalContributedEl.textContent = formatCurrency(totalContributed);
    totalGrowthEl.textContent = formatCurrency(totalGrowth);

    // Calculate data points for chart (yearly)
    const chartData = [];
    for (let year = 0; year <= years; year++) {
      const yearValue = calculateFutureValue(monthlyDeposit, year, returnRate, startingAmount);
      chartData.push({ year, value: yearValue });
    }

    drawChart(chartData);
  }

  // Draw chart on canvas
  function drawChart(data) {
    if (!chartCanvas || data.length === 0) return;

    const ctx = chartCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = chartCanvas.getBoundingClientRect();
    const width = rect.width;
    const height = 300;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Scale context for high DPI displays
    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get theme colors
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLight ? '#1a1a1a' : '#e0e0e0';
    const mutedColor = isLight ? '#666666' : '#a0a0a0';
    const accentColor = '#F37A2B';
    const gridColor = isLight ? '#e0e0e0' : '#2a2a2a';

    if (data.length < 2) {
      // Not enough data
      ctx.fillStyle = mutedColor;
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Enter values to see chart', width / 2, height / 2);
      return;
    }

    // Find min and max values
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw line
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw points
    ctx.fillStyle = accentColor;
    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = mutedColor;
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    // X-axis labels (years)
    const labelStep = Math.max(1, Math.floor(data.length / 5));
    data.forEach((point, index) => {
      if (index % labelStep === 0 || index === data.length - 1) {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        ctx.fillText(point.year.toString(), x, height - padding + 20);
      }
    });

    // Y-axis labels (values)
    for (let i = 0; i <= gridLines; i++) {
      const value = minValue + (valueRange / gridLines) * (gridLines - i);
      const y = padding + (chartHeight / gridLines) * i;
      ctx.textAlign = 'right';
      ctx.fillText(formatCurrency(value), padding - 10, y + 4);
    }

    // Chart title
    ctx.fillStyle = textColor;
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Balance Over Time', width / 2, 20);
    
    ctx.restore();
  }

  // Copy results to clipboard
  function copyResults() {
    const { monthlyDeposit, years, returnRate, isValid } = getInputValues();
    
    if (!isValid || years === 0) {
      return;
    }

    const futureValue = calculateFutureValue(
      monthlyDeposit, 
      years, 
      returnRate, 
      parseFloat(startingAmountInput.value) || 0
    );

    const text = `Monthly: $${monthlyDeposit}, Years: ${years}, Return: ${returnRate}% → Future: ${formatCurrency(futureValue)}`;
    
    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyButton.textContent;
      copyButton.textContent = 'Copied! ✓';
      copyButton.style.backgroundColor = '#4CAF50';
      
      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.style.backgroundColor = '';
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      const originalText = copyButton.textContent;
      copyButton.textContent = 'Copied! ✓';
      copyButton.style.backgroundColor = '#4CAF50';
      
      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.style.backgroundColor = '';
      }, 2000);
    });
  }

  // Event listeners
  monthlyDepositInput.addEventListener('input', updateResults);
  yearsInput.addEventListener('input', updateResults);
  returnRateInput.addEventListener('input', updateResults);
  startingAmountInput.addEventListener('input', updateResults);
  copyButton.addEventListener('click', copyResults);

  // Handle canvas resize
  function resizeCanvas() {
    if (!chartCanvas) return;
    const container = chartCanvas.parentElement;
    if (container) {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      chartCanvas.width = rect.width * dpr;
      chartCanvas.height = 300 * dpr;
      chartCanvas.style.width = rect.width + 'px';
      chartCanvas.style.height = '300px';
      updateResults();
    }
  }

  window.addEventListener('resize', resizeCanvas);
  
  // Recalculate on theme change
  const observer = new MutationObserver(() => {
    updateResults();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  
  // Initial calculation and chart draw
  setTimeout(() => {
    resizeCanvas();
    updateResults();
  }, 100);
})();
