$(function() {
    // Load boards and their stats
    function loadBoards() {
        $.get('/api/boards', function(boards) {
            const boardsList = boards.map(board => `
                <a href="/b/${board.name}/" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    ${board.name}
                    <span class="badge bg-primary rounded-pill">${board.threadCount}</span>
                </a>
            `).join('');
            $('#boardsList').html(boardsList || '<p class="text-center p-3">No boards yet</p>');
        });
    }

    // Handle board creation
    $('#newBoard').submit(function(e) {
        e.preventDefault();
        const boardName = $(this).find('input').val();
        $.ajax({
            type: 'POST',
            url: '/api/boards',
            data: { name: boardName },
            success: function(response) {
                if (response.success) {
                    window.location.href = `/b/${response.board}/`;
                }
            },
            error: function(err) {
                alert('Error creating board: ' + err.responseJSON?.error || 'Unknown error');
            }
        });
    });

    // Load boards on page load
    loadBoards();

    $('#newThread').submit(function(){
        var board = $('#board1').val();
        $(this).attr('action', "/api/threads/" + board);
    });
    $('#newReply').submit(function(){
        var board = $('#board4').val();
        $(this).attr('action', "/api/replies/" + board);
    });
    $('#reportThread').submit(function(e){
        var url = "/api/threads/"+$('#board2').val();
        $.ajax({
            type: "PUT",
            url: url,
            data: $(this).serialize(),
            success: function(data)
            {
                alert(data);
            }
        });
        e.preventDefault();
    });
    $('#deleteThread').submit(function(e){
        var url = "/api/threads/"+$('#board3').val();
        $.ajax({
            type: "DELETE",
            url: url,
            data: $(this).serialize(),
            success: function(data)
            {
                alert(data);
            }
        });
        e.preventDefault();
    });
    $('#reportReply').submit(function(e){
        var url = "/api/replies/"+$('#board5').val();
        $.ajax({
            type: "PUT",
            url: url,
            data: $(this).serialize(),
            success: function(data)
            {
                alert(data);
            }
        });
        e.preventDefault();
    });
    $('#deleteReply').submit(function(e){
        var url = "/api/replies/"+$('#board6').val();
        $.ajax({
            type: "DELETE",
            url: url,
            data: $(this).serialize(),
            success: function(data)
            {
                alert(data);
            }
        });
        e.preventDefault();
    });
});