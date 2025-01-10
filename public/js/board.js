function showToast(message, type = 'success') {
    const toastHtml = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    const toastContainer = $('.toast-container');
    toastContainer.append(toastHtml);
    
    const toastElement = toastContainer.find('.toast').last();
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

$(function() {
    var currentBoard = window.location.pathname.slice(3,-1);
    var url = "/api/threads/"+currentBoard;
    $('#boardTitle').text('Welcome to '+window.location.pathname)
    $.ajax({
        type: "GET",
        url: url,
        success: function(data)
        {
            var boardThreads= [];
            data.forEach(function(ele) {
                boardThreads.push(createThreadCard(ele));
            });
            $('#boardDisplay').html(boardThreads.join(''));
        }
    });

    $('#newThread').submit(function(e){
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/api/threads/' + currentBoard,
            data: $(this).serialize(),
            success: function(response) {
                if (response.success) {
                    // Clear form
                    $('#newThread')[0].reset();
                    // Reload threads
                    loadThreads();
                    showToast('Thread posted successfully');
                }
            },
            error: function(err) {
                showToast('Error creating thread: ' + (err.responseJSON?.error || 'Unknown error'), 'danger');
            }
        });
    });

    function loadThreads() {
        $.ajax({
            type: "GET",
            url: url,
            success: function(data) {
                var boardThreads = data.map(ele => createThreadCard(ele));
                $('#boardDisplay').html(boardThreads.join(''));
            }
        });
    }

    $('#boardDisplay').on('click', '.report-thread', function() {
        var threadId = $(this).data('id');
        $.ajax({
            type: "PUT",
            url: "/api/threads/"+currentBoard,
            data: { report_id: threadId },
            success: function(data) {
                showToast('Thread reported successfully');
            },
            error: function(err) {
                showToast('Error reporting thread', 'danger');
            }
        });
    });

    $('#boardDisplay').on('click', '.delete-thread', function() {
        const threadId = $(this).data('id');
        const threadCard = $(this).closest('.thread-card');  // Get reference to the thread card
        const password = prompt("Enter deletion password:");
        
        if (password) {
            $.ajax({
                type: "DELETE",
                url: "/api/threads/"+currentBoard,
                data: { thread_id: threadId, delete_password: password },
                success: function(response) {
                    if (response === "success") {
                        // Remove the thread card from UI immediately
                        threadCard.fadeOut(400, function() {
                            $(this).remove();
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

    $('#boardDisplay').on('click', '.delete-reply', function() {
        const threadId = $(this).data('thread');
        const replyId = $(this).data('reply');
        const replyCard = $(this).closest('.reply-card');  // Get reference to the reply card
        const password = prompt("Enter deletion password:");
        
        if (password) {
            $.ajax({
                type: "DELETE",
                url: "/api/replies/"+currentBoard,
                data: { 
                    thread_id: threadId, 
                    reply_id: replyId, 
                    delete_password: password 
                },
                success: function(response) {
                    if (response.includes("success")) {
                        // Update the reply text to [deleted]
                        replyCard.find('.card-text').text('[deleted]');
                        showToast('Reply deleted successfully');
                    } else {
                        showToast('Incorrect password', 'danger');
                    }
                },
                error: function(err) {
                    showToast('Error deleting reply: ' + (err.responseJSON?.error || 'Unknown error'), 'danger');
                }
            });
        }
    });

    $('#boardDisplay').on('click', '.report-reply', function() {
        var threadId = $(this).data('thread');
        var replyId = $(this).data('reply');
        $.ajax({
            type: "PUT",
            url: "/api/replies/"+currentBoard,
            data: { thread_id: threadId, reply_id: replyId },
            success: function(data) {
                showToast('Reply reported successfully');
            },
            error: function(err) {
                showToast('Error reporting reply', 'danger');
            }
        });
    });

    $('#boardDisplay').on('submit', '.reply-form', function(e) {
        e.preventDefault();
        var form = $(this);
        
        $.ajax({
            type: "POST",
            url: "/api/replies/"+currentBoard,
            data: form.serialize(),
            success: function(response) {
                if (response.success) {
                    // Clear form
                    form[0].reset();
                    // Reload the entire thread list to show updated content
                    loadThreads();
                    // Optional: Show success message
                    showToast('Reply posted successfully');
                }
            },
            error: function(err) {
                showToast('Error posting reply: ' + (err.responseJSON?.error || 'Unknown error'), 'danger');
            }
        });
    });

    function createThreadCard(thread) {
        return `
            <div class="card thread-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div class="thread-meta">
                            <i class="bi bi-hash"></i> ${thread._id}
                            <i class="bi bi-clock ms-2"></i> ${new Date(thread.created_on).toLocaleString()}
                        </div>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning report-thread" data-id="${thread._id}">
                                <i class="bi bi-flag"></i> Report
                            </button>
                            <button class="btn btn-sm btn-danger delete-thread" data-id="${thread._id}">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                    <p class="card-text mt-2">${thread.text}</p>
                    
                    <!-- Replies Section -->
                    <div class="replies mt-3">
                        ${thread.replies.map(reply => createReplyCard(reply, thread._id)).join('')}
                    </div>

                    <!-- Reply Form -->
                    <form class="mt-3 reply-form">
                        <input type="hidden" name="thread_id" value="${thread._id}">
                        <div class="mb-2">
                            <textarea class="form-control" rows="2" name="text" placeholder="Write a reply..." required></textarea>
                        </div>
                        <div class="mb-2">
                            <input type="password" class="form-control" name="delete_password" placeholder="Deletion password" required>
                        </div>
                        <button type="submit" class="btn btn-sm btn-primary">Reply</button>
                    </form>
                </div>
            </div>
        `;
    }

    function createReplyCard(reply, threadId) {
        return `
            <div class="card reply-card mb-2">
                <div class="card-body py-2">
                    <div class="d-flex justify-content-between">
                        <small class="text-muted">
                            <i class="bi bi-reply"></i> ${reply._id}
                            <i class="bi bi-clock ms-2"></i> ${new Date(reply.created_on).toLocaleString()}
                        </small>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning report-reply" data-thread="${threadId}" data-reply="${reply._id}">
                                <i class="bi bi-flag"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-reply" data-thread="${threadId}" data-reply="${reply._id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="card-text mt-2">${reply.text}</p>
                </div>
            </div>
        `;
    }
});