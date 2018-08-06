<!DOCTYPE html>
<html>
<body>
<head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

    <script>
    $(document).ready(function(){
        var working = false;
        $("#submit").click(function(){
            $.ajax({
                 type: 'GET',
                 url: "backend_handler.php",
                 data: $('#login').serialize(),
                 success: function(response) {
                    alert("Submitted comment");
                     $("div").html(response);
                 },
                error: function() { alert("There was an error submitting comment");}
            });
        });
    });
    </script>

</head>
    <body>
        <h1> Log in </h1>
        <form id="login" >
            <h2> Username </h2>
            <input name="username">

            <h2> Password </h2>
            <input name="password">

            <br><br>
            <input type="submit" id="submit">
        </form>
        <div>

        </div>
    </body>
</html>
