<?php

namespace Application\Controller;

class ApiController extends Controller
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

    public function gotoAction($data = '') {

        if ($_GET['page']) {
            $page = str_replace('/', DIRECTORY_SEPARATOR, $_GET['page']);
            echo($page);
            echo file_get_contents(BASE_PATH . DIRECTORY_SEPARATOR . $page);
        }
    }

    public function listAction($data = '') {
        var_dump($_GET);
        if ($data['directory']) {
            $dir = str_replace('%7C', DIRECTORY_SEPARATOR, $data['directory']);

            $list = scandir(BASE_PATH . DIRECTORY_SEPARATOR . $dir);
            echo '<ul>';
            foreach($list as $item) {
                $itemPath = BASE_PATH . DIRECTORY_SEPARATOR . $dir . DIRECTORY_SEPARATOR . $item;
                if (is_dir($itemPath)) {
                    echo '<li>';
                    echo 'dir... ' . $item;
                    echo '</li>';
                } else {
                    if (preg_match('/\.html$/', $item)) {
                        echo '<li>';
                        echo 'page...' . $item;
                        echo '</li>';
                    }
                }
            }

            echo '</ul>';
        }
    }

}