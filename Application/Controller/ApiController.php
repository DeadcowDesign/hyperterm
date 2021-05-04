<?php

namespace Application\Api;

class ApiController extends \Core\Controller
{
    public function indexAction() {

        if (!isset($_GET['command'])) {
            http_response_code('404');
            echo '<p>No command supplied</p>';
        } else {

            if (!method_exists($this, $_GET['command'])) {
                
            }
        }
    }

    public function goto() {

        if (file_exists($_GET['data']))
    }
}