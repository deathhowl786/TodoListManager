$(window).on("load", function() {

    // Display the username and welcome message on page load
    let session_username = localStorage.getItem('username');
    $('#user_id').prepend(`<i class="fa fa-user" aria-hidden="true"></i> ` + session_username);
    showAlert("Welcome, " + session_username, "success");

    // Function to format date as YYYY-MM-DD
    Date.prototype.yyyymmdd = function() {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
        var dd = this.getDate().toString();
        return [yyyy, (mm[1] ? mm : "0" + mm[0]), (dd[1] ? dd : "0" + dd[0])].join("-");
    };

    var today = new Date().yyyymmdd();
    $("#todo-list-deadline").attr("min", today);
    $("#todo-list-deadline").val(today);

    let xmlSession = null;
    let xmlResp = null;
    let list_count = 0;
    let todo_count = 0;

    // Load XML data
    $.ajax({
        type: "GET",
        url: "../DB/TodoListDB.xml",
        dataType: "xml",
        success: function(xml) {
            xmlSession = xml; // Store XML for future use
            $(xml).find("Account").each(function() {
                if ($(this).find("Username").text() === session_username) {
                    xmlResp = this;
                }
            });
        },
        error: function() {
            showAlert("Please Try Again Later!<br>Error in Loading DB", 'error');
        }
    });

    // Load data when "Load Data" button is clicked
    $(document).on("click", "#load-data", function() {
        loadData(xmlResp);
    });

    // Toggle visibility of todo icons in a list
    $(document).on("click", ".update-todo", function() {
        var button = this;
        $(this).parent().siblings("main").find("p").each(function() {
            if ($(this).find(".todo-icons").is(":hidden")) {
                $(this).find(".todo-icons").show("slow");
                $(button).val("Done");
            } else {
                $(this).find(".todo-icons").hide("slow");
                $(button).val("Update Todo");
            }
        });
    });

    // Handle actions for todo item icons
    $(document).on("click", "i", function() {
        var list_id = $(this).closest(".todo-list").attr("id");
        var todo_id = $(this).closest(".todo").attr("id");

        if ($(this).attr("name") === "check") {
            $(this).parent().siblings("i").attr("class", "fa-solid fa-circle-check green");
            $(findTodo(todo_id)).attr("completed", "true");
        } else if ($(this).attr("name") === "cancel") {
            $(this).parent().siblings("i").attr("class", "fa-solid fa-times-circle red");
            $(findTodo(todo_id)).attr("completed", "false");
        } else if ($(this).attr("name") === "delete") {
            $(this).closest(".todo").hide();
            $(findTodo(todo_id)).remove();
            showAlert("Deleted Todo!", 'success');
        } else if ($(this).attr("name") === "edit") {
            showAlert("Feature Not Added Yet!", 'neutral');
        }
    });

    // Add a new todo item to a list
    $(document).on("click", ".add-todo", function() {
        if ($(this).siblings("#todo-title").val() === "") {
            showAlert("Please give Valid Inputs!", 'error');
            $(this).siblings("#todo-title").focus();
            return false;
        }

        var list_label = $(this).closest(".todo-list").attr("id");
        var todo_label = "todo_" + (++todo_count);
        var text = $(this).siblings("#todo-title").val();
        var completed = $(this).siblings("#completed").is(":checked");

        var todoDOM = 
        `<Todo completed="${completed}" id="${todo_label}">
            ${text}
        </Todo>`;
        
        createTodo(list_label, todo_label, todoDOM);
        showAlert("Added Todo!", 'success');
        $(findList(list_label)).append(todoDOM);
        $(this).siblings("#todo-title").val("");
        $(this).siblings("#completed").prop("checked", false);
        return true;
    });

    // Delete a todo list
    $(document).on("click", ".delete-list", function() {
        var list_label = $(this).closest(".todo-list").attr("id");
        if (confirm("You sure you want to delete this List?")) {
            $("#" + list_label).hide();
            $(findList(list_label)).remove();
            showAlert("Deleted TodoList!", 'success');
        }
    });

    // Add a new todo list
    $(document).on("click", "#add-todo-list", function() {
        if ($("#todo-list-title").val() === "") {
            showAlert("Please give Valid Inputs!", 'error');
            $("#todo-list-title").focus();
            return false;
        }

        var list_label = "list_" + (++list_count);
        var title = $("#todo-list-title").val();
        var deadline = $("#todo-list-deadline").val().split("-");

        var listDOM = 
        `<TodoList id="${list_label}">
            <Title>${title}</Title>
            <Deadline>
                <Date>
                    <Day>${deadline[2]}</Day>
                    <Month>${deadline[1]}</Month>
                    <Year>${deadline[0]}</Year>
                </Date>
            </Deadline>
        </TodoList>`;
        
        createList(list_label, listDOM);
        showAlert("Added TodoList!", 'success');
        $(xmlResp).append(listDOM);
        $("#todo-list-title").val("");
        $("#todo-list-deadline").val(today);
        $("#" + list_label).focus();
        return true;
    });

    // Create a new todo list in the DOM
    function createList(list_label, element) {
        var title = $(element).find("Title").text();
        var deadline = $(element).find("Deadline").find("Date").find("Day").text() + "/"
                        + $(element).find("Deadline").find("Date").find("Month").text() + "/"
                        + $(element).find("Deadline").find("Date").find("Year").text().substring(2);

        var listDOM =
        `<div class="todo-list" id="${list_label}">
            <header>
                <h1>${title} <i class="fas fa-trash delete delete-list"></i></h1>
                <h3>Deadline: <span class="red">${deadline}</span></h3>
            </header>
            <main></main>
            <footer>
                <input type="text" name="todo-title" id="todo-title" placeholder="Enter Title">
                <label for="completed"><sub>Completed?</sub></label>
                <input type="checkbox" name="completed" id="completed">
                <input type="button" value="Add Todo" id="add-todo" class="add-todo">
                <input type="button" value="Update Todo" id="update-todo" class="update-todo">
            </footer>
        </div>`;
        
        $(".todo-lists").append(listDOM);
    }

    // Create a new todo item in the DOM
    function createTodo(parent_list_id, todo_label, element) {
        var title = $(element).text();
        var checked = $(element).attr("completed");
        var icon = (checked === "true") ?
                    `<i class="fa-solid fa-circle-check green"></i>` :
                    `<i class="fa-solid fa-times-circle red"></i>`;

        var todoDOM =
        `<p class="todo" id="${todo_label}">
            ${icon}
            <span class="todo-text">${title}</span>
            <span class="todo-icons">
                <i class="fas fa-edit" name="edit"></i>
                <i class="fas fa-check check" name="check"></i>
                <i class="fas fa-times cancel" name="cancel"></i>
                <i class="fas fa-trash delete" name="delete"></i>
            </span>
        </p>`;
        
        $("#" + parent_list_id).find("main").append(todoDOM);
    }

    // Find a todo list by ID
    function findList(list_label) {
        var element = null;
        $(xmlResp).find("TodoList").each(function() {
            if ($(this).attr("id") === list_label) {
                element = this;
            }
        });
        return element;
    }

    // Find a todo item by ID
    function findTodo(todo_label) {
        var element = null;
        $(xmlResp).find("Todo").each(function() {
            if ($(this).attr("id") === todo_label) {
                element = this;
            }
        });
        return element;
    }

    // Toggle between light and dark themes
    $('#toggle-theme').click(function() {
        $('body').toggleClass('light-theme');
        const isLightTheme = $('body').hasClass('light-theme');
        $(this).text(isLightTheme ? '🌙' : '☀️');
    });

    // Save changes to the server
    $("#update-db").click(function() {
        $.ajax({
            url: '../php/updateDB.php',
            type: 'POST',
            data: {
                xml: new XMLSerializer().serializeToString(xmlSession),
                db: '../DB/TodoListDB.xml'
            },
            success: function() {
                showAlert("Progress saved Successfully!<br>Please Restart Browser!", 'success');
            },
            error: function(xhr, status, error) {
                console.error('Error sending data to server:', error);
                showAlert("Couldn't Save Progress!<br>Error in Database.", 'error');
            }
        });
    });

    // Load data into the DOM
    function loadData(xml) {
        if ($(".todo-lists").text() !== "") {
            showAlert("Data Loaded Already!", 'neutral');
            return false;
        }
        $(xml).find("TodoList").each(function() {
            var list_label = "list_" + (++list_count);
            createList(list_label, this);
            $(this).attr("id", list_label);
            $(this).find("Todo").each(function() {
                var todo_label = "todo_" + (++todo_count);
                $(this).attr("id", todo_label);
                createTodo(list_label, todo_label, this);
            });
        });
        showAlert("Data Successfully Loaded!", 'success');
        return true;
    }
});
