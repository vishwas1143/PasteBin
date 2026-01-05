const Paste = require("../models/Paste");
const { getTestTime } = require("../middleware/validation");

const viewPaste = async (req, res) => {
  try {
    const { id } = req.params;
    const now = getTestTime(req);

    const paste = await Paste.findOne({ id });

    if (!paste) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Paste Not Found</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 40px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #e53e3e; margin-bottom: 20px; }
            p { color: #666; margin-bottom: 20px; }
            a { 
              color: #667eea; 
              text-decoration: none;
              font-weight: bold;
            }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Paste Not Found</h1>
            <p>The paste you're looking for either doesn't exist or has expired.</p>
            <p><a href="/">Create a new paste</a></p>
          </div>
        </body>
        </html>
      `);
    }

    // Check if paste is still valid
    if (!paste.isValid(now)) {
      await Paste.deleteOne({ _id: paste._id });
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Paste Expired</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 40px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #e53e3e; margin-bottom: 20px; }
            p { color: #666; margin-bottom: 20px; }
            a { 
              color: #667eea; 
              text-decoration: none;
              font-weight: bold;
            }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Paste Expired</h1>
            <p>This paste has expired or reached its view limit.</p>
            <p><a href="/">Create a new paste</a></p>
          </div>
        </body>
        </html>
      `);
    }

    // Increment view count
    await paste.incrementViews();

    // Escape HTML content to prevent XSS
    const safeContent = paste.content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, "<br>");

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Paste: ${paste.id}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
          // Function to copy paste content to clipboard
          function copyToClipboard() {
            const content = \`${paste.content
              .replace(/`/g, "\\`")
              .replace(/\$/g, "\\$")}\`;
            navigator.clipboard.writeText(content).then(() => {
              const btn = document.getElementById('copy-btn');
              const originalText = btn.textContent;
              btn.textContent = '✅ Copied!';
              setTimeout(() => {
                btn.textContent = originalText;
              }, 2000);
            });
          }
          
          // Initialize when page loads
          document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
          });
        </script>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
          }
          
          header {
            background: #2c3e50;
            color: white;
            padding: 25px;
            text-align: center;
          }
          
          header h1 {
            font-size: 1.8rem;
            margin-bottom: 10px;
          }
          
          .content-area {
            padding: 30px;
          }
          
          .paste-content {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-x: auto;
            min-height: 200px;
            margin-bottom: 25px;
          }
          
          .metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 25px 0;
          }
          
          .meta-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          
          .meta-card h3 {
            color: #2c3e50;
            font-size: 0.9rem;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .meta-card p {
            color: #495057;
            font-size: 1.1rem;
            font-weight: 600;
          }
          
          .actions {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          
          .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 1rem;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s;
            margin: 0 10px;
          }
          
          .btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }
          
          .btn-secondary {
            background: #48bb78;
          }
          
          .btn-secondary:hover {
            background: #38a169;
          }
          
          footer {
            text-align: center;
            padding: 20px;
            color: #718096;
            font-size: 0.9rem;
            border-top: 1px solid #e2e8f0;
          }
          
          @media (max-width: 600px) {
            .content-area {
              padding: 20px;
            }
            
            .metadata {
              grid-template-columns: 1fr;
            }
            
            .btn {
              display: block;
              margin: 10px 0;
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>📋 Paste Content</h1>
            <p>Paste ID: ${paste.id}</p>
          </header>
          
          <div class="content-area">
            <div class="paste-content">${safeContent}</div>
            
            <div class="metadata">
              <div class="meta-card">
                <h3>Views</h3>
                <p>${paste.views}${
      paste.maxViews ? "/" + paste.maxViews : " (unlimited)"
    }</p>
              </div>
              
              <div class="meta-card">
                <h3>Created</h3>
                <p>${new Date(paste.createdAt).toLocaleString()}</p>
              </div>
              
              ${
                paste.expiresAt
                  ? `
              <div class="meta-card">
                <h3>Expires</h3>
                <p>${new Date(paste.expiresAt).toLocaleString()}</p>
              </div>
              `
                  : ""
              }
              
              <div class="meta-card">
                <h3>Remaining Views</h3>
                <p>${
                  paste.maxViews
                    ? Math.max(0, paste.maxViews - paste.views)
                    : "∞"
                }</p>
              </div>
            </div>
            
            <div class="actions">
              <a href="/" class="btn">Create New Paste</a>
              <button id="copy-btn" class="btn btn-secondary">Copy Content</button>
            </div>
          </div>
          
          <footer>
            <p>Paste expires when: ${
              paste.expiresAt ? "time limit reached" : ""
            }${paste.expiresAt && paste.maxViews ? " or " : ""}${
      paste.maxViews ? "view limit reached" : "never"
    }</p>
          </footer>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error viewing paste:", error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
          }
          h1 { color: #e53e3e; margin-bottom: 20px; }
          p { color: #666; margin-bottom: 20px; }
          a { 
            color: #667eea; 
            text-decoration: none;
            font-weight: bold;
          }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Internal Server Error</h1>
          <p>Something went wrong while loading the paste.</p>
          <p><a href="/">Go back to home</a></p>
        </div>
      </body>
      </html>
    `);
  }
};

module.exports = { viewPaste };
