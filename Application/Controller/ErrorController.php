<?php

namespace Application\Controller;

class ErrorController extends Controller {

    function notFoundAction() {

        print_r("<h1>That's a fail, right there dude.</h1>");
    }
}