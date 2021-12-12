<?php

namespace Core;

/**
 * Autoloader - responsible for autoloading classes
 *
 * @author  James Filby <jim@deadcowdesign.co.uk>
 * @copyright 2016
 *
 */
class Autoloader
{

    public static function load($class = null)
    {

        $filename = BASE_PATH . '/' . str_replace('\\', '/', $class) . ".php";

        if (file_exists($filename)) {

            require_once($filename);

            if (class_exists($class)) {

                return true;
            }
        }

        return false;
    }
}

spl_autoload_register('core\autoloader::load');
