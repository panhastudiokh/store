const packageBoxes = document.querySelectorAll('.package-box');
const qrContainer = document.getElementById('qr-code');
const invalidMessage = document.getElementById('invalid-message');
const selectedInfo = document.getElementById('selectedInfo');
const startPaymentButton = document.getElementById('startPaymentButton');
const userIdInput = document.getElementById('userId');
const serverIdInput = document.getElementById('serverId');

let selectedPrice = null;
let selectedDataItem = null;
let isUserValid = false;

packageBoxes.forEach(box => {
  box.addEventListener('click', () => {
    if (isUserValid) {
      packageBoxes.forEach(otherBox => otherBox.classList.remove('selected'));
      box.classList.add('selected');
      selectedPrice = box.getAttribute('data-price');
      selectedDataItem = box.getAttribute('data-item');
      selectedInfo.innerHTML = `តម្លៃសរុប:  $${selectedPrice}  ចំនួនពេជ្រសរុប: ${selectedDataItem}💎`;
      selectedInfo1.innerHTML = `ទូទាត់ឥឡូវនេះ : ${selectedPrice} $ `;
      enablePaymentButton();
    }
  });
});

function enablePaymentButton() {
  startPaymentButton.disabled = false;
}

function disablePaymentButton() {
  startPaymentButton.disabled = true;
}

function startPayment() {
  if (isUserValid && selectedPrice !== null) {
    const denom = selectedDataItem;
    postApiRequest(selectedPrice, denom);
  } else {
    invalidMessage.innerHTML = 'អ្នកមិនទានបានជ្រេីសរេីសកញ្ចប់ណាមួយទេ សូមជ្រេីសរេីសការបញ្ចប់ណាមួយដេីម្បីបន្ត';
  }
}

function postApiRequest(amount_usd) {
  const postData = {
    amount_usd: amount_usd,

                "bakongid": 'panhastore_game@aclb',
                "store_name": 'PANHA STORE GAME',
  };

  fetch('https://bakong-endpoiny.ngrok.app/run_js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const md5 = data.md5;
      checkPaymentStatus(md5);
      openModal(data.qr_string, md5);
      processJsonResponse(md5);
    })
    .catch(error => {
      invalidMessage.innerHTML = 'Invalid QR Code';
      console.error('Error:', error);
    });
};

function checkPaymentStatus(md5) {
  const url = "https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5";
  const body = { "md5": md5 };

  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3MTMyNDc4NDksImlhdCI6MTcwNTIxMjY0OSwiZGF0YSI6eyJpZCI6ImU4ODdlMGNjZDc3MTQzMyJ9fQ.gWXGkb2ew9yNRqxr6De3v3TjsPQj0oHcfKytAzr2bPM"; // Replace with your valid token
  const header = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // Define the function to handle the response
  const handleResponse = (response) => {
    console.log(response.status);
    return response.json(); // Return the JSON-parsed response
  };

  // Define the function to process the JSON response
  const processJsonResponse = (jsonData, md5) => {
    console.log(jsonData);
    console.log(md5);
    // Check if the response contains a redirect link
    if (jsonData.responseCode === 0 && jsonData.data && jsonData.data.hash) {
      const botToken = '6879144159:AAGQq-TA6dDDLGZkayQiLmdEfoSjC36pzNA';
      const chatId = '-1001995355870';
      const message = 'ការបញ្ជាទិញថ្មី  / New Order 📥' + '\n' + '\n UserID : ' + '<code>'  +  userIdInput.value + ' ' + serverIdInput.value + ' ' + selectedDataItem + '</code>\n\nMobile Legends: Bang Bang\n \nStatus ស្ថានភាព : ជោគជ័យ✅\n \n' + 'From មកពី : Panha.store';
      sendTelegramMessage(botToken, chatId, message);
      const redirectLink = 'thank-for-buy.html';
      const link = setInterval(() => {
        window.location.href = redirectLink;
      }, 4000);
      setTimeout(() => {
        clearInterval(intervalId);
      },1000000); // Adjust duration as needed
      link()     
    } else {
      
    }
  };


  // Define the function to handle errors
  const handleError = (error) => {
    console.error('Error:', error);
  };

  // Set up interval for auto-check every 2 seconds
  const intervalId = setInterval(() => {
    fetch(url, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body),
    })
      .then(handleResponse)
      .then(processJsonResponse)
      .catch(handleError);
  }, 5000);

  // Stop the interval after a certain duration (e.g., 10 seconds)
  setTimeout(() => {
    clearInterval(intervalId);
  },1000000); // Adjust duration as needed
}

// Example usage:
// checkPaymentStatus("your_md5_here");



function sendTelegramMessage(botToken, chatId, message) {
  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  fetch(telegramApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Telegram message sent successfully:', data);
    })
    .catch(error => {
      console.error('Error sending Telegram message:', error);
    });
}


function openModal(qrString) {
  const modal = document.getElementById('myModal');
  modal.style.display = 'flex';

  const qrCodeContainer = document.getElementById('qr-code-container-popup');
  qrCodeContainer.innerHTML = '';
  
  const qrCode = new QRCode('qrcode', {
    text: qrString,
    width: 120,
    height: 120,
  });
}


function closeModal() {
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';
}

window.onclick = function (event) {
  const closeButton = document.querySelector('.close');
  const modal = document.getElementById('myModal');
  if (event.target === closeButton) {
    modal.style.display = 'none';
  }
};

function checkApi() {
  const userId = userIdInput.value;
  const serverId = serverIdInput.value;

  const url = 'https://api.elitedias.com/checkid';
  const headers = {
    'Origin': 'dev.api.elitedias.com',
  };
  const payload = {
    'userid': userId,
    'serverid': serverId,
    'game': 'mlbb',
  };

  $.ajax({
    type: 'POST',
    url: url,
    headers: headers,
    data: JSON.stringify(payload),
    contentType: 'application/json',
    timeout: 60000,
    success: function (response) {
      if (response.valid === 'valid') {
        isUserValid = true;
        invalidMessage.textContent = response.name ? `ហ្គេមរបស់អ្នកឈ្មោះ: ${response.name}` : 'Valid ID, but name not provided.';
        enablePaymentButton();
      } else if (response.valid === 'invalid') {
        isUserValid = false;
        invalidMessage.textContent = 'លេខសម្គាល់មិនត្រឹមត្រូវ។ សូមពិនិត្យម្តងទៀត។';
        disablePaymentButton();
      } else {
        isUserValid = false;
        invalidMessage.textContent = 'Unexpected response.';
        disablePaymentButton();
      }
    },
    error: function (error) {
      isUserValid = true;
      invalidMessage.textContent = 'សូមជ្រើសរើសកញ្ចប់ / Please Select Package: ' 
      disablePaymentButton();
    }
  });
}

