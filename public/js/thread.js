function showToast(message, type = 'success') {
    const toast = $(`
        <div class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `);
    $('.toast-container').append(toast);
    const bsToast = new bootstrap.Toast(toast[0]);
    bsToast.show();
    toast.on('hidden.bs.toast', () => toast.remove());
}

$(function() {
    var currentURL = window.location.pathname.slice(3).split('/');
    var currentBoard = currentURL[0];
    var threadId = currentURL[1];
    
    $.ajax({
        type: "GET",
        url: "/api/replies/" + currentBoard,
        data: { thread_id: threadId },
        success: function(thread) {
            $('#boardDisplay').html(createThreadView(thread));
        }
    });

    function createThreadView(thread) {
        return `
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="meta-info">
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
                    <h4 class="mt-3">${thread.text}</h4>
                    
                    <hr class="my-4">
                    
                    <h5 class="mb-3">
                        <i class="bi bi-chat-dots"></i> 
                        Replies (${thread.replies.length})
                    </h5>
                    
                    <!-- Replies Section -->
                    <div class="replies">
                        ${thread.replies.map(reply => createReplyCard(reply, thread._id)).join('')}
                    </div>

                    <!-- New Reply Form -->
                    <div class="card mt-4">
                        <div class="card-body">
                            <h6 class="card-title">Add Reply</h6>
                            <form class="reply-form">
                                <input type="hidden" name="thread_id" value="${thread._id}">
                                <div class="mb-3">
                                    <textarea class="form-control" rows="3" name="text" 
                                        placeholder="Write your reply..." required></textarea>
                                </div>
                                <div class="mb-3">
                                    <input type="password" class="form-control" 
                                        name="delete_password" placeholder="Deletion password" required>
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-reply"></i> Submit Reply
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function createReplyCard(reply, threadId) {
        return `
            <div class="card reply-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="meta-info">
                            <i class="bi bi-person"></i> Anonymous
                            <i class="bi bi-clock ms-2"></i> ${new Date(reply.created_on).toLocaleString()}
                        </div>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning report-reply" 
                                data-thread="${threadId}" data-reply="${reply._id}">
                                <i class="bi bi-flag"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-reply" 
                                data-thread="${threadId}" data-reply="${reply._id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="card-text mt-2">${reply.text}</p>
                </div>
            </div>
        `;
    }

    // Event handlers for actions
    $('#boardDisplay').on('click', '.report-thread', function() {
        // ...existing handler code...
    });

    $('#boardDisplay').on('click', '.delete-thread', function() {
        // ...existing handler code...
    });

    $('#boardDisplay').on('click', '.report-reply', function() {
        // ...existing handler code...
    });

    $('#boardDisplay').on('click', '.delete-reply', function() {
        // ...existing handler code...
    });

    $('#boardDisplay').on('submit', '.reply-form', function(e) {
        e.preventDefault();
        var form = $(this);
        
        $.ajax({
            type: "POST",
            url: "/api/replies/" + currentBoard,
            data: form.serialize(),
            success: function(response) {
                if (response.success) {
                    form[0].reset();
                    loadThread();
                    showToast('Reply posted successfully');
                }
            },
            error: function(err) {
                showToast('Error posting reply: ' + (err.responseJSON?.error || 'Unknown error'), 'danger');
            }
        });
    });

    function loadThread() {
        $.ajax({
            type: "GET",
            url: "/api/replies/" + currentBoard,
            data: { thread_id: threadId },
            success: function(thread) {
                $('#boardDisplay').html(createThreadView(thread));
            }
        });
    }
});