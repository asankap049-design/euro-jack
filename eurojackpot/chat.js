(function() {
  // Create UI elements
  const fab = document.createElement('button');
  fab.className = 'ai-fab';
  fab.innerHTML = '✨';
  
  const chatWindow = document.createElement('div');
  chatWindow.className = 'ai-chat-window';
  
  chatWindow.innerHTML = `
    <div class="ai-chat-header">
      <h3>AI Assistant</h3>
      <button class="ai-close-btn">&times;</button>
    </div>
    <div class="ai-chat-messages" id="ai-messages">
      <div class="ai-msg bot">Hi! I can analyze this page for you. What would you like to know?</div>
    </div>
    <div class="ai-chat-input-area">
      <input type="text" class="ai-chat-input" id="ai-input" placeholder="Ask about these numbers...">
      <button class="ai-chat-send" id="ai-send">➤</button>
    </div>
  `;
  
  document.body.appendChild(fab);
  document.body.appendChild(chatWindow);
  
  const messagesContainer = document.getElementById('ai-messages');
  const inputField = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send');
  const closeBtn = chatWindow.querySelector('.ai-close-btn');
  
  fab.addEventListener('click', () => {
    chatWindow.classList.add('open');
    inputField.focus();
  });
  
  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `ai-msg ${sender}`;
    
    // Simple markdown parsing for bold text
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    msg.innerHTML = formattedText;
    
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return msg;
  }

  function showTyping() {
    const msg = document.createElement('div');
    msg.className = 'ai-msg bot ai-typing-indicator';
    msg.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return msg;
  }
  
  function getPageContext() {
    let context = "User is on page: " + document.title + "\n";
    
    const statline = document.querySelector('.statline');
    if (statline) {
      context += "Current Stats on screen: " + statline.innerText + "\n";
    }

    const statText = document.getElementById('statText');
    if (statText) {
      context += "Stats details: " + statText.innerText + "\n";
    }

    const summary = document.getElementById('summary');
    if (summary) {
        context += "Summary details: " + summary.innerText + "\n";
    }

    const selCells = document.querySelectorAll('.cell.sel .n, .g-cell.sel .n, .pos-cell.sel .n');
    if (selCells.length > 0) {
      const selected = Array.from(selCells).map(el => el.innerText).join(', ');
      context += "User selected numbers: " + selected + "\n";
    }
    
    return context;
  }

  async function sendMessage() {
    const text = inputField.value.trim();
    if (!text) return;
    
    addMessage(text, 'user');
    inputField.value = '';
    sendBtn.disabled = true;
    
    const typingIndicator = showTyping();
    const context = getPageContext();
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-coupon-code': localStorage.getItem('couponCode') || '',
          'x-session-token': localStorage.getItem('sessionToken') || ''
        },
        body: JSON.stringify({ message: text, context, pageName: window.location.pathname.split('/').pop() || 'index.html' })
      });
      
      typingIndicator.remove();
      sendBtn.disabled = false;
      
      if (res.status === 401) {
        addMessage("Please log in to use the AI Assistant.", 'bot');
        return;
      }
      
      const data = await res.json();
      if (data.error) {
        addMessage("Error: " + data.error, 'bot');
      } else {
        addMessage(data.reply, 'bot');
      }
    } catch (e) {
      typingIndicator.remove();
      sendBtn.disabled = false;
      addMessage("Failed to connect to AI server.", 'bot');
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
