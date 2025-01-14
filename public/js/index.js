function showToast(message, type = 'success') {
    const toastHtml = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>
    `;
    
    const toastContainer = $('.toast-container');
    toastContainer.append(toastHtml);
    
    const toastElement = toastContainer.find('.toast').last();
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    toastElement.on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

function createBoardCard(board) {
    const threadsHtml = board.threads.map(thread => `
        <div class="thread-preview">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <small class="text-muted">
                        <i class="bi bi-hash"></i> ${thread._id}
                        <i class="bi bi-clock ms-2"></i> ${new Date(thread.created_on).toLocaleString()}
                    </small>
                </div>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-warning btn-sm report-thread" data-board="${board.name}" data-id="${thread._id}">
                        <i class="bi bi-flag"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-thread" data-board="${board.name}" data-id="${thread._id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <p class="mb-1">${thread.text}</p>
            
            <!-- Display Replies -->
            ${thread.replies && thread.replies.length > 0 ? `
                <div class="replies ms-3 mb-2">
                    ${thread.replies.map(reply => `
                        <div class="reply-preview border-start ps-2 mb-1">
                            <small class="text-muted">
                                <i class="bi bi-reply"></i> ${new Date(reply.created_on).toLocaleString()}
                            </small>
                            <p class="mb-1 small">${reply.text}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="reply-form mb-2">
                <form class="d-flex gap-2" data-board="${board.name}" data-thread="${thread._id}">
                    <input type="text" class="form-control form-control-sm" name="text" placeholder="Quick reply" required>
                    <input type="password" class="form-control form-control-sm" name="delete_password" placeholder="Password" required>
                    <button type="submit" class="btn btn-primary btn-sm">Reply</button>
                </form>
            </div>
        </div>
    `).join('');

    return `
        <div class="board-card card">
            <div class="card-body">
                <h5 class="card-title">
                    <a href="/b/${board.name}/" class="text-decoration-none">
                        ${board.name}
                    </a>
                </h5>
                ${threadsHtml}
            </div>
        </div>
    `;
}

$(function() {
    function loadBoards() {
        $.get('/api/boards/with-threads')
            .done(function(boards) {
                if (boards && boards.length > 0) {
                    const boardsHtml = boards.map(createBoardCard).join('');
                    $('#boardsContainer').html(boardsHtml);
                } else {
                    $('#boardsContainer').html('<div class="alert alert-info">No boards found. Create one to get started!</div>');
                }
            })
            .fail(function(err) {
                console.error('Error loading boards:', err);
                $('#boardsContainer').html('<div class="alert alert-danger">Error loading boards. Please try again later.</div>');
            });
    }

    loadBoards();

    $('#newBoard').submit(function(e) {
        e.preventDefault();
        $.post('/api/boards', $(this).serialize(), function(response) {
            if (response.success) {
                showToast('Board created successfully');
                loadBoards();
                $('#newBoard')[0].reset();
            }
        });
    });

    // Event delegation for dynamic elements
    $('#boardsContainer').on('submit', '.reply-form form', function(e) {
        e.preventDefault();
        const board = $(this).data('board');
        const threadId = $(this).data('thread');
        const formData = $(this).serialize() + '&thread_id=' + threadId;
        const form = $(this);

        $.post('/api/replies/' + board, formData, function(response) {
            if (response.success) {
                // Clear the form
                form[0].reset();
                
                // Find the replies container for this specific thread
                const repliesContainer = form.closest('.thread-preview').find('.replies');
                
                // Create new reply HTML
                const newReplyHtml = `
                    <div class="reply-preview border-start ps-2 mb-1">
                        <small class="text-muted">
                            <i class="bi bi-reply"></i> ${new Date(response.reply.created_on).toLocaleString()}
                        </small>
                        <p class="mb-1 small">${response.reply.text}</p>
                    </div>
                `;

                // If there's no replies container yet, create one
                if (repliesContainer.length === 0) {
                    form.before(`
                        <div class="replies ms-3 mb-2">
                            ${newReplyHtml}
                        </div>
                    `);
                } else {
                    // Check if we need to remove the oldest reply (keep only 3)
                    if (repliesContainer.children().length >= 3) {
                        repliesContainer.children().first().remove();
                    }
                    // Add the new reply
                    repliesContainer.append(newReplyHtml);
                }

                showToast('Reply posted successfully');
            }
        });
    });

    // Handle thread reporting
    $('#boardsContainer').on('click', '.report-thread', function() {
        const board = $(this).data('board');
        const threadId = $(this).data('id');
        const threadCard = $(this).closest('.thread-preview');
        
        $.ajax({
            type: 'PUT',
            url: '/api/threads/' + board,
            data: { thread_id: threadId },
            success: function() {
                showToast('Thread reported successfully');
                // Disable the report button after successful report
                threadCard.find('.report-thread').prop('disabled', true)
                    .removeClass('btn-warning').addClass('btn-secondary');
            },
            error: function(err) {
                showToast('Error reporting thread', 'danger');
            }
        });
    });

    // Handle thread deletion
    $('#boardsContainer').on('click', '.delete-thread', function() {
        const board = $(this).data('board');
        const threadId = $(this).data('id');
        const threadPreview = $(this).closest('.thread-preview');
        const password = prompt('Enter deletion password:');
        
        if (password) {
            $.ajax({
                type: 'DELETE',
                url: '/api/threads/' + board,
                data: { thread_id: threadId, delete_password: password },
                success: function(response) {
                    if (response === 'success') {
                        // Fade out and remove the thread preview
                        threadPreview.fadeOut(400, function() {
                            $(this).remove();
                            // If this was the last thread, reload the board to show empty state
                            if (threadPreview.siblings('.thread-preview').length === 0) {
                                loadBoards();
                            }
                        });
                        showToast('Thread deleted successfully');
                    } else {
                        showToast('Incorrect password', 'danger');
                    }
                },
                error: function(err) {
                    showToast('Error deleting thread: ' + (err.responseJSON?.error || 'Unknown error'), 'danger');
                }
            });
        }
    });
});