/**
 * Copy Table Functionality
 * Handles copying the subnet calculation table to clipboard
 */

// jQuery click listener for the Copy Table button
$('#btn_copy_table').on('click', function (e) {
    e.preventDefault();
    copyTableToClipboard();
});

/**
 * Copies the table to clipboard using modern Clipboard API
 * 1. Creates a hidden temporary div
 * 2. Copies the table HTML into the temp div
 * 3. Converts input fields to text for clean copying
 * 4. Uses modern Clipboard API to copy the table
 * 5. Deletes the temp div leaving original table unchanged
 */
function copyTableToClipboard() {
    try {
        // 1. Create a display:none temp div
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        // 2. Copy the table HTML into the temp div
        const originalTable = document.getElementById('calc');
        const clonedTable = originalTable.cloneNode(true);
        tempDiv.appendChild(clonedTable);

        // 3. Convert input fields to text for clean copying
        convertInputsToText(clonedTable);

        // 4. Use modern Clipboard API to copy the table
        copyTableContent(clonedTable).then(() => {
            showCopyMessage('Table copied to clipboard!', 'success');
        }).catch((err) => {
            console.error('Failed to copy table:', err);
            // Fallback to legacy copy method
            fallbackCopy(clonedTable);
        }).finally(() => {
            // 5. Delete the temp div
            document.body.removeChild(tempDiv);
        });

    } catch (error) {
        console.error('Error in copyTableToClipboard:', error);
        showCopyMessage('Failed to copy table. Please try again.', 'error');
    }
}

/**
 * Converts input fields in the cloned table to plain text
 * @param {HTMLElement} tableElement - The cloned table element
 */
function convertInputsToText(tableElement) {
    const inputs = tableElement.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value || '';
        span.className = 'note-text';
        // Replace the input with the span
        input.parentNode.replaceChild(span, input);
    });
}

/**
 * Uses modern Clipboard API to copy table content
 * @param {HTMLElement} tableElement - The table element to copy
 * @returns {Promise} - Promise that resolves when copying is complete
 */
async function copyTableContent(tableElement) {
    if (!navigator.clipboard || !navigator.clipboard.write) {
        throw new Error('Clipboard API not available');
    }

    // Create HTML content for clipboard
    const htmlContent = tableElement.outerHTML;

    // Create plain text version for better compatibility
    const textContent = tableToPlainText(tableElement);

    // Create clipboard item with both HTML and plain text
    const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], {type: 'text/html'}),
        'text/plain': new Blob([textContent], {type: 'text/plain'})
    });

    await navigator.clipboard.write([clipboardItem]);
}

/**
 * Fallback copy method for older browsers
 * @param {HTMLElement} tableElement - The table element to copy
 */
function fallbackCopy(tableElement) {
    try {
        // Select the table content
        const range = document.createRange();
        range.selectNodeContents(tableElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Execute copy command
        const successful = document.execCommand('copy');
        selection.removeAllRanges();

        if (successful) {
            showCopyMessage('Table copied to clipboard!', 'success');
        } else {
            throw new Error('Copy command failed');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showCopyMessage('Failed to copy table. Please try again.', 'error');
    }
}

/**
 * Converts table to plain text format
 * @param {HTMLElement} tableElement - The table element
 * @returns {string} - Plain text representation of the table
 */
function tableToPlainText(tableElement) {
    let text = '';
    const rows = tableElement.querySelectorAll('tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowText = Array.from(cells).map(cell => {
            // Skip split/join control columns
            if (cell.classList.contains('split') || cell.classList.contains('join')) {
                return '';
            }
            return cell.textContent.trim();
        }).filter(text => text !== '').join('\t');

        if (rowText) {
            text += rowText + '\n';
        }
    });

    return text;
}

/**
 * Shows a temporary message to user
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showCopyMessage(message, type = 'success') {
    // Remove existing message if present
    const existingMessage = document.getElementById('copy-table-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.id = 'copy-table-message';
    messageDiv.textContent = message;

    // Style the message
    const backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: opacity 0.3s ease;
    `;

    // Add to page
    document.body.appendChild(messageDiv);

    // Remove after 3 seconds with fade effect
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}
