<?php

namespace Application\Controller;


class HomeController extends Controller {

    public function indexAction($data = null) {

    	echo file_get_contents('./templates/index.html');
    }
}