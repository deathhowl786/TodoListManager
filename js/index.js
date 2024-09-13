

$(document).ready(function() {
    // Hiding all fas icons.
    $(".val-icon").hide();

    //Theme Change Button
    $('#toggle-theme').click(function() {
        $('body').toggleClass('dark-theme');
        $('body').toggleClass('light-theme');
        $(this).text($(this).text() === '☀️' ? '🌙' : '☀️');
    });

    //Show Password Button
    $(document).on("click", "#eye-btn", function(){
        if($(this).attr("class")==="fa-solid fa-eye"){
            $("#password").attr("type", "text");
            $(this).attr("class", "fa-solid fa-eye-slash");
        }else{
            $("#password").attr("type", "password");
            $(this).attr("class", "fa-solid fa-eye");
        }
    })

    //Login Details and Database
    xmlResp = null;
    xmlResp2 = null;
    accounts = null;

    $.ajax({
        type: "GET",
        url: "./DB/AccountsDB.xml",
        dataType: "xml",
        success: function(xml){
            //storing xml in a global variable for future usage.
            xmlResp = xml;
            accounts = getAccounts();
            // console.log(accounts);
            // console.log(xmlResp);
        },
        error: function(e){
            showAlert("Please Try Again Later!" + "<br>Error in Loading Database", "error");
        }
    })

    $.ajax({
        type: "GET",
        url: "./DB/TodoListDB.xml",
        dataType: "xml",
        success: function(xml){
            //storing xml in a global variable for future usage.
            xmlResp2 = xml;
            // console.log(xmlResp2);
        },
        error: function(e){
            showAlert("Please Try Again Later!" + "<br>Error in Loading Database", "error");
        }
    })


    //Login Button
    $(document).on("click", "#login-btn", function(){
        var username = $("#username").val();
        var password = $("#password").val();

        //Form Validation
        if(!checkValidity(username, password)){
            return false;
        }
        
        //Checking if User Exists
        if(username in accounts){
            if(accounts[username]===password){
                console.log("Welcome, " + username);
                localStorage.setItem('username', username);
                window.location.href = './html/app.html';
                return true;
            }else{
                showAlert("Incorrect Password!", "error");
                // alert("Incorrect Password!");
                return false;
            }
        }else{
            showAlert("User Doesn't Exist!", "error");
            // alert("User Doesn't Exist!");
            return false;
        }


    });

    $(document).on("keyup", ".inp", function(){
        pattern = ($(this).attr("id")==="username")
                    ?/^[a-z0-9_]{6,20}$/i
                    :/^[^ ]{6,20}$/;
        if(pattern.test($(this).val())){
            $(this).siblings(".fa-exclamation-circle").hide();
            $(this).siblings(".fa-check-circle").show();
        }
        else{
            $(this).siblings(".fa-check-circle").hide();
            $(this).siblings(".fa-exclamation-circle").show();
        }
    })


    //Signup
    $(document).on("click", "#signup-btn", function(){
        var username = $("#username").val();
        var password = $("#password").val();
        if(!checkValidity(username, password)){
            return false;
        }

        if(!(username in accounts)){
            xmlDOM = 
            `
            <Account>
                <Username>`+username+`</Username>
                <Password>`+password+`</Password>
            </Account>
            `;
            xmlDOM2 = 
            `<Account>
            <Username>`+username+`</Username>
            </Account>`;
            
            $(xmlResp).find("Accounts").append(xmlDOM);
            $(xmlResp2).find("TodoListManager").append(xmlDOM2);
        

            updateDB('./php/updateDB.php', '../DB/AccountsDB.xml', xmlResp);
            updateDB('./php/updateDB.php', '../DB/TodoListDB.xml', xmlResp2);

            localStorage.setItem('username', username);
            window.location.href = './html/app.html';
            
        }else{
            showAlert("User Already Exist!", "error");
            return false;
        }
        

    });

    //Fetching Accounts from DB.
    function getAccounts(){
        acc_deets = {};
        $(xmlResp).find("Account").each(function(){
            var username = $(this).find("Username").text();
            var password = $(this).find("Password").text();
            acc_deets[username] = password;
        });
        return acc_deets;
    }

    //Form Validation Function.
    function checkValidity(username, password){
        var user_pattern = /^[a-z0-9_]{6,20}$/i;
        var pass_pattern = /^[^ ]{6,20}$/;

        if(user_pattern.test(username)){
            if(pass_pattern.test(password)){
                return true;
            }else{
                showAlert("Please Enter Valid Password!<br>[Spaces are not Allowed]", 'error');
                return false;
            }
        }else{
            showAlert("Please Enter Valid Username !<br>[Spaces are not Allowed]<br>[Only Letters, Numbers and '_' ].", 'error');
            return false;
        }
    }

    // DataBase Update Function.
    function updateDB(file, db_name, resp){
        $.ajax({
            url: file,
            type: 'POST',
            data: {
                xml: new XMLSerializer().serializeToString(resp),
                db : db_name
            },
            success: function(response){
                showAlert("User has been Created!", "success");
            },
            error: function(xhr, status, error) {
                showAlert("Error in creating User", "error");
            }
        });
    }
});
